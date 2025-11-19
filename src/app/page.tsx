// src/app/page.tsx
import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"

export const revalidate = 10 // Refresh every 10 seconds

export default async function Home() {
  const posts = await prisma.post.findMany({
    where: { published: true, deletedAt: null },
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
    orderBy: { createdAt: "desc" },
    take: 20,
  })
  
  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
            Rema<span className="text-emerald-400">Blog</span>
          </h1>
          <p className="text-xl md:text-2xl text-emerald-300 max-w-3xl mx-auto">
            Stories, ideas, and inspiration from Rwanda and beyond
          </p>
        </div>

        {/* No Posts State */}
        {posts.length === 0 ? (
          <div className="text-center py-32">
            <div className="text-6xl mb-8">No stories yet...</div>
            <p className="text-2xl text-emerald-300 mb-10">
              Be the first to share your voice with the world
            </p>
            <Link
              href="/write"
              className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xl font-bold px-12 py-6 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Write Your First Story
            </Link>
          </div>
        ) : (
          /* Posts Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((post) => (
              <Link href={`/post/${post.id}`} key={post.id}>
                <article className="group glass rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-500 transform hover:-translate-y-3 cursor-pointer">
                  {/* Cover Image */}
                  <div className="relative h-64 overflow-hidden">
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="h-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center">
                        <span className="text-8xl font-bold text-white opacity-40">
                          {post.title[0]}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 line-clamp-2 group-hover:text-emerald-400 transition">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-emerald-200 text-base mb-6 line-clamp-3 opacity-90">
                      {post.content.replace(/<[^>]*>/g, "").slice(0, 140)}...
                    </p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((postTag) => (
                          <span
                            key={postTag.tag.id}
                            className="px-2 py-1 bg-emerald-600/20 text-emerald-300 rounded-full text-xs"
                          >
                            #{postTag.tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Author & Date */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {post.author.name?.[0] || "A"}
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            {post.author.name || "Anonymous"}
                          </p>
                          <p className="text-emerald-400">
                            {format(new Date(post.createdAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-medium group-hover:translate-x-2 transition block">
                          Read →
                        </span>
                        {post._count && (
                          <span className="text-xs text-gray-400">
                            {post._count.likes} ❤️ • {post._count.comments} 💬
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}