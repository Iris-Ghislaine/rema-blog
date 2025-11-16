import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export function middleware(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")?.[1]

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    jwt.verify(token, JWT_SECRET)
    return NextResponse.next()
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 })
  }
}

export const config = {
  matcher: ["/api/protected/:path*"],
}