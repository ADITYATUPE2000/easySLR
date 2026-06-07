import { z } from "zod"

const ArticleRowSchema = z.object({
  title:    z.string().min(1, "Title is required"),
  year:     z.coerce.number().int().min(1900).max(2100),
  authors:  z.string().optional(),
  pmid:     z.string().optional(),
  doi:      z.string().optional(),
  journal:  z.string().optional(),
  abstract: z.string().optional(),
})

export type ArticleRow = z.infer<typeof ArticleRowSchema>

// Maps common PubMed export column names to our field names
function normalizeRow(row: Record<string, unknown>) {
  const map: Record<string, string> = {
    // title variations
    "title":                "title",
    "article title":        "title",
    "ti":                   "title",
    // year variations
    "year":                 "year",
    "publication year":     "year",
    "py":                   "year",
    "dp":                   "year",
    "date":                 "year",
    // authors variations
    "authors":              "authors",
    "author":               "authors",
    "au":                   "authors",
    "fau":                  "authors",
    // journal variations
    "journal":              "journal",
    "source":               "journal",
    "journal/book":         "journal",
    "ta":                   "journal",
    "jt":                   "journal",
    // pmid variations
    "pmid":                 "pmid",
    "pubmed id":            "pmid",
    "uid":                  "pmid",
    // doi variations
    "doi":                  "doi",
    "lid":                  "doi",
    // abstract variations
    "abstract":             "abstract",
    "ab":                   "abstract",
  }

  const normalized: Record<string, unknown> = {}

  for (const key of Object.keys(row)) {
    const lowerKey = key.toLowerCase().trim()
    const mappedKey = map[lowerKey]
    if (mappedKey) {
      // Don't overwrite if already set
      if (!normalized[mappedKey]) {
        normalized[mappedKey] = row[key]
      }
    }
  }

  return normalized
}

export function parseRows(rawRows: Record<string, unknown>[]) {
  const valid: ArticleRow[] = []
  const errors: { row: number; reason: string }[] = []

  rawRows.forEach((row, index) => {
    const rowNum = index + 2
    const normalized = normalizeRow(row)

    const result = ArticleRowSchema.safeParse(normalized)

    if (result.success) {
      valid.push(result.data)
    } else {
      const reason = result.error.issues
        .map((e: any) => e.message)
        .join(", ")
      errors.push({ row: rowNum, reason })
    }
  })

  return { valid, errors }
}