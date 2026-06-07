"use client"

import { useEffect } from "react"
import { signOut } from "next-auth/react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

export default function LogoutPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/login" })
  }, [])

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb",
      }}
    >
      <Typography color="text.secondary">Signing you out...</Typography>
    </Box>
  )
}