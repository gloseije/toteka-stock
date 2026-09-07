import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET_NAME } from "@/lib/r2";

export async function GET(req: Request, { params }: { params: Promise<{ key: string[] }> }) {
    let key = "unknown";
    try {
        const keyArray = (await params).key;
        key = keyArray.join("/");
        console.log("[IMAGE_PROXY] Fetching key:", key);

        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        const response = await r2.send(command);

        if (!response.Body) {
            console.warn("[IMAGE_PROXY] Body is empty for key:", key);
            return new NextResponse("Not Found", { status: 404 });
        }

        // Convert ReadableStream to Response
        const data = await response.Body.transformToByteArray();
        console.log(`[IMAGE_PROXY] Success: ${key} (${data.length} bytes)`);

        return new NextResponse(Buffer.from(data), {
            headers: {
                "Content-Type": response.ContentType || "application/octet-stream",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        if (error instanceof Error && error.name === "NoSuchKey") {
            console.warn("[IMAGE_PROXY] Key not found:", key);
            return new NextResponse("Not Found", { status: 404 });
        }
        console.error("[IMAGE_PROXY_ERROR] for key:", key, error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
