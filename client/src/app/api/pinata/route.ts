import { NextResponse, NextRequest } from "next/server";

export const config = {
  api: {
    bodyParser: false, // Importante para manejar archivos
  },
};

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // Validar que la clave de Pinata exista
    if (!process.env.PINATA_JWT) {
        console.error("❌ Error: Falta PINATA_JWT en .env.local");
        return NextResponse.json({ error: "Server Config Error: Missing JWT" }, { status: 500 });
    }

    // Si es JSON (Metadatos: Título, Descripción...)
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
    
    // Si es Archivo (La Imagen - Multipart)
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