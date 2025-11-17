import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET!

export async function PUT(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1]
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number }
    const { oldPassword, newPassword } = await req.json()

    const user = await prisma.user.findUnique({ where: { id: decoded.id } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const valid = await bcrypt.compare(oldPassword, user.password)
    if (!valid) return NextResponse.json({ error: "Incorrect old password" }, { status: 400 })

    const hashed = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashed },
    })

    return NextResponse.json({ message: "Password changed" })
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 })
  }
}