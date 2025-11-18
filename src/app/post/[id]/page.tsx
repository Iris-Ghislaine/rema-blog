/* eslint-disable @next/next/no-html-link-for-pages */
// src/app/post/[id]/page.tsx
import { prisma } from "@/lib/prisma"
import Image from "next/image"
import { notFound } from "next/navigation"
import { format } from "date-fns"

// THIS IS THE KEY CHANGE
type Props = {
  params: Promise<{ id: string }>  // ← Promise!
}

export const revalidate = 10

export default async function PostPage(props: Props) {
  // ← MUST AWAIT params!
  const params = await props.params
  const postId = Number(params.id)

  if (isNaN(postId)) {
    notFound()
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { author: true },
  })

  if (!post || !post.published) {
    notFound()
  }

  return (
    <article className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative h-96 md:h-[70vh] rounded-3xl overflow-hidden mb-16 shadow-2xl">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>
        )}

        <div className="glass p-10 md:p-16 rounded-3xl -mt-32 md:-mt-48 relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-6 text-emerald-300 mb-12">
            <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {post.author.name?.[0] || "A"}
            </div>
            <div>
              <p className="font-bold text-xl text-white">{post.author.name || "Anonymous"}</p>
              <p className="text-emerald-400 text-lg">
                {format(new Date(post.createdAt), "MMMM d, yyyy")}
              </p>
            </div>
          </div>

          <div className="prose prose-invert prose-lg max-w-none text-white/90 leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </div>

        <div className="text-center mt-16">
          <a
            href="/"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-5 rounded-xl text-xl font-bold transition shadow-2xl"
          >
            Back to All Posts
          </a>
        </div>
      </div>
    </article>
  )
}