import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"

export const revalidate = 10 // Refresh every 10 seconds

export default async function Home() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-white text-center mb-4">Rema Blog</h1>
        <p className="text-emerald-300 text-center text-xl mb-12">Read stories from Rwanda</p>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-emerald-200">No posts yet. Be the first to write!</p>
            <Link href="/write" className="mt-6 inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition">
              Write Your First Post
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link href={`/post/${post.id}`} key={post.id} className="block group">
                <div className="glass rounded-2xl overflow-hidden shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
                  {post.coverImage ? (
                    <div className="relative h-64">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="h-64 bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center">
                      <span className="text-6xl font-bold text-white opacity-30">{post.title[0]}</span>
                    </div>
                  )}

                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-300 transition">
                      {post.title}
                    </h2>
                    <p className="text-emerald-200 text-sm mb-4 line-clamp-2">
                      {post.content.replace(/<[^>]*>/g, "").slice(0, 120)}...
                    </p>
                    <div className="flex items-center justify-between text-sm text-emerald-300">
                      <span>{post.author.name || "Anonymous"}</span>
                      <span>{new Date(post.createdAt).toLocaleDateString("en-GB")}</span>
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