import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserIdFromRequest } from "@/lib/auth"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const followerId = getUserIdFromRequest(req)
    if (!followerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const followingId = parseInt(id)

    if (isNaN(followingId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    if (followerId === followingId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      )
    }

    // Check if follow already exists
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    })

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: {
          id: existingFollow.id,
        },
      })

      const followerCount = await prisma.follow.count({
        where: { followingId },
      })
      const followingCount = await prisma.follow.count({
        where: { followerId },
      })

      return NextResponse.json({
        following: false,
        followerCount,
        followingCount,
      })
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
      })

      const followerCount = await prisma.follow.count({
        where: { followingId },
      })
      const followingCount = await prisma.follow.count({
        where: { followerId },
      })

      return NextResponse.json({
        following: true,
        followerCount,
        followingCount,
      })
    }
  } catch (error) {
    console.error("Follow toggle error:", error)
    return NextResponse.json(
      { error: "Failed to toggle follow" },
      { status: 500 }
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromRequest(req)
    const { id } = await params
    const targetUserId = parseInt(id)

    if (isNaN(targetUserId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const followerCount = await prisma.follow.count({
      where: { followingId: targetUserId },
    })
    const followingCount = await prisma.follow.count({
      where: { followerId: targetUserId },
    })

    const following =
      userId && userId !== targetUserId
        ? !!(await prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: userId,
                followingId: targetUserId,
              },
            },
          }))
        : false

    return NextResponse.json({
      following,
      followerCount,
      followingCount,
    })
  } catch (error) {
    console.error("Follow status error:", error)
    return NextResponse.json(
      { error: "Failed to get follow status" },
      { status: 500 }
    )
  }
}

