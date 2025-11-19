// src/app/profile/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"

interface User {
  id: number
  name: string
  email: string
}

interface Post {
  id: number
  title: string
  coverImage?: string
  createdAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [activeTab, setActiveTab] = useState<"account" | "posts">("posts")
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/signin")
      return
    }

    fetch("/api/auth/profile", {
      headers: { authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        setUser(data.user)
        setName(data.user.name || "")
        setEmail(data.user.email)
      })
      .catch(() => {
        localStorage.removeItem("token")
        router.push("/auth/signin")
      })

    fetch("/api/posts/my-posts", {
      headers: { authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setPosts(data.posts || []))
      .catch(() => setPosts([]))
  }, [router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setLoading(true)

    const token = localStorage.getItem("token")
    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, email }),
    })

    const data = await res.json()
    if (!res.ok) {
      setMessage("Error: " + data.error)
    } else {
      setMessage("Profile updated!")
      localStorage.setItem("token", data.token)
      setUser(data.user)
    }
    setLoading(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setLoading(true)

    const token = localStorage.getItem("token")
    const res = await fetch("/api/auth/profile/password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    })

    const data = await res.json()
    if (!res.ok) {
      setMessage("Error: " + data.error)
    } else {
      setMessage("Password changed successfully!")
      setOldPassword("")
      setNewPassword("")
    }
    setLoading(false)
  }

  const handleDelete = async (postId: number) => {
    if (!confirm("Delete this story forever?")) return

    const token = localStorage.getItem("token")
    await fetch(`/api/posts/${postId}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${token}` },
    })

    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-teal-950 to-emerald-950">
        <p className="text-2xl text-gray-300">Loading your dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-emerald-950 py-12 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-100 mb-3">My Dashboard</h1>
          <p className="text-2xl text-emerald-400">
            Welcome back, <span className="font-bold">{user.name}</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-6 mb-12">
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
              activeTab === "posts"
                ? "bg-emerald-600 text-white shadow-2xl shadow-emerald-600/40"
                : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
            }`}
          >
            My Stories ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
              activeTab === "account"
                ? "bg-emerald-600 text-white shadow-2xl shadow-emerald-600/40"
                : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
            }`}
          >
            Account Settings
          </button>
        </div>

        {/* MY POSTS TAB */}
        {activeTab === "posts" && (
          <div className="space-y-10">
            <div className="text-center">
              <Link
                href="/write"
                className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xl px-12 py-6 rounded-2xl shadow-2xl transition-all transform hover:scale-105"
              >
                Write New Story
              </Link>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-4xl text-gray-400 mb-6">No stories yet</p>
                <p className="text-xl text-emerald-400">Your voice is waiting to be heard</p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl hover:shadow-emerald-500/30 transition-all duration-500"
                  >
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        width={600}
                        height={340}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-emerald-900 to-teal-900 flex items-center justify-center">
                        <span className="text-7xl font-bold text-white/30">{post.title[0]}</span>
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-100 mb-3 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-emerald-400 text-sm mb-6">
                        {format(new Date(post.createdAt), "MMMM d, yyyy")}
                      </p>
                      <div className="flex gap-3">
                        <Link
                          href={`/write?edit=${post.id}`}
                          className="flex-1 bg-sky-600 hover:bg-sky-700 text-white text-center py-3 rounded-xl font-medium transition"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ACCOUNT SETTINGS TAB */}
        {activeTab === "account" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 space-y-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-100 mb-8">Account Details</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-bold py-4 rounded-xl transition"
                  >
                    {loading ? "Updating..." : "Update Profile"}
                  </button>
                </form>
              </div>

              <div className="border-t border-white/20 pt-10">
                <h2 className="text-3xl font-bold text-gray-100 mb-8">Change Password</h2>
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Current Password"
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white font-bold py-4 rounded-xl transition"
                  >
                    {loading ? "Changing..." : "Change Password"}
                  </button>
                </form>
              </div>

              {message && (
                <div
                  className={`p-6 rounded-xl text-center font-bold text-lg ${
                    message.includes("Error")
                      ? "bg-red-500/20 text-red-300 border border-red-500/50"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                  }`}
                >
                  {message}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}