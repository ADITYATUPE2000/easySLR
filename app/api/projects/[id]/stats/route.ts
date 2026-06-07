import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params

    const total = await prisma.article.count({
      where: { projectId },
    })

    const included = await prisma.review.count({
      where: {
        article: { projectId },
        decision: "INCLUDE",
      },
    })

    const excluded = await prisma.review.count({
      where: {
        article: { projectId },
        decision: "EXCLUDE",
      },
    })

    const maybe = await prisma.review.count({
      where: {
        article: { projectId },
        decision: "MAYBE",
      },
    })

    const reviewed = included + excluded + maybe
    const pending  = total - reviewed

    return NextResponse.json({
      total,
      included,
      excluded,
      maybe,
      pending,
    })

  } catch (error: any) {
    console.error("STATS ERROR:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}