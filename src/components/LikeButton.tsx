"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

interface LikeButtonProps {
  postId: number
}

export default function LikeButton({ postId }: LikeButtonProps) {
  const queryClient = useQueryClient()
  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null)
  const [optimisticCount, setOptimisticCount] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["like", postId],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${postId}/like`)
      const data = await res.json()
      return data as { liked: boolean; count: number }
    },
  })

  const toggleLike = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Please sign in to like posts")
      }

      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to like post")
      }

      return res.json()
    },
    onMutate: async () => {
      // Optimistic update
      if (data) {
        const newLiked = !data.liked
        const newCount = newLiked ? data.count + 1 : data.count - 1
        setOptimisticLiked(newLiked)
        setOptimisticCount(newCount)

        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: ["like", postId] })

        // Snapshot previous value
        const previous = queryClient.getQueryData(["like", postId])

        // Optimistically update
        queryClient.setQueryData(["like", postId], {
          liked: newLiked,
          count: newCount,
        })

        return { previous }
      }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(["like", postId], context.previous)
      }
      setOptimisticLiked(null)
      setOptimisticCount(null)
    },
    onSuccess: (newData) => {
      queryClient.setQueryData(["like", postId], newData)
      setOptimisticLiked(null)
      setOptimisticCount(null)
    },
  })

  const handleClick = () => {
    const token = localStorage.getItem("token")
    if (!token) {
      window.location.href = "/auth/signin"
      return
    }
    toggleLike.mutate()
  }

  const liked = optimisticLiked !== null ? optimisticLiked : data?.liked || false
  const count = optimisticCount !== null ? optimisticCount : data?.count || 0

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || toggleLike.isPending}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
        liked
          ? "bg-red-600 hover:bg-red-700 text-white"
          : "bg-white/10 hover:bg-white/20 text-gray-300 border border-white/20"
      } disabled:opacity-70`}
    >
      <svg
        className="w-5 h-5"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>{count}</span>
    </button>
  )
}

