/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import Image from "next/image"

const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => <p className="text-white text-center py-20">Loading editor...</p>,
})

export default function WritePage() {
  const editor = useRef<any>(null)
  const [content, setContent] = useState("")
  const [title, setTitle] = useState("")
  const [coverImage, setCoverImage] = useState<string>("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) router.push("/auth/signin")
  }, [router])

  useEffect(() => {
    const saved = localStorage.getItem("draft")
    if (saved) {
      const draft = JSON.parse(saved)
      setTitle(draft.title || "")
      setContent(draft.content || "")
      setCoverImage(draft.coverImage || "")
      setTags(draft.tags || [])
    }
  }, [])

  const saveDraft = () => {
    setSaving(true)
    const draft = { title, content, coverImage, tags, savedAt: new Date().toISOString() }
    localStorage.setItem("draft", JSON.stringify(draft))
    setTimeout(() => setSaving(false), 800)
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const uploadCover = async (file: File) => {
    setUploading(true)
    const formData = new FormData()
    formData.append("files[0]", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (data.url) {
        setCoverImage(data.url)
      }
    } catch (err) {
      alert("Cover upload failed")
    } finally {
      setUploading(false)
    }
  }
const publishPost = async () => {
  if (!title.trim() || !content.trim()) {
    alert("Title and content are required!")
    return
  }

  setPublishing(true)
  const urlParams = new URLSearchParams(window.location.search)
  const editId = urlParams.get("edit")

  try {
    const method = editId ? "PUT" : "POST"
    const url = editId ? `/api/posts/${editId}` : "/api/posts"

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ title, content, coverImage, tags }),
    })

    if (res.ok) {
      localStorage.removeItem("draft")
      alert(editId ? "Post updated!" : "Published successfully!")
      router.push("/profile")
    } else {
      alert("Failed to save")
    }
  } catch (err) {
    alert("Error")
  } finally {
    setPublishing(false)
  }
}

  const config = {
    readonly: false,
    height: 500,
    placeholder: "Start writing your amazing story...",
    toolbarSticky: true,
    buttons: "bold,italic,underline,|,link,image,video,|,ul,ol,|,outdent,indent,|,fontsize,brush,|,align,table,|,source",
    style: { background: "#0f172a", color: "#e2e8f0", font: "16px 'Inter', sans-serif" },
    uploader: {
      url: "/api/upload",
      format: "json",
      insertImageAsBase64URI: false,
      filesVariableName: () => "files[0]",
      isSuccess: (resp: any) => !!resp.url,
      process: (resp: any) => ({ files: [resp.url] }),
      defaultHandlerSuccess: function (data: any) {
        if (data.files?.[0] && editor.current) {
          editor.current.selection.insertImage(data.files[0], null, 600)
        }
      },
    },
  }

  // Add this useEffect at the top (after your other useEffects)
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const editId = urlParams.get("edit")

  if (editId) {
    const token = localStorage.getItem("token")
    fetch(`/api/posts/${editId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.post) {
          setTitle(data.post.title)
          setContent(data.post.content)
          setCoverImage(data.post.coverImage || "")
          setTags(data.post.tags?.map((pt: any) => pt.tag.name) || [])
        }
      })
      .catch(() => alert("Failed to load post for editing"))
  }
}, [])

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="glass p-8 mb-6 rounded-2xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">Write Your Story</h1>
            <div className="flex gap-4">
              <button onClick={saveDraft} className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-lg font-medium transition-all shadow-lg">
                {saving ? "Saved!" : "Save Draft"}
              </button>
              <button
                onClick={publishPost}
                disabled={publishing}
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg disabled:opacity-70"
              >
                {publishing ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>

          
          <div className="mb-10">
            {coverImage ? (
              <div className="relative rounded-xl overflow-hidden border-4 border-emerald-500">
                <Image src={coverImage} alt="Cover" width={1200} height={600} className="w-full h-96 object-cover" />
                <button
                  onClick={() => setCoverImage("")}
                  className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="block cursor-pointer">
                <div className="border-4 border-dashed border-emerald-500 rounded-xl p-16 text-center hover:border-emerald-400 transition">
                  <div className="text-6xl mb-4">Upload Cover Image</div>
                  <p className="text-emerald-300">Click or drag & drop</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
            {uploading && <p className="text-emerald-400 text-center mt-4">Uploading cover...</p>}
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your amazing title..."
            className="w-full text-5xl font-bold bg-transparent text-white placeholder-emerald-400 border-none outline-none mb-6 resize-none"
          />

          {/* Tags Input */}
          <div className="mb-10">
            <label className="block text-white font-medium mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-emerald-600/30 text-emerald-300 rounded-full text-sm flex items-center gap-2"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTag()
                  }
                }}
                placeholder="Add a tag and press Enter"
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
              >
                Add
              </button>
            </div>
          </div>

          <JoditEditor
            ref={editor}
            value={content}
            config={config}
            onChange={(newContent) => setContent(newContent)}
          />
        </div>

        <div className="glass p-8 rounded-2xl">
          <h2 className="text-3xl font-bold text-white mb-6">Live Preview</h2>
          <div
            className="prose prose-invert prose-lg max-w-none bg-white bg-opacity-5 p-10 rounded-xl min-h-96"
            dangerouslySetInnerHTML={{
              __html: content || "<p class='text-emerald-300'>Your story will appear here...</p>",
            }}
          />
        </div>
      </div>
    </div>
  )
}