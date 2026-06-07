import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params

    const articles = await prisma.article.findMany({
      where: { projectId },
      include: { reviews: { take: 1 } },
      orderBy: { createdAt: "desc" },
    })

    // Build CSV manually
    const headers = ["Title", "Authors", "Journal", "Year", "PMID", "DOI", "Decision", "Notes"]
    
    const rows = articles.map(a => [
      `"${(a.title ?? "").replace(/"/g, '""')}"`,
      `"${(a.authors ?? "").replace(/"/g, '""')}"`,
      `"${(a.journal ?? "").replace(/"/g, '""')}"`,
      a.year ?? "",
      a.pmid ?? "",
      a.doi ?? "",
      a.reviews[0]?.decision ?? "UNREVIEWED",
      `"${(a.reviews[0]?.notes ?? "").replace(/"/g, '""')}"`,
    ])

    const csv = [
      headers.join(","),
      ...rows.map(r => r.join(",")),
    ].join("\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="articles-export.csv"`,
      },
    })

  } catch (error: any) {
    console.error("EXPORT ERROR:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}