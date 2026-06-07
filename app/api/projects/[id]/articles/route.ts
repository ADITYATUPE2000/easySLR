import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params

    const url = new URL(req.url)
    const search = url.searchParams.get("search") ?? ""
    const status = url.searchParams.get("status") ?? ""
    const page   = Number(url.searchParams.get("page") ?? "1")
    const year   = url.searchParams.get("year") ?? ""
    const take   = 20

    const where: any = {
      projectId,
      ...(search && {
        OR: [
          { title:   { contains: search, mode: "insensitive" } },
          { authors: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(year && { year: parseInt(year) }),
    }
    const articles = await prisma.article.findMany({
      where,
      include: {
        reviews: { take: 1 },
      },
      skip: (page - 1) * take,
      take,
      orderBy: { createdAt: "desc" },
    })

    const total = await prisma.article.count({ where })

    const filtered = status
      ? articles.filter((a: any) => a.reviews[0]?.decision === status)
      : articles

    return NextResponse.json({ articles: filtered, total, page })

  } catch (error: any) {
    console.error("ARTICLES ERROR:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}