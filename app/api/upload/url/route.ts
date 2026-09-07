import { NextResponse } from "next/server";
import { getUploadUrl } from "@/lib/storage-actions";
// import { auth } from "@/lib/auth"; // À adapter selon l'implémentation d'auth

export async function POST(req: Request) {
    try {
        // Optionnel : vérifier l'authentification
        // const session = await auth();
        // if (!session) return new NextResponse("Unauthorized", { status: 401 });

        const { contentType } = await req.json();
        if (!contentType) {
            return new NextResponse("Content-Type is required", { status: 400 });
        }

        const { url, key } = await getUploadUrl(contentType);

        return NextResponse.json({ url, key });
    } catch (error) {
        console.error("[UPLOAD_URL_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
