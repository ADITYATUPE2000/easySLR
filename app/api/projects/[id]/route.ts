import { NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { prisma } from "@/lib/prisma"
import { requireSession, assertProjectAccess } from "@/lib/auth-guard"
import { parseRows } from "@/lib/import-parser"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // 1. Auth guards — must be first!
  const session = await requireSession()
  await assertProjectAccess(session.user.id, id)

  // 2. Read the uploaded file
  const formData = await req.formData()
  const file = formData.get("file") as File
  const buffer = Buffer.from(await file.arrayBuffer())

  // 3. Parse Excel → raw JS objects
  const workbook = XLSX.read(buffer, { type: "buffer" })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rawRows = XLSX.utils.sheet_to_json(sheet) as Record<string,unknown>[]

  // 4. Validate each row
  const { valid, errors } = parseRows(rawRows)

  // 5. Save valid rows (skip duplicates silently)
  const created = await prisma.article.createMany({
    data: valid.map(row => ({
      ...row,
      projectId: id,
    })),
    skipDuplicates: true, // won't crash on duplicate pmid
  })

  const duplicates = valid.length - created.count

  return NextResponse.json({
    imported: created.count,
    duplicates,
    errors, // [{ row: 3, reason: "Title is required" }, ...]
  })
}