"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import type { Comment as CommentType } from "@/types"

interface CommentsProps {
  postId: number
}

export default function Comments({ postId }: CommentsProps) {
  const [content, setContent] = useState("")
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${postId}/comments`)
      const data = await res.json()
      return data.comments as CommentType[]
    },
  })

  const createComment = useMutation({
    mutationFn: async (commentData: { content: string; parentId?: number }) => {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("Please sign in to comment")
      }

      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(commentData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to post comment")
      }

      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] })
      setContent("")
      setReplyingTo(null)
      setReplyContent("")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    createComment.mutate({ content: content.trim() })
  }

  const handleReply = (parentId: number) => {
    if (!replyContent.trim()) return
    createComment.mutate({ content: replyContent.trim(), parentId })
  }

  const token = localStorage.getItem("token")

  return (
    <div className="mt-12 space-y-8">
      <h2 className="text-3xl font-bold text-white mb-6">
        Comments ({data?.length || 0})
      </h2>

      {token && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition min-h-[100px]"
            required
          />
          <button
            type="submit"
            disabled={createComment.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition disabled:opacity-70"
          >
            {createComment.isPending ? "Posting..." : "Post Comment"}
          </button>
          {createComment.error && (
            <p className="text-red-400">
              {createComment.error instanceof Error
                ? createComment.error.message
                : "Failed to post comment"}
            </p>
          )}
        </form>
      )}

      {!token && (
        <p className="text-emerald-300 text-center py-8">
          <a href="/auth/signin" className="underline">
            Sign in
          </a>{" "}
          to join the conversation
        </p>
      )}

      {isLoading ? (
        <p className="text-gray-400 text-center py-8">Loading comments...</p>
      ) : !data || data.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No comments yet</p>
      ) : (
        <div className="space-y-6">
          {data.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={(id) => setReplyingTo(id === replyingTo ? null : id)}
              isReplying={replyingTo === comment.id}
              replyContent={replyContent}
              onReplyContentChange={setReplyContent}
              onReplySubmit={() => handleReply(comment.id)}
              postId={postId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CommentItem({
  comment,
  onReply,
  isReplying,
  replyContent,
  onReplyContentChange,
  onReplySubmit,
  postId,
}: {
  comment: CommentType
  onReply: (id: number) => void
  isReplying: boolean
  replyContent: string
  onReplyContentChange: (content: string) => void
  onReplySubmit: () => void
  postId: number
}) {
  const token = localStorage.getItem("token")

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {comment.author?.name?.[0] || "A"}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <p className="font-semibold text-white">
              {comment.author?.name || "Anonymous"}
            </p>
            <span className="text-gray-400 text-sm">
              {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </span>
          </div>
          <p className="text-gray-200 whitespace-pre-wrap">{comment.content}</p>

          {token && (
            <button
              onClick={() => onReply(comment.id)}
              className="mt-3 text-emerald-400 hover:text-emerald-300 text-sm font-medium"
            >
              {isReplying ? "Cancel" : "Reply"}
            </button>
          )}

          {isReplying && (
            <div className="mt-4 space-y-3">
              <textarea
                value={replyContent}
                onChange={(e) => onReplyContentChange(e.target.value)}
                placeholder="Write a reply..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition min-h-[80px]"
              />
              <button
                onClick={onReplySubmit}
                disabled={!replyContent.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-70"
              >
                Post Reply
              </button>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-6 ml-8 space-y-4 border-l-2 border-white/10 pl-6">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {reply.author?.name?.[0] || "A"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white text-sm">
                        {reply.author?.name || "Anonymous"}
                      </p>
                      <span className="text-gray-400 text-xs">
                        {format(
                          new Date(reply.createdAt),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">
                      {reply.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

