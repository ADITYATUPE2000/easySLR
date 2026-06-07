"use client"

import IconButton from "@mui/material/IconButton"
import Tooltip from "@mui/material/Tooltip"
import DarkModeIcon from "@mui/icons-material/DarkMode"
import LightModeIcon from "@mui/icons-material/LightMode"
import { useThemeMode } from "@/context/ThemeContext"
import { SxProps, Theme } from "@mui/material/styles"

type Props = {
  sx?: SxProps<Theme>
}

export default function ThemeToggle({ sx }: Props) {
  const { isDark, toggleTheme } = useThemeMode()

  return (
    <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <IconButton
        onClick={toggleTheme}
        size="medium"
        sx={{
          background: isDark ? "#0f172a" : "#ffffff",
          border: "1px solid",
          borderColor: isDark ? "#1e293b" : "#e2e8f0",
          color: isDark ? "#ffffff" : "#475569",
          borderRadius: "50%",
          width: 36,
          height: 36,
          "&:hover": {
            background: isDark ? "#1e293b" : "#f1f5f9",
            borderColor: isDark ? "#334155" : "#cbd5e1",
          },
          ...sx,
        }}
      >
        {isDark
          ? <LightModeIcon sx={{ fontSize: 18, color: "#fbbf24" }} />
          : <DarkModeIcon  sx={{ fontSize: 18, color: "#6366f1" }} />
        }
      </IconButton>
    </Tooltip>
  )
}