"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

interface FollowButtonProps {
  userId: number
}

export default function FollowButton({ userId }: FollowButtonProps) {
  const queryClient = useQueryClient()
  const [optimisticFollowing, setOptimisticFollowing] = useState<
    boolean | null
  >(null)

  const { data, isLoading } = useQuery({
    queryKey: ["follow", userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}/follow`)
      const data = await res.json()
      return data as {
        following: boolean
        followerCount: number
        followingCount: number
      }
    },
  })

  const toggleFollow = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Please sign in to follow users")
      }

      const res = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to follow user")
      }

      return res.json()
    },
    onMutate: async () => {
      // Optimistic update
      if (data) {
        const newFollowing = !data.following
        setOptimisticFollowing(newFollowing)

        await queryClient.cancelQueries({ queryKey: ["follow", userId] })

        const previous = queryClient.getQueryData(["follow", userId])

        queryClient.setQueryData(["follow", userId], {
          ...data,
          following: newFollowing,
          followerCount: newFollowing
            ? data.followerCount + 1
            : data.followerCount - 1,
        })

        return { previous }
      }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["follow", userId], context.previous)
      }
      setOptimisticFollowing(null)
    },
    onSuccess: (newData) => {
      queryClient.setQueryData(["follow", userId], newData)
      setOptimisticFollowing(null)
    },
  })

  const handleClick = () => {
    const token = localStorage.getItem("token")
    if (!token) {
      window.location.href = "/auth/signin"
      return
    }
    toggleFollow.mutate()
  }

  const following =
    optimisticFollowing !== null ? optimisticFollowing : data?.following || false

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || toggleFollow.isPending}
      className={`px-6 py-2 rounded-xl font-medium transition-all ${
        following
          ? "bg-gray-600 hover:bg-gray-700 text-white border border-gray-500"
          : "bg-emerald-600 hover:bg-emerald-700 text-white"
      } disabled:opacity-70`}
    >
      {following ? "Following" : "Follow"}
    </button>
  )
}

