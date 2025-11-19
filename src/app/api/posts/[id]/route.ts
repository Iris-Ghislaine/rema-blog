// src/app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserIdFromRequest } from "@/lib/auth"
import slugify from "slugify"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserIdFromRequest(req)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const postId = Number(id)

    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
    }

    await prisma.post.update({
      where: { id: postId, authorId: userId },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserIdFromRequest(req)
  const { id } = await params
  const postId = Number(id)

  if (isNaN(postId)) {
    return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId, deletedAt: null },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // If user is the author, allow access even if unpublished
    // Otherwise, only show published posts
    if (!post.published && post.authorId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // If user is author, include unpublished posts
    const isAuthor = userId === post.authorId

    return NextResponse.json({ post, isAuthor })
  } catch (error) {
    console.error("Get post error:", error)
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserIdFromRequest(req)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const postId = Number(id)

    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
    }

    const { title, content, coverImage, tags, excerpt } = await req.json()

    // Delete existing tags
    await prisma.postTag.deleteMany({
      where: { postId },
    })

    // Create new tags if provided
    const tagConnections =
      tags && tags.length > 0
        ? {
            create: await Promise.all(
              (tags as string[]).map(async (tagName: string) => {
                const tagSlug = slugify(tagName, { lower: true, strict: true })
                const tag = await prisma.tag.upsert({
                  where: { slug: tagSlug },
                  update: {},
                  create: {
                    name: tagName,
                    slug: tagSlug,
                  },
                })
                return { tagId: tag.id }
              })
            ),
          }
        : undefined

    const slug = title ? slugify(title, { lower: true, strict: true }) : undefined

    const post = await prisma.post.update({
      where: { id: postId, authorId: userId },
      data: {
        ...(title && { title, slug }),
        ...(content !== undefined && { content }),
        ...(coverImage !== undefined && { coverImage }),
        ...(excerpt !== undefined && { excerpt }),
        ...(tagConnections && { tags: tagConnections }),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Update error:", error)
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
  }
}
