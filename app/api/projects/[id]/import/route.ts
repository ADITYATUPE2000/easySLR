import { NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { prisma } from "@/lib/prisma"
import { requireSession } from "@/lib/auth-guard"
import { parseRows } from "@/lib/import-parser"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSession()

    // Await params — required in Next.js 15
    const { id: projectId } = await params

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rawRows = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[]

    const { valid, errors } = parseRows(rawRows)

    const created = await prisma.article.createMany({
      data: valid.map(row => ({
        ...row,
        projectId,
        pmid: row.pmid ?? null,
        authors: row.authors ?? null,
        doi: row.doi ?? null,
        journal: row.journal ?? null,
        abstract: row.abstract ?? null,
      })),
      skipDuplicates: true,
    })

    const duplicates = valid.length - created.count

    return NextResponse.json({
      imported: created.count,
      duplicates,
      errors,
    })

  } catch (error: any) {
    console.error("IMPORT ERROR:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}