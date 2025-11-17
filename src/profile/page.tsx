// src/app/profile/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: number
  name: string
  email: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
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
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load profile")
        return res.json()
      })
      .then((data) => {
        setUser(data.user)
        setName(data.user.name)
        setEmail(data.user.email)
      })
      .catch(() => {
        localStorage.removeItem("token")
        router.push("/auth/signin")
      })
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
        Authorization: `Bearer ${token}`,
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
        Authorization: `Bearer ${token}`,
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <div className="glass p-8 mb-8 text-center">
          <h1 className="text-4xl font-bold  mb-2">My Profile</h1>
          <p className="text-teal-700">Update your account information</p>
        </div>
        <div className="glass p-8 space-y-10">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-6">Account Details</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="input-field"
                required
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="input-field"
                required
              />
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>

          <div className="border-t border-white border-opacity-20 pt-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-5">
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Current Password"
                className="input-field"
                required
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="input-field"
                required
              />
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg text-center font-medium ${
                message.includes("Error")
                  ? "bg-red-500 bg-opacity-30 text-red-200"
                  : "bg-emerald-500 text-emerald-200"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}