import {
    PutObjectCommand,
    DeleteObjectCommand,
    CreateBucketCommand,
    HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, BUCKET_NAME, isLocalStorage } from "./r2";

/**
 * S'assure que le bucket existe (utile pour Rustfs en local)
 */
async function ensureBucketExists() {
    if (!isLocalStorage) return;

    try {
        await r2.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
    } catch (error) {
        const isNotFound = error instanceof Error && error.name === "NotFound";
        const has404Status = typeof error === "object" && error !== null && "$metadata" in error && (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404;
        
        if (isNotFound || has404Status) {
            console.log(`[STORAGE] Creating bucket: ${BUCKET_NAME}`);
            await r2.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
        }
    }
}

/**
 * Génère une URL présignée pour uploader un fichier directement vers R2/Rustfs.
 */
export async function getUploadUrl(contentType: string) {
    await ensureBucketExists();
    const key = `uploads/${crypto.randomUUID()}`;
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    const url = await getSignedUrl(r2, command, { expiresIn: 3600 });

    // Pour Rustfs en local, l'URL retournée par getSignedUrl peut utiliser localhost:9000
    // Si c'est en production (R2), ce sera l'URL cloudflare.

    return { url, key };
}

/**
 * Supprime un objet de R2/Rustfs via sa clé.
 */
export async function deleteFromR2(key: string) {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });
    await r2.send(command);
}

/**
 * Retourne l'URL publique d'un objet.
 * En local avec Rustfs, c'est l'URL http://localhost:9000/BUCKET/KEY
 * En prod R2, c'est généralement via un worker ou un domaine custom.
 */
export function getPublicUrl(key: string) {
    // R2_ACCOUNT_ID est une variable serveur : absente dans les bundles
    // client et non configurée tant qu'on tourne sur RustFS. Dans ces
    // cas, on sert l'image via le proxy API (marche en dev et en prod local).
    if (isLocalStorage) {
        return `/api/images/${key}`;
    }

    // TODO: Configurer le domaine R2 public ou un worker proxy
    return `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET_NAME}/${key}`;
}
