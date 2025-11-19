"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import SearchBar from "./SearchBar"

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsAuthenticated(!!token)
  }, [])

  return (
    <header className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
      <div className="container flex justify-between items-center py-4 gap-4">
        <Link
          href="/"
          className="text-2xl font-bold text-white hover:text-emerald-400 transition"
        >
          Rema<span className="text-emerald-400">Blog</span>
        </Link>

        <div className="flex-1 max-w-2xl mx-8">
          <SearchBar />
        </div>

        <nav>
          <ul className="flex gap-6 items-center">
            <li>
              <Link
                href="/"
                className="text-gray-300 hover:text-white transition"
              >
                Home
              </Link>
            </li>
            {isAuthenticated ? (
              <>
                <li>
                  <Link
                    href="/write"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Write
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      localStorage.removeItem("token")
                      window.location.href = "/"
                    }}
                    className="text-gray-300 hover:text-white transition"
                  >
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/auth/signin"
                    className="text-gray-300 hover:text-white transition"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/signup"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}
