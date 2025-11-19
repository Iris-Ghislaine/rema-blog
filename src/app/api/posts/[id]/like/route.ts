import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserIdFromRequest } from "@/lib/auth"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const postId = parseInt(id)

    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
    }

    // Check if like already exists
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_authorId: {
          postId,
          authorId: userId,
        },
      },
    })

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      })

      const count = await prisma.like.count({ where: { postId } })
      return NextResponse.json({ liked: false, count })
    } else {
      // Like
      await prisma.like.create({
        data: {
          postId,
          authorId: userId,
        },
      })

      const count = await prisma.like.count({ where: { postId } })
      return NextResponse.json({ liked: true, count })
    }
  } catch (error) {
    console.error("Like toggle error:", error)
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromRequest(req)
    const { id } = await params
    const postId = parseInt(id)

    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
    }

    const count = await prisma.like.count({ where: { postId } })
    const liked = userId
      ? !!(await prisma.like.findUnique({
          where: {
            postId_authorId: {
              postId,
              authorId: userId,
            },
          },
        }))
      : false

    return NextResponse.json({ liked, count })
  } catch (error) {
    console.error("Like status error:", error)
    return NextResponse.json(
      { error: "Failed to get like status" },
      { status: 500 }
    )
  }
}

