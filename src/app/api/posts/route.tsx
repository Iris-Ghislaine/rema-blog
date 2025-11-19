// src/app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserIdFromRequest } from "@/lib/auth"
import slugify from "slugify"

export async function POST(req: NextRequest) {
  const userId = getUserIdFromRequest(req)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { title, content, coverImage, tags, excerpt } = await req.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content required" },
        { status: 400 }
      )
    }

    const slug = slugify(title, { lower: true, strict: true })

    // Create post with tags
    const post = await prisma.post.create({
      data: {
        title,
        content,
        coverImage: coverImage || null,
        excerpt: excerpt || null,
        slug,
        authorId: userId,
        published: true,
        tags: tags && tags.length > 0 ? {
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
        } : undefined,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, post }, { status: 201 })
  } catch (error: any) {
    console.error("Publish error:", error.message)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          published: true,
          deletedAt: null,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
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
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.post.count({
        where: {
          published: true,
          deletedAt: null,
        },
      }),
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Posts fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}