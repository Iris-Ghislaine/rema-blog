import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("files[0]") as File

    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: base64,
          upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        }),
      }
    )

    const data = await res.json()
    return NextResponse.json({ url: data.secure_url || "" })
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

export const config = {
  api: { bodyParser: false },
}