"use client"

import { useState, useEffect, useCallback } from "react"
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
} from "@mui/x-data-grid"
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Stack,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import SearchIcon from "@mui/icons-material/Search"
import InputAdornment from "@mui/material/InputAdornment"
import IconButton from "@mui/material/IconButton"
import Tooltip from "@mui/material/Tooltip"
import MenuIcon from "@mui/icons-material/Menu"
import NotesModal from "@/components/NotesModal"

type Article = {
  id: string
  title: string
  authors: string | null
  journal: string | null
  year: number | null
  reviews: { decision: string }[]
}

const decisionStyles: Record<string, { border: string; text: string; bg: string }> = {
  INCLUDE: {
    border: "#22c55e",
    text: "#16a34a",
    bg: "rgba(34, 197, 94, 0.08)",
  },
  EXCLUDE: {
    border: "#ef4444",
    text: "#dc2626",
    bg: "rgba(239, 68, 68, 0.08)",
  },
  MAYBE: {
    border: "#f97316",
    text: "#ea580c",
    bg: "rgba(249, 115, 22, 0.08)",
  },
  "": {
    border: "#cbd5e1",
    text: "#64748b",
    bg: "rgba(100, 116, 139, 0.08)",
  },
}

const statusBadgeStyles: Record<string, { bgLight: string; bgDark: string; borderLight: string; borderDark: string; textLight: string; textDark: string; label: string }> = {
  INCLUDE: {
    bgLight: "#f0fdf4",
    bgDark: "rgba(34, 197, 94, 0.08)",
    borderLight: "#bbf7d0",
    borderDark: "rgba(34, 197, 94, 0.3)",
    textLight: "#16a34a",
    textDark: "#4ade80",
    label: "INCLUDE",
  },
  EXCLUDE: {
    bgLight: "#fef2f2",
    bgDark: "rgba(239, 68, 68, 0.08)",
    borderLight: "#fecaca",
    borderDark: "rgba(239, 68, 68, 0.3)",
    textLight: "#dc2626",
    textDark: "#f87171",
    label: "EXCLUDE",
  },
  MAYBE: {
    bgLight: "#fffbeb",
    bgDark: "rgba(245, 158, 11, 0.08)",
    borderLight: "#fde68a",
    borderDark: "rgba(245, 158, 11, 0.3)",
    textLight: "#ea580c",
    textDark: "#fbbf24",
    label: "MAYBE",
  },
  UNREVIEWED: {
    bgLight: "#f8fafc",
    bgDark: "rgba(148, 163, 184, 0.08)",
    borderLight: "#e2e8f0",
    borderDark: "rgba(148, 163, 184, 0.2)",
    textLight: "#475569",
    textDark: "#cbd5e1",
    label: "UNREVIEWED",
  },
}

