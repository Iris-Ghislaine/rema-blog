// src/app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number }

    const { title, content } = await req.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content required" }, { status: 400 })
    }

    // Create post in database
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: decoded.id,
      },
    })

    return NextResponse.json({ success: true, post }, { status: 201 })
  } catch (error) {
    console.error("Publish error:", error)
    return NextResponse.json({ error: "Invalid token or server error" }, { status: 401 })
  }
}