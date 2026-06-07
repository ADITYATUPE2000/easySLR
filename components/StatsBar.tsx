"use client"

import { useEffect, useState } from "react"
import { Box, Paper, Typography, Skeleton } from "@mui/material"
import ArticleIcon from "@mui/icons-material/Article"
import CheckIcon from "@mui/icons-material/Check"
import CloseIcon from "@mui/icons-material/Close"
import HelpIcon from "@mui/icons-material/Help"
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled"

type Stats = {
  total: number
  included: number
  excluded: number
  maybe: number
  pending: number
}

export default function StatsBar({
  projectId,
  refreshKey,
}: {
  projectId: string
  refreshKey: number
}) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      try {
        const res  = await fetch(`/api/projects/${projectId}/stats`)
        if (!res.ok) {
          throw new Error(`Failed to fetch stats: status ${res.status}`)
        }
        const contentType = res.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(`Expected JSON response, got ${contentType ?? "none"}`)
        }
        const data = await res.json()
        setStats(data)
      } catch (err) {
        console.error("Stats error:", err)
      }
      setLoading(false)
    }
    fetchStats()
  }, [projectId, refreshKey])

  if (loading || !stats) {
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(5, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {[...Array(5)].map((_, i) => (
          <Skeleton
            key={i}
            variant="rounded"
            height={100}
            sx={{
              borderRadius: 3,
              gridColumn: i === 0 ? { xs: "span 2", md: "span 1" } : "span 1",
            }}
          />
        ))}
      </Box>
    )
  }

  const reviewed = stats.included + stats.excluded + stats.maybe
  const progressPct = stats.total > 0 ? (reviewed / stats.total) * 100 : 0

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(5, 1fr)",
        },
        gap: 2.5,
        mb: 3,
      }}
    >
      {/* Total Articles Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          background: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: 100,
          position: "relative",
          overflow: "hidden",
          gridColumn: { xs: "span 2", md: "span 1" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 38,
              height: 38,
              borderRadius: 2,
              background: (theme) => theme.palette.mode === "dark" ? "#1e1b4b" : "#eef2ff",
            }}
          >
            <ArticleIcon sx={{ color: (theme) => theme.palette.mode === "dark" ? "#818cf8" : "#4f46e5", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 24, fontWeight: 700, lineHeight: 1.1, color: "text.primary" }}>
              {stats.total}
            </Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: "text.secondary" }}>
              Total Articles
            </Typography>
          </Box>
        </Box>
        
        {/* Progress Bar at bottom */}
        <Box sx={{ mt: 1.5 }}>
          <Box
            sx={{
              width: "100%",
              height: 4,
              borderRadius: 2,
              background: (theme) => theme.palette.mode === "dark" ? "#1e293b" : "#e2e8f0",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${Math.max(5, progressPct)}%`,
                height: "100%",
                background: "linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)",
                borderRadius: 2,
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Included Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          background: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderLeft: "4px solid #22c55e",
          display: "flex",
          alignItems: "center",
          gap: 2,
          height: 100,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: (theme) => theme.palette.mode === "dark" ? "rgba(34, 197, 94, 0.15)" : "#f0fdf4",
          }}
        >
          <CheckIcon sx={{ color: "#22c55e", fontSize: 18, fontWeight: "bold" }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 24, fontWeight: 700, lineHeight: 1.1, color: "text.primary" }}>
            {stats.included}
          </Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: "text.secondary" }}>
            Included
          </Typography>
        </Box>
      </Paper>

      {/* Excluded Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          background: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderLeft: "4px solid #ef4444",
          display: "flex",
          alignItems: "center",
          gap: 2,
          height: 100,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: (theme) => theme.palette.mode === "dark" ? "rgba(239, 68, 68, 0.15)" : "#fef2f2",
          }}
        >
          <CloseIcon sx={{ color: "#ef4444", fontSize: 18 }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 24, fontWeight: 700, lineHeight: 1.1, color: "text.primary" }}>
            {stats.excluded}
          </Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: "text.secondary" }}>
            Excluded
          </Typography>
        </Box>
      </Paper>

      {/* Maybe Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          background: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderLeft: "4px solid #f97316",
          display: "flex",
          alignItems: "center",
          gap: 2,
          height: 100,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: (theme) => theme.palette.mode === "dark" ? "rgba(249, 115, 22, 0.15)" : "#fff7ed",
          }}
        >
          <HelpIcon sx={{ color: "#f97316", fontSize: 18 }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 24, fontWeight: 700, lineHeight: 1.1, color: "text.primary" }}>
            {stats.maybe}
          </Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: "text.secondary" }}>
            Maybe
          </Typography>
        </Box>
      </Paper>

      {/* Pending Review Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          background: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderLeft: "4px solid #3b82f6",
          display: "flex",
          alignItems: "center",
          gap: 2,
          height: 100,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: (theme) => theme.palette.mode === "dark" ? "rgba(59, 130, 246, 0.15)" : "#eff6ff",
          }}
        >
          <AccessTimeFilledIcon sx={{ color: "#3b82f6", fontSize: 18 }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 24, fontWeight: 700, lineHeight: 1.1, color: "text.primary" }}>
            {stats.pending}
          </Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: "text.secondary" }}>
            Pending Review
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}