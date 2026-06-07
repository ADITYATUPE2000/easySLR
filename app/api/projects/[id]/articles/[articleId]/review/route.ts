import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/auth-guard"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }  // ← renamed
) {
  try {
    const session = await requireSession()
    const { articleId } = await params  // ← renamed
    const { decision, notes } = await req.json()

    const validDecisions = ["INCLUDE", "EXCLUDE", "MAYBE"]
    if (!validDecisions.includes(decision)) {
      return NextResponse.json(
        { error: "Invalid decision" },
        { status: 400 }
      )
    }

    const review = await prisma.review.upsert({
      where: {
        articleId_userId: {
          articleId,
          userId: session.user.id,
        },
      },
      update: { decision, notes },
      create: {
        decision,
        notes,
        articleId,
        userId: session.user.id,
      },
    })

    return NextResponse.json(review)

  } catch (error: any) {
    console.error("REVIEW ERROR:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}