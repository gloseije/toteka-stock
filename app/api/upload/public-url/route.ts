import { NextResponse } from "next/server";
import { getPublicUrl } from "@/lib/storage-actions";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const key = searchParams.get("key");

        if (!key) {
            return new NextResponse("Key is required", { status: 400 });
        }

        const publicUrl = getPublicUrl(key);

        return NextResponse.json({ publicUrl });
    } catch (error) {
        console.error("[UPLOAD_PUBLIC_URL_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
