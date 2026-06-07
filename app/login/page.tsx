"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import TextField from "@mui/material/TextField"
import Divider from "@mui/material/Divider"
import Alert from "@mui/material/Alert"
import GitHubIcon from "@mui/icons-material/GitHub"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState(0) // 0 = login, 1 = register
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  async function handleLogin() {
    setError("")
    setLoading(true)

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/",
      })

      if (res?.error) {
        setError(
          res.error === "CredentialsSignin"
            ? "Incorrect email or password"
            : res.error
        )
        setLoading(false)
      } else if (res?.ok) {
        window.location.href = "/"  // ← force hard redirect instead of router.push
      } else {
        setError("Something went wrong. Please try again.")
        setLoading(false)
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  async function handleRegister() {
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        setLoading(false)
        return
      }

      // Auto login after register
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/",
      })

      if (loginRes?.ok) {
        window.location.href = "/"
      } else {
        setError("Account created! Please sign in.")
        setTab(0)
        setLoading(false)
      }
    } catch (err) {
      console.error("Register error:", err)
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        background: (theme) => theme.palette.mode === "dark"
          ? "linear-gradient(135deg, #090d16 0%, #0f172a 100%)"
          : "linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          maxWidth: 420,
          width: "100%",
          background: "background.paper",
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: "primary.main",
            }}
          />
          <Typography sx={{ fontWeight: 700, fontSize: 22 }}>
            EasySLR
          </Typography>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, v) => {
            setTab(v)
            setError("")
            setSuccess("")
          }}
          variant="fullWidth"
          sx={{ mb: 3, borderBottom: "1px solid #e5e7eb" }}
        >
          <Tab label="Sign In" sx={{ textTransform: "none", fontWeight: 500 }} />
          <Tab label="Create Account" sx={{ textTransform: "none", fontWeight: 500 }} />
        </Tabs>

        {/* Error / Success alerts */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* Sign In form */}
        {tab === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Email"
              type="email"
              size="small"
              fullWidth
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
            <TextField
              label="Password"
              type="password"
              size="small"
              fullWidth
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleLogin}
              disabled={loading}
              sx={{
                bgcolor: "primary.main",
                color: "#ffffff",
                borderRadius: 2,
                py: 1.25,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "none",
                "&:hover": {
                  bgcolor: (theme) => theme.palette.mode === "dark" ? "#6366f1" : "#4338ca",
                  boxShadow: "none",
                },
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </Box>
        )}

        {/* Register form */}
        {tab === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Full Name"
              size="small"
              fullWidth
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <TextField
              label="Email"
              type="email"
              size="small"
              fullWidth
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              size="small"
              fullWidth
              value={password}
              onChange={e => setPassword(e.target.value)}
              helperText="Minimum 6 characters"
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleRegister}
              disabled={loading}
              sx={{
                bgcolor: "primary.main",
                color: "#ffffff",
                borderRadius: 2,
                py: 1.25,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "none",
                "&:hover": {
                  bgcolor: (theme) => theme.palette.mode === "dark" ? "#6366f1" : "#4338ca",
                  boxShadow: "none",
                },
              }}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </Box>
        )}

        {/* Divider */}
        <Divider sx={{ my: 3 }}>
          <Typography color="text.disabled" sx={{ fontSize: 12 }}>
            or continue with
          </Typography>
        </Divider>

        {/* GitHub button */}
        <Button
          fullWidth
          variant="outlined"
          size="large"
          startIcon={<GitHubIcon />}
          onClick={() => signIn("github", { callbackUrl: "/" })}
          sx={{
            borderColor: "divider",
            color: "text.primary",
            borderRadius: 2,
            py: 1.25,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              background: "action.hover",
              borderColor: "text.secondary",
            },
          }}
        >
          Continue with GitHub
        </Button>
      </Paper>
    </Box>
  )
}