// src/app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(req: NextRequest) {
  // Fix: Get token from Authorization header properly
  const authHeader = req.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader

  if (!token) {
    return NextResponse.json({ error: "No token" }, { status: 401 })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number }
    const { title, content } = await req.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content required" }, { status: 400 })
    }

    // FIX: Model is Post (capital P)
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: decoded.id,
        published: true,
      },
    })

    return NextResponse.json({ success: true, post }, { status: 201 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Publish error:", error.message)
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}