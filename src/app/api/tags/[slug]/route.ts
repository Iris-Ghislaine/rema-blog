import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1")
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const tag = await prisma.tag.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    })

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 })
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: {
          published: true,
          deletedAt: null,
          tags: {
            some: {
              tag: {
                slug,
              },
            },
          },
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
          tags: {
            some: {
              tag: {
                slug,
              },
            },
          },
        },
      }),
    ])

    return NextResponse.json({
      tag,
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Tag posts fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch tag posts" },
      { status: 500 }
    )
  }
}

