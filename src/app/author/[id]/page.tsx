import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import type { Metadata } from "next"
import FollowButton from "@/components/FollowButton"

type Props = {
  params: Promise<{ id: string }>
}

export const revalidate = 60

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const userId = parseInt(params.id)

  if (isNaN(userId)) {
    return {}
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    return {}
  }

  return {
    title: `${user.name || "Author"} - Rema-Blog`,
    description: user.bio || `Posts by ${user.name || "Anonymous"}`,
  }
}

export default async function AuthorPage(props: Props) {
  const params = await props.params
  const userId = parseInt(params.id)

  if (isNaN(userId)) {
    notFound()
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  const posts = await prisma.post.findMany({
    where: {
      authorId: userId,
      published: true,
      deletedAt: null,
    },
    include: {
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
    take: 20,
  })

  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Author Header */}
        <div className="glass p-8 rounded-3xl mb-12">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {user.name?.[0] || "A"}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {user.name || "Anonymous"}
                  </h1>
                  {user.bio && (
                    <p className="text-gray-300 text-lg mb-4">{user.bio}</p>
                  )}
                </div>
                <FollowButton userId={user.id} />
              </div>
              <div className="flex gap-6 text-gray-400">
                <div>
                  <span className="font-bold text-white">{posts.length}</span>{" "}
                  Posts
                </div>
                <div>
                  <span className="font-bold text-white">
                    {user._count.followers}
                  </span>{" "}
                  Followers
                </div>
                <div>
                  <span className="font-bold text-white">
                    {user._count.following}
                  </span>{" "}
                  Following
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No posts yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="group glass rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-500 transform hover:-translate-y-3"
              >
                {post.coverImage ? (
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="h-64 bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center">
                    <span className="text-8xl font-bold text-white opacity-40">
                      {post.title[0]}
                    </span>
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-3 line-clamp-2 group-hover:text-emerald-400 transition">
                    {post.title}
                  </h2>
                  <p className="text-emerald-200 text-sm mb-4 line-clamp-3">
                    {post.content.replace(/<[^>]*>/g, "").slice(0, 120)}...
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-emerald-400">
                      {format(new Date(post.createdAt), "MMM d, yyyy")}
                    </p>
                    <div className="text-emerald-400">
                      {post._count.likes} ❤️ • {post._count.comments} 💬
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

