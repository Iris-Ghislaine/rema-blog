import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        posts: {
          _count: "desc",
        },
      },
      include: {
        _count: {
          select: { posts: true },
        },
      },
      take: 50,
    })

    return NextResponse.json({ tags })
  } catch (error) {
    console.error("Tags fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 })
  }
}

