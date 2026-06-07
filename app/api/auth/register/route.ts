import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    // Validate inputs
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create org → user → project → member
    const org = await prisma.organization.create({
      data: { name: `${name}'s Org` },
    })

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        orgId: org.id,
      },
    })

    const project = await prisma.project.create({
      data: {
        name: "My First Review",
        orgId: org.id,
      },
    })

    await prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId: project.id,
        role: "OWNER",
      },
    })

    return NextResponse.json({
      message: "Account created successfully"
    })

  } catch (error: any) {
    console.error("REGISTER ERROR:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}