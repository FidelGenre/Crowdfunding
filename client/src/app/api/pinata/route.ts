import { NextResponse, NextRequest } from "next/server";

/**
 * Route Configuration
 * We disable the default bodyParser to handle raw file uploads (multipart/form-data) 
 * manually, which is more efficient for IPFS pinning.
 */
export const config = {
  api: {
    bodyParser: false, 
  },
};

/**
 * POST Handler
 * Proxies requests to Pinata to avoid exposing the JWT on the client side.
 * Handles both JSON (campaign metadata) and Multipart (campaign images).
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // Security Check: Verify that the Pinata JWT is configured in environment variables
    if (!process.env.PINATA_JWT) {
        console.error("❌ Error: PINATA_JWT is missing in .env.local");
        return NextResponse.json({ error: "Server Config Error: Missing JWT" }, { status: 500 });
    }

    // --- CASE 1: JSON METADATA ---
    // Handles pinning campaign details (Title, Description, Category, Image URL)
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return NextResponse.json(data);
    } 
    
    // --- CASE 2: MULTIPART FILE ---
    // Handles pinning the actual image file to IPFS
    else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
        body: formData,
      });
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Unsupported Content-Type" }, { status: 400 });

  } catch (e) {
    console.error("Server Error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}