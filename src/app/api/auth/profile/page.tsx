// src/app/profile/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import jwt from "jsonwebtoken"

interface User {
  id: number
  name: string
  email: string
}

export default function Profile() {
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

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const decoded = jwt.decode(token) as any
      setUser({ id: decoded.id, name: decoded.name, email: decoded.email })
      setName(decoded.name)
      setEmail(decoded.email)
    } catch {
      localStorage.removeItem("token")
      router.push("/auth/signin")
    }
  }, [router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name, email }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setMessage("Profile updated successfully!")
      // Update token
      const newToken = data.token
      localStorage.setItem("token", newToken)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setMessage("Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/profile/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setMessage("Password changed successfully!")
      setOldPassword("")
      setNewPassword("")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setMessage("Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="glass p-8 mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-emerald-200">Manage your account details</p>
        </div>

        <div className="glass p-8 space-y-8">
          {/* Update Name & Email */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Update Info</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="input-field"
                required
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="input-field"
                required
              />
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>

          <hr className="border-white border-opacity-20" />

          {/* Change Password */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
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
            <div className={`p-4 rounded-lg text-center ${message.includes("Error") ? "bg-red-500 bg-opacity-30 text-red-200" : "bg-emerald-500 bg-opacity-30 text-emerald-200"}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}