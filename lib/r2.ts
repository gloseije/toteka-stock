import { S3Client } from "@aws-sdk/client-s3";

// Stockage local (RustFS) tant qu'aucun vrai compte R2 n'est configuré,
// indépendamment de NODE_ENV — permet de tester `next start` en local.
const accountId = process.env.R2_ACCOUNT_ID;
export const isLocalStorage =
    !accountId || accountId === "local_dummy_id";
const isLocal = isLocalStorage;

export const r2 = new S3Client({
    region: "auto",
    endpoint: isLocal
        ? "http://localhost:9000"
        : `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: isLocal, // Indispensable pour RustFS / MinIO en local
});

export const BUCKET_NAME = process.env.R2_BUCKET_NAME || "toteka-stock";
