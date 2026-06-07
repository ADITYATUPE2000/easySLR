"use client"

import { useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Avatar from "@mui/material/Avatar"
import Divider from "@mui/material/Divider"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import ArticleIcon from "@mui/icons-material/Article"
import LogoutIcon from "@mui/icons-material/Logout"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import SettingsIcon from "@mui/icons-material/Settings"
import { useSession, signOut } from "next-auth/react"

type Project = {
  id: string
  name: string
  _count: { articles: number }
}

type Props = {
  projects: Project[]
  activeProjectId: string
  onSelectProject: (id: string) => void
  isMobile?: boolean
  onClose?: () => void
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default function Sidebar({
  projects,
  activeProjectId,
  onSelectProject,
  isMobile = false,
  onClose,
}: Props) {
  const { data: session } = useSession()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(anchorEl)

  function handleUserClick(e: React.MouseEvent<HTMLElement>) {
    setAnchorEl(e.currentTarget)
  }

  function handleMenuClose() {
    setAnchorEl(null)
  }

  async function handleSignOut() {
    handleMenuClose()
    await signOut({ callbackUrl: "/login" })
  }

  const userInitials = session?.user?.name ? getInitials(session.user.name) : "AT"

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "background.paper",
        ...(isMobile
          ? {
              width: "100%",
            }
          : {
              width: 240,
              flexShrink: 0,
              borderRight: "1px solid",
              borderColor: "divider",
              position: "sticky",
              top: 0,
              height: "100vh",
              zIndex: 100,
            }),
      }}
    >
      {/* Logo */}
      <Box sx={{ px: 3, pt: 3.5, pb: 1 }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 22,
            color: "primary.main",
            letterSpacing: "-0.02em",
            fontFamily: "var(--font-geist-sans), sans-serif",
          }}
        >
          EasySLR
        </Typography>
      </Box>

      {/* Workspace Selector Card */}
      <Box sx={{ px: 2, pt: 1.5, pb: 2.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 1.5,
            py: 1.25,
            borderRadius: 2.5,
            border: "1px solid",
            borderColor: "divider",
            background: (theme) => theme.palette.mode === "dark" ? "#161e31" : "#f8fafc",
            cursor: "pointer",
            "&:hover": {
              borderColor: "primary.main",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, overflow: "hidden" }}>
            <Avatar
              variant="rounded"
              sx={{
                width: 28,
                height: 28,
                fontSize: 11,
                fontWeight: 600,
                background: "#818cf8",
                color: "#ffffff",
                borderRadius: 1.2,
              }}
            >
              {userInitials}
            </Avatar>
            <Typography noWrap sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}>
              {session?.user?.name ?? "AdityaTupe"}
            </Typography>
          </Box>
          <KeyboardArrowDownIcon sx={{ fontSize: 16, color: "text.secondary" }} />
        </Box>
      </Box>

      {/* Projects heading */}
      <Box sx={{ px: 2, mb: 1 }}>
        <Typography
          color="text.secondary"
          sx={{
            fontSize: 10,
            fontWeight: 700,
            px: 1,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Projects
        </Typography>
      </Box>

      {/* Projects list */}
      <Box sx={{ px: 2, flex: 1, overflowY: "auto" }}>
        {projects.length === 0 ? (
          <Box sx={{ px: 1, py: 2 }}>
            <Typography color="text.secondary" sx={{ fontSize: 12 }}>
              No projects yet
            </Typography>
          </Box>
        ) : (
          projects.map(project => {
            const isActive = project.id === activeProjectId
            return (
              <Box
                key={project.id}
                onClick={() => {
                  onSelectProject(project.id)
                  if (isMobile && onClose) onClose()
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 1.5,
                  py: 1.25,
                  borderRadius: 2,
                  cursor: "pointer",
                  mb: 0.5,
                  background: isActive
                    ? (theme) => theme.palette.mode === "dark" ? "#1e1b4b" : "#eef2ff"
                    : "transparent",
                  color: isActive ? "primary.main" : "text.secondary",
                  "&:hover": {
                    background: isActive
                      ? (theme) => theme.palette.mode === "dark" ? "#1e1b4b" : "#eef2ff"
                      : "action.hover",
                  },
                }}
              >
                <ArticleIcon
                  sx={{
                    fontSize: 16,
                    color: isActive ? "primary.main" : "text.secondary",
                  }}
                />
                <Typography
                  noWrap
                  sx={{
                    fontSize: 12.5,
                    fontWeight: isActive ? 600 : 500,
                    flex: 1,
                  }}
                >
                  {project.name}
                </Typography>
                {project._count.articles > 0 && (
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 600,
                      background: isActive ? "primary.main" : (theme) => theme.palette.mode === "dark" ? "#1e293b" : "#f1f5f9",
                      color: isActive ? "#fff" : "text.secondary",
                      borderRadius: 10,
                      px: 0.75,
                      py: 0.25,
                      minWidth: 20,
                      textAlign: "center",
                    }}
                  >
                    {project._count.articles}
                  </Typography>
                )}
              </Box>
            )
          })
        )}
      </Box>

      <Divider sx={{ opacity: 0.6 }} />

      {/* User footer */}
      <Box
        onClick={handleUserClick}
        sx={{
          p: 1.5,
          m: 1,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          cursor: "pointer",
          borderRadius: 2.5,
          border: "1px solid",
          borderColor: "divider",
          background: (theme) => theme.palette.mode === "dark" ? "#111827" : "#ffffff",
          "&:hover": { background: "action.hover" },
        }}
      >
        <Avatar
          variant="rounded"
          src={session?.user?.image ?? undefined}
          sx={{
            width: 32,
            height: 32,
            fontSize: 11,
            fontWeight: 600,
            background: "#818cf8",
            color: "#ffffff",
            borderRadius: 1.2,
          }}
        >
          {userInitials}
        </Avatar>
        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <Typography noWrap sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}>
            {session?.user?.name}
          </Typography>
          <Typography color="text.secondary" noWrap sx={{ fontSize: 11 }}>
            {/* {session?.user?.email} */}
          </Typography>
        </Box>
        <SettingsIcon sx={{ fontSize: 18, color: "text.secondary" }} />
      </Box>

      {/* Logout menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "bottom", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 180,
              borderRadius: 3,
              boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)",
              border: "1px solid",
              borderColor: "divider",
            },
          },
        }}
      >
        <MenuItem disabled sx={{ opacity: "1 !important" }}>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
              {session?.user?.name}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: 11 }}>
              {session?.user?.email}
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleSignOut}
          sx={{ color: "#ef4444", gap: 1, fontSize: 13, fontWeight: 500 }}
        >
          <LogoutIcon fontSize="small" />
          Sign out
        </MenuItem>
      </Menu>
    </Box>
  )
}