export default function ArticleTable({
  projectId,
  onReview,
}: {
  projectId: string
  onReview?: () => void
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [articles, setArticles] = useState<Article[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(0) // MUI is 0-indexed
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [notesModal, setNotesModal] = useState<{
    open: boolean
    articleId: string
    title: string
    notes: string
  }>({ open: false, articleId: "", title: "", notes: "" })

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        search: debouncedSearch,
        status,
        page: String(page + 1),
      })
      const res = await fetch(`/api/projects/${projectId}/articles?${queryParams}`)
      if (!res.ok) {
        throw new Error(`Failed to fetch articles: status ${res.status}`)
      }
      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Expected JSON response, got ${contentType ?? "none"}`)
      }

      const text = await res.text()
      if (!text) {
        console.error("Empty response from API")
        setLoading(false)
        return
      }

      const data = JSON.parse(text)
      if (data.error) {
        console.error("API error:", data.error)
        setLoading(false)
        return
      }

      setArticles(data.articles ?? [])
      setTotal(data.total ?? 0)
    } catch (err) {
      console.error("Fetch error:", err)
    }
    setLoading(false)
  }, [projectId, debouncedSearch, status, page])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  async function setDecision(articleId: string, decision: string) {
    try {
      await fetch(`/api/articles/${articleId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      })
      fetchArticles()
      onReview?.()
    } catch (err) {
      console.error("Failed to save decision:", err)
    }
  }

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Title",
      flex: 2.5,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", py: 1 }}>
          <Typography noWrap sx={{ color: "text.primary", mb: 0.25, fontSize: 13, fontWeight: 600 }}>
            {params.row.title}
          </Typography>
          <Typography color="text.secondary" noWrap sx={{ fontSize: 11 }}>
            {params.row.authors}
            {isMobile && params.row.journal ? ` • ${params.row.journal}` : ""}
            {isMobile && params.row.year ? ` (${params.row.year})` : ""}
          </Typography>
        </Box>
      ),
    },
    {
      field: "journal",
      headerName: "Journal",
      flex: 1.2,
      renderCell: (params) => (
        <Typography color="text.secondary" sx={{ py: 2, fontSize: 13 }}>
          {params.value ?? "—"}
        </Typography>
      ),
    },
    {
      field: "year",
      headerName: "Year",
      width: 90,
      renderCell: (params) => (
        <Typography color="text.secondary" sx={{ py: 2, fontSize: 13 }}>
          {params.value ?? "—"}
        </Typography>
      ),
    },
    {
      field: "decision",
      headerName: "Decision",
      width: 140,
      renderCell: (params: GridRenderCellParams) => {
        const decision = params.row.reviews?.[0]?.decision ?? ""
        const style = decisionStyles[decision] || decisionStyles[""]
        return (
          <FormControl size="small" sx={{ width: 115 }}>
            <Select
              value={decision}
              displayEmpty
              onChange={e => setDecision(params.row.id, e.target.value as string)}
              sx={{
                fontSize: 12,
                fontWeight: 600,
                height: 28,
                borderRadius: 4,
                color: style.text,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: (theme) => theme.palette.mode === "dark" ? (decision ? style.border : "#1e293b") : style.border,
                  borderWidth: "1px",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: style.border,
                  borderWidth: "1px",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: style.border,
                  borderWidth: "1px",
                },
                "& .MuiSelect-select": {
                  py: 0.5,
                  px: 1.5,
                  display: "flex",
                  alignItems: "center",
                },
                "& .MuiSvgIcon-root": {
                  color: style.text,
                  fontSize: 18,
                }
              }}
              MenuProps={{
                slotProps: {
                  paper: {
                    sx: {
                      borderRadius: 2.5,
                      boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)",
                      border: "1px solid",
                      borderColor: "divider",
                    }
                  }
                }
              }}
            >
              <MenuItem value="" sx={{ fontSize: 12.5, fontWeight: 500 }}>Unreviewed</MenuItem>
              <MenuItem value="INCLUDE" sx={{ fontSize: 12.5, fontWeight: 500, color: "#16a34a" }}>Include</MenuItem>
              <MenuItem value="MAYBE" sx={{ fontSize: 12.5, fontWeight: 500, color: "#ea580c" }}>Maybe</MenuItem>
              <MenuItem value="EXCLUDE" sx={{ fontSize: 12.5, fontWeight: 500, color: "#dc2626" }}>Exclude</MenuItem>
            </Select>
          </FormControl>
        )
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (params: GridRenderCellParams) => {
        const decision = params.row.reviews?.[0]?.decision ?? "UNREVIEWED"
        const badge = statusBadgeStyles[decision] || statusBadgeStyles["UNREVIEWED"]
        return (
          <Box
            sx={{
              fontSize: 10.5,
              fontWeight: 700,
              borderRadius: 9999,
              px: 2,
              py: 0.5,
              letterSpacing: "0.05em",
              border: "1px solid",
              borderColor: (theme) => theme.palette.mode === "dark" ? badge.borderDark : badge.borderLight,
              background: (theme) => theme.palette.mode === "dark" ? badge.bgDark : badge.bgLight,
              color: (theme) => theme.palette.mode === "dark" ? badge.textDark : badge.textLight,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: 22,
            }}
          >
            {badge.label}
          </Box>
        )
      },
    },
    {
      field: "notes",
      headerName: "",
      width: 50,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title="Add notes">
          <IconButton
            size="small"
            onClick={() => setNotesModal({
              open: true,
              articleId: params.row.id,
              title: params.row.title,
              notes: params.row.reviews?.[0]?.notes ?? "",
            })}
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: "primary.main",
              }
            }}
          >
            <MenuIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      ),
    },
  ]

  return (
    <Box sx={{ width: "100%" }}>
      {/* Toolbar */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2, mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search title or authors..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{
            flex: { xs: "none", sm: 3.5 },
            width: "100%",
            "& .MuiOutlinedInput-root": {
              borderRadius: 9999,
              background: "background.paper",
              fontSize: 13,
              px: 2,
              "& fieldset": {
                borderColor: "divider",
              },
            },
            "& .MuiOutlinedInput-input": {
              paddingTop: "12px !important",
              paddingBottom: "12px !important",
              pl: 1,
            }
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControl size="small" sx={{ flex: { xs: "none", sm: 1 }, minWidth: { xs: "100%", sm: 160 } }}>
          <Select
            value={status}
            displayEmpty
            onChange={e => setStatus(e.target.value)}
            sx={{
              borderRadius: 9999,
              background: "background.paper",
              fontSize: 13,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "divider",
              },
              "& .MuiSelect-select": {
                paddingTop: "12px !important",
                paddingBottom: "12px !important",
                px: 2.5,
              }
            }}
          >
            <MenuItem value="" sx={{ fontSize: 13 }}>Filter by decision</MenuItem>
            <MenuItem value="INCLUDE" sx={{ fontSize: 13 }}>Include</MenuItem>
            <MenuItem value="MAYBE" sx={{ fontSize: 13 }}>Maybe</MenuItem>
            <MenuItem value="EXCLUDE" sx={{ fontSize: 13 }}>Exclude</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {!loading && articles.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            mb: 2,
            background: "background.paper",
          }}
        >
          <Typography sx={{ fontSize: 32, mb: 1 }}>📭</Typography>
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>
            No articles found
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 13, mt: 0.5 }}>
            Try adjusting your search or filter
          </Typography>
        </Box>
      )}

      {/* MUI DataGrid */}
      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={articles}
          columns={columns}
          rowCount={total}
          loading={loading}
          pageSizeOptions={[20]}
          paginationMode="server"
          paginationModel={{ page, pageSize: 20 }}
          onPaginationModelChange={model => setPage(model.page)}
          rowHeight={58}
          disableRowSelectionOnClick
          columnVisibilityModel={{
            journal: !isMobile,
            year: !isMobile,
            status: !isMobile,
          }}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            background: "background.paper",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: (theme) => theme.palette.mode === "dark" ? "#0f172a" : "#ffffff",
              borderBottom: "1px solid",
              borderColor: "divider",
              fontSize: 12,
              fontWeight: 600,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 600,
            },
            "& .MuiDataGrid-columnSeparator": {
              display: "none",
            },
            "& .MuiDataGrid-row": {
              borderBottom: "1px solid",
              borderColor: "divider",
              "&:hover": {
                backgroundColor: (theme) => theme.palette.mode === "dark" ? "#161e31" : "#f8fafc",
              },
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
              display: "flex",
              alignItems: "center",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "1px solid",
              borderColor: "divider",
              backgroundColor: (theme) => theme.palette.mode === "dark" ? "#0f172a" : "#ffffff",
              borderRadius: "0 0 12px 12px",
            },
            "& .MuiTablePagination-root": {
              color: "text.secondary",
            }
          }}
        />
      </Box>

      <NotesModal
        open={notesModal.open}
        articleId={notesModal.articleId}
        articleTitle={notesModal.title}
        existingNotes={notesModal.notes}
        onClose={() => setNotesModal(m => ({ ...m, open: false }))}
        onSaved={fetchArticles}
      />
    </Box>
  )
}