"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/useDebounce"

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (debouncedQuery.trim().length > 2) {
      setLoading(true)
      fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=5`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.posts || [])
          setIsOpen(true)
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    } else {
      setResults([])
      setIsOpen(false)
    }
  }, [debouncedQuery])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setIsOpen(false)
      setQuery("")
    }
  }

  return (
    <div className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true)
          }}
          onBlur={() => {
            // Delay to allow clicking on results
            setTimeout(() => setIsOpen(false), 200)
          }}
          placeholder="Search posts..."
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </form>

      {isOpen && (loading || results.length > 0) && (
        <div className="absolute top-full mt-2 w-full bg-slate-800 border border-white/20 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-400">Searching...</div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((post) => (
                <a
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="block px-4 py-3 hover:bg-white/5 transition"
                >
                  <h3 className="font-semibold text-white mb-1 line-clamp-1">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {post.content.replace(/<[^>]*>/g, "").slice(0, 100)}...
                  </p>
                </a>
              ))}
              {query.trim() && (
                <a
                  href={`/search?q=${encodeURIComponent(query.trim())}`}
                  className="block px-4 py-3 text-center text-emerald-400 hover:bg-white/5 border-t border-white/10"
                >
                  View all results →
                </a>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  )
}

