"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import Skeleton from "@mui/material/Skeleton"
import Drawer from "@mui/material/Drawer"
import IconButton from "@mui/material/IconButton"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import DownloadIcon from "@mui/icons-material/Download"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import MenuIcon from "@mui/icons-material/Menu"
import StatsBar from "@/components/StatsBar"
import ImportButton from "@/components/ImportButton"
import Sidebar from "@/components/Sidebar"
import ThemeToggle from "@/components/ThemeToggle"

const ArticleTable = dynamic(() => import("@/components/ArticleTable"), {
  ssr: false,
  loading: () => (
    <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
      Loading articles...
    </Box>
  ),
})

type Project = {
  id: string
  name: string
  _count: { articles: number }
}

export default function Home() {
  const [projects, setProjects]           = useState<Project[]>([])
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [loading, setLoading]             = useState(true)
  const [refreshKey, setRefreshKey]       = useState(0)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      const res  = await fetch("/api/projects")
      if (!res.ok) {
        throw new Error(`Failed to fetch projects: status ${res.status}`)
      }
      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Expected JSON response, got ${contentType ?? "none"}`)
      }
      const data = await res.json()
      const list: Project[] = data.projects ?? []
      setProjects(list)

      // Keep active project in sync after refresh
      setActiveProject(prev => {
        if (prev) {
          const updated = list.find(p => p.id === prev.id)
          return updated ?? list[0] ?? null
        }
        return list[0] ?? null
      })
    } catch (err) {
      console.error("Failed to fetch projects:", err)
    }
    setLoading(false)
  }

  function handleReview() {
    setRefreshKey(k => k + 1)
  }

  function handleExport() {
    if (!activeProject) return
    window.open(`/api/projects/${activeProject.id}/export`, "_blank")
  }

  async function handleImported() {
    await fetchProjects()
    setRefreshKey(k => k + 1)
  }

  const hasArticles = (activeProject?._count?.articles ?? 0) > 0

  // Full page loading skeleton
  if (loading) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Box
          sx={{
            width: 220,
            background: "#fff",
            borderRight: "1px solid #f0f0f0",
            display: { xs: "none", md: "block" },
          }}
        />
        <Box sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
          <Skeleton variant="rounded" height={40} width={300} sx={{ mb: 3 }} />
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
                height={90}
                sx={{
                  gridColumn: i === 0 ? { xs: "span 2", md: "span 1" } : "span 1",
                }}
              />
            ))}
          </Box>
          <Skeleton variant="rounded" height={400} />
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "background.default" }}>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
        }}
      >
        <Sidebar
          projects={projects}
          activeProjectId={activeProject?.id ?? ""}
          onSelectProject={id => {
            const p = projects.find(p => p.id === id)
            if (p) setActiveProject(p)
          }}
          isMobile
          onClose={() => setMobileOpen(false)}
        />
      </Drawer>

      {/* Desktop Sidebar */}
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <Sidebar
          projects={projects}
          activeProjectId={activeProject?.id ?? ""}
          onSelectProject={id => {
            const p = projects.find(p => p.id === id)
            if (p) setActiveProject(p)
          }}
        />
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <Box sx={{ p: { xs: 2, md: 4 }, width: "100%" }}>

          {activeProject ? (
            <>
              {/* Header */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {isMobile && (
                    <IconButton
                      color="inherit"
                      aria-label="open drawer"
                      edge="start"
                      onClick={() => setMobileOpen(true)}
                      sx={{ mr: 0.5, p: 0.5 }}
                    >
                      <MenuIcon />
                    </IconButton>
                  )}
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {activeProject.name}
                    </Typography>
                    <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                      {hasArticles
                        ? `${activeProject._count.articles} articles imported`
                        : "No articles yet"}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  {hasArticles && (
                    <Button
                      variant="outlined"
                      size="medium"
                      startIcon={<DownloadIcon sx={{ fontSize: 18 }} />}
                      onClick={handleExport}
                      sx={{
                        borderColor: (theme) => theme.palette.mode === "dark" ? "#1e293b" : "#e2e8f0",
                        color: "text.primary",
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: 13,
                        borderRadius: 2,
                        height: 36,
                        px: 2,
                        background: "background.paper",
                        "&:hover": {
                          borderColor: "text.secondary",
                          background: "action.hover",
                        },
                      }}
                    >
                      Export CSV
                    </Button>
                  )}
                  <ImportButton
                    projectId={activeProject.id}
                    onImported={handleImported}
                  />
                  <ThemeToggle />
                </Box>
              </Box>

              {/* Show stats + table only if articles exist */}
              {hasArticles ? (
                <>
                  <StatsBar
                    projectId={activeProject.id}
                    refreshKey={refreshKey}
                  />
                  <ArticleTable
                    projectId={activeProject.id}
                    onReview={handleReview}
                  />
                </>
              ) : (
                /* Empty state */
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 12,
                    border: "2px dashed",
                    borderColor: (theme) => theme.palette.mode === "dark" ? "#1e293b" : "#e2e8f0",
                    borderRadius: 3,
                    background: "background.paper",
                    textAlign: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      background: (theme) => theme.palette.mode === "dark" ? "#1e1b4b" : "#eef2ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 3,
                    }}
                  >
                    <UploadFileIcon
                      sx={{ fontSize: 36, color: "primary.main" }}
                    />
                  </Box>
                  <Typography
                    variant="h6"
                    color="text.primary"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    No articles yet
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ fontSize: 13, mb: 4, maxWidth: 360 }}
                  >
                    Import an Excel file with your PubMed export to get
                    started. Supported columns: title, year, authors,
                    journal, PMID, DOI.
                  </Typography>
                  <ImportButton
                    projectId={activeProject.id}
                    onImported={handleImported}
                  />
                </Box>
              )}
            </>
          ) : (
            /* No projects at all */
            <Box sx={{ textAlign: "center", py: 12 }}>
              <Typography sx={{ fontSize: 48, mb: 2 }}>📋</Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                No projects found
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: 13 }}>
                Something went wrong setting up your account.
                Please sign out and sign back in.
              </Typography>
            </Box>
          )}

        </Box>
      </Box>
    </Box>
  )
}