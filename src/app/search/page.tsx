"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const page = parseInt(searchParams.get("page") || "1")

  const { data, isLoading } = useQuery({
    queryKey: ["search", query, page],
    queryFn: async () => {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&page=${page}&limit=10`
      )
      return res.json()
    },
    enabled: query.length > 0,
  })

  if (!query) {
    return (
      <div className="min-h-screen py-12 px-6 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Search Posts</h1>
          <p className="text-gray-400">Enter a search query to find posts</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          Search Results for &quot;{query}&quot;
        </h1>

        {isLoading ? (
          <p className="text-gray-400 text-center py-12">Searching...</p>
        ) : data?.posts?.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No posts found</p>
        ) : (
          <>
            <div className="space-y-6 mb-8">
              {data?.posts?.map((post: any) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="block glass p-6 rounded-2xl hover:shadow-emerald-500/30 transition-all"
                >
                  <h2 className="text-2xl font-bold text-white mb-3">
                    {post.title}
                  </h2>
                  <p className="text-gray-300 mb-4 line-clamp-2">
                    {post.content.replace(/<[^>]*>/g, "").slice(0, 200)}...
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{post.author?.name || "Anonymous"}</span>
                    <span>•</span>
                    <span>{format(new Date(post.createdAt), "MMM d, yyyy")}</span>
                    {post._count && (
                      <>
                        <span>•</span>
                        <span>{post._count.likes} likes</span>
                        <span>•</span>
                        <span>{post._count.comments} comments</span>
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <Link
                      key={p}
                      href={`/search?q=${encodeURIComponent(query)}&page=${p}`}
                      className={`px-4 py-2 rounded-lg ${
                        p === page
                          ? "bg-emerald-600 text-white"
                          : "bg-white/10 text-gray-300 hover:bg-white/20"
                      }`}
                    >
                      {p}
                    </Link>
                  )
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-12 px-6 bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900"><div className="max-w-4xl mx-auto text-center"><p className="text-gray-400">Loading...</p></div></div>}>
      <SearchContent />
    </Suspense>
  )
}

