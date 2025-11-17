import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("files[0]") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const cloudinaryFormData = new FormData()
    cloudinaryFormData.append("file", file)
    cloudinaryFormData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      }
    )

    const data = await res.json()

    if (data.secure_url) {
      return NextResponse.json({ url: data.secure_url })
    } else {
      console.error("Cloudinary error:", data)
      return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}