/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"

// THIS FIXES THE "self is not defined" ERROR
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => <p className="text-white text-center py-20">Loading editor...</p>,
})

export default function WritePage() {
  const editor = useRef<any>(null)
  const [content, setContent] = useState("")
  const [title, setTitle] = useState("")
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
    }
  }, [])

  const saveDraft = () => {
    setSaving(true)
    const draft = { title, content, savedAt: new Date().toISOString() }
    localStorage.setItem("draft", JSON.stringify(draft))
    setTimeout(() => setSaving(false), 800)
  }

  const publishPost = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Title and content are required!")
      return
    }

    setPublishing(true)
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ title, content }),
      })

      if (res.ok) {
        localStorage.removeItem("draft") // clear draft
        alert("Published successfully!")
        router.push("/") // go to home/feed
      } else {
        alert("Failed to publish")
      }
    } catch (err) {
      alert("Error publishing post")
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
      imagesVariableName: "image",
      isSuccess: (resp: any) => !!resp.url,
      process: (resp: any) => ({ files: [resp.url] }),
      defaultHandlerSuccess: function (data: any) {
        if (data.files?.[0] && editor.current) {
          editor.current.selection.insertImage(data.files[0], null, 600)
        }
      },
    },
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="glass p-8 mb-6 rounded-2xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold ">Write Your Story</h1>
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

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your amazing title..."
            className="w-full text-5xl font-bold bg-transparent  placeholder-emerald-400 border-none outline-none mb-10 resize-none"
          />

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