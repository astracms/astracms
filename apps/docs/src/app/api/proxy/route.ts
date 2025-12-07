import { type NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
    "https://api.astracms.dev",
    "https://docs.astracms.dev",
    "http://localhost:3000",
    "http://localhost:8787",
];

async function handleProxy(request: NextRequest) {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    // Validate the URL is from an allowed origin
    const parsedUrl = new URL(url);
    const isAllowed = ALLOWED_ORIGINS.some(origin => url.startsWith(origin));

    if (!isAllowed) {
        return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
    }

    // Clone headers but remove Accept-Encoding to prevent compressed responses
    const headers = new Headers();
    for (const [key, value] of request.headers.entries()) {
        // Skip headers that shouldn't be forwarded
        if (["host", "accept-encoding", "connection"].includes(key.toLowerCase())) {
            continue;
        }
        headers.set(key, value);
    }

    // Request uncompressed content from upstream
    headers.set("Accept-Encoding", "identity");

    try {
        const response = await fetch(url, {
            method: request.method,
            headers,
            body: request.method !== "GET" && request.method !== "HEAD" ? await request.text() : undefined,
        });

        // Create response headers, excluding content-encoding to prevent browser confusion
        const responseHeaders = new Headers();
        for (const [key, value] of response.headers.entries()) {
            // Skip content-encoding and transfer-encoding headers
            if (["content-encoding", "transfer-encoding", "content-length"].includes(key.toLowerCase())) {
                continue;
            }
            responseHeaders.set(key, value);
        }

        // Add CORS headers
        responseHeaders.set("Access-Control-Allow-Origin", "*");
        responseHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, PUT, POST, PATCH, DELETE, OPTIONS");
        responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

        const body = await response.arrayBuffer();

        return new NextResponse(body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json(
            { error: "Failed to fetch from upstream" },
            { status: 502 }
        );
    }
}

export async function GET(request: NextRequest) {
    return handleProxy(request);
}

export async function HEAD(request: NextRequest) {
    return handleProxy(request);
}

export async function POST(request: NextRequest) {
    return handleProxy(request);
}

export async function PUT(request: NextRequest) {
    return handleProxy(request);
}

export async function PATCH(request: NextRequest) {
    return handleProxy(request);
}

export async function DELETE(request: NextRequest) {
    return handleProxy(request);
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, HEAD, PUT, POST, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
}
