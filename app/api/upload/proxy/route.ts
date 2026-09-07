import { NextResponse } from "next/server";

export async function PUT(req: Request) {
    try {
        const url = req.headers.get("x-upload-url");
        if (!url) {
            return new NextResponse("Missing x-upload-url header", { status: 400 });
        }

        const contentType = req.headers.get("content-type");
        const body = await req.arrayBuffer();

        console.log("[UPLOAD_PROXY] Proxying PUT to:", url);
        const res = await fetch(url, {
            method: "PUT",
            body: body,
            headers: {
                "Content-Type": contentType || "application/octet-stream",
                Host: "localhost:9000",
            },
            duplex: "half",
        } as RequestInit);

        if (!res.ok) {
            const errorText = await res.text();
            console.error("[UPLOAD_PROXY_ERROR]", errorText);
            return new NextResponse(errorText, { status: res.status });
        }

        return new NextResponse(null, { status: 200 });
    } catch (error) {
        console.error("[UPLOAD_PROXY_FATAL]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
