import { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export interface JWTPayload {
  id: number
  email: string
  name: string | null
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization")
  return authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export function getUserIdFromRequest(req: NextRequest): number | null {
  const token = getTokenFromRequest(req)
  if (!token) return null
  const decoded = verifyToken(token)
  return decoded?.id || null
}

