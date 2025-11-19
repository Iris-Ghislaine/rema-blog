import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import type { Metadata } from "next"

type Props = {
  params: Promise<{ slug: string }>
}

export const revalidate = 60

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const tag = await prisma.tag.findUnique({
    where: { slug: params.slug },
  })

  if (!tag) {
    return {}
  }

  return {
    title: `#${tag.name} - Rema-Blog`,
    description: `Posts tagged with ${tag.name}`,
  }
}

export default async function TagPage(props: Props) {
  const params = await props.params
  const tag = await prisma.tag.findUnique({
    where: { slug: params.slug },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  })

  if (!tag) {
    notFound()
  }

  const posts = await prisma.post.findMany({
    where: {
      published: true,
      deletedAt: null,
      tags: {
        some: {
          tag: {
            slug: params.slug,
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
    take: 20,
  })

  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            #{tag.name}
          </h1>
          <p className="text-xl text-emerald-300">
            {tag._count.posts} post{tag._count.posts !== 1 ? "s" : ""}
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No posts found</p>
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
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                        {post.author.name?.[0] || "A"}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-xs">
                          {post.author.name || "Anonymous"}
                        </p>
                        <p className="text-emerald-400 text-xs">
                          {format(new Date(post.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="text-emerald-400 text-xs">
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

