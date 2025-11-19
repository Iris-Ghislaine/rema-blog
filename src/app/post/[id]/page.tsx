/* eslint-disable @next/next/no-html-link-for-pages */
// src/app/post/[id]/page.tsx
import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import type { Metadata } from "next"
import Comments from "@/components/Comments"
import LikeButton from "@/components/LikeButton"
import FollowButton from "@/components/FollowButton"

type Props = {
  params: Promise<{ id: string }>
}

export const revalidate = 10

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const postId = Number(params.id)

  if (isNaN(postId)) {
    return {}
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { author: true },
  })

  if (!post || !post.published || post.deletedAt) {
    return {}
  }

  const excerpt = post.excerpt || post.content.replace(/<[^>]*>/g, "").slice(0, 160)

  return {
    title: post.title,
    description: excerpt,
    openGraph: {
      title: post.title,
      description: excerpt,
      images: post.coverImage ? [post.coverImage] : [],
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      authors: [post.author.name || "Anonymous"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    },
  }
}

export default async function PostPage(props: Props) {
  const params = await props.params
  const postId = Number(params.id)

  if (isNaN(postId)) {
    notFound()
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: true,
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

  if (!post || !post.published || post.deletedAt) {
    notFound()
  }

  return (
    <article className="min-h-screen py-12 px-6 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
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

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((postTag) => (
                <Link
                  key={postTag.tag.id}
                  href={`/tag/${postTag.tag.slug}`}
                  className="px-3 py-1 bg-emerald-600/20 text-emerald-300 rounded-full text-sm hover:bg-emerald-600/30 transition"
                >
                  #{postTag.tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Author Info */}
          <div className="flex items-center justify-between mb-12 pb-8 border-b border-white/10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {post.author.name?.[0] || "A"}
              </div>
              <div>
                <Link
                  href={`/author/${post.author.id}`}
                  className="font-bold text-xl text-white hover:text-emerald-400 transition block"
                >
                  {post.author.name || "Anonymous"}
                </Link>
                <p className="text-emerald-400 text-lg">
                  {format(new Date(post.createdAt), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
            <FollowButton userId={post.author.id} />
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none text-white/90 leading-relaxed mb-12">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-8 border-t border-white/10">
            <LikeButton postId={post.id} />
            <div className="text-gray-400">
              {post._count.comments} comment{post._count.comments !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12">
          <Comments postId={post.id} />
        </div>

        {/* Back Button */}
        <div className="text-center mt-16">
          <Link
            href="/"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-5 rounded-xl text-xl font-bold transition shadow-2xl"
          >
            Back to All Posts
          </Link>
        </div>
      </div>
    </article>
  )
}