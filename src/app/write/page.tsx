"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Write() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/signin")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/")
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Write Your Post</h1>
      <p className="text-gray-600 mb-6">
        Welcome! Your session expires in 3 hours.
      </p>
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  )
}