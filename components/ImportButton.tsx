"use client"

import { useState } from "react"
import Button from "@mui/material/Button"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Alert from "@mui/material/Alert"
import Chip from "@mui/material/Chip"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import WarningIcon from "@mui/icons-material/Warning"
import ErrorIcon from "@mui/icons-material/Error"

type ImportResult = {
  imported: number
  duplicates: number
  errors: { row: number; reason: string }[]
}

type Props = {
  projectId: string
  onImported?: () => void
}

export default function ImportButton({ projectId, onImported }: Props) {
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<ImportResult | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)

    const formData = new FormData()
    formData.append("file", file)

    const res  = await fetch(`/api/projects/${projectId}/import`, {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      throw new Error(`Import failed: status ${res.status}`)
    }
    const contentType = res.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`Expected JSON response, got ${contentType ?? "none"}`)
    }

    const data = await res.json()
    setResult(data)
    setLoading(false)
    setDialogOpen(true)
    onImported?.()

    // Reset file input
    e.target.value = ""
  }

  function handleClose() {
    setDialogOpen(false)
    setResult(null)
  }

  return (
    <>
      <label>
        <input
          type="file"
          accept=".xlsx,.xls"
          style={{ display: "none" }}
          onChange={handleFileChange}
          disabled={loading}
        />
        <Button
          component="span"
          variant="contained"
          size="medium"
          startIcon={<UploadFileIcon sx={{ fontSize: 18 }} />}
          disabled={loading}
          sx={{
            bgcolor: "primary.main",
            color: "#ffffff",
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            fontSize: 13,
            height: 36,
            px: 2,
            boxShadow: "none",
            "&:hover": {
              bgcolor: (theme) => theme.palette.mode === "dark" ? "#6366f1" : "#4338ca",
              boxShadow: "none",
            },
          }}
        >
          {loading ? "Importing..." : "Import Excel"}
        </Button>
      </label>

      {/* Result Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        slotProps = {{
          paper:{
            sx: { borderRadius: 3 }
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 16 }}>
            Import Complete
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: 12, mt: 0.5 }}>
            Here's a summary of your Excel import
          </Typography>
        </DialogTitle>

        <DialogContent>
          {result && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

              {/* Summary chips */}
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", flexDirection: { xs: "column", sm: "row" } }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 2,
                    px: 2,
                    py: 1.5,
                    flex: { xs: "none", sm: 1 },
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  <CheckCircleIcon sx={{ color: "#16a34a", fontSize: 20 }} />
                  <Box>
                    <Typography color="#15803d" sx={{ fontSize: 20, fontWeight: 700 }}>
                      {result.imported}
                    </Typography>
                    <Typography color="#16a34a" sx={{ fontSize: 11 }}>
                      Articles imported
                    </Typography>
                  </Box>
                </Box>

                {result.duplicates > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      background: "#fffbeb",
                      border: "1px solid #fde68a",
                      borderRadius: 2,
                      px: 2,
                      py: 1.5,
                      flex: { xs: "none", sm: 1 },
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    <WarningIcon sx={{ color: "#d97706", fontSize: 20 }} />
                    <Box>
                      <Typography color="#b45309" sx={{ fontSize: 20, fontWeight: 700 }}>
                        {result.duplicates}
                      </Typography>
                      <Typography color="#d97706" sx={{ fontSize: 11 }}>
                        Duplicates skipped
                      </Typography>
                    </Box>
                  </Box>
                )}

                {result.errors?.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: 2,
                      px: 2,
                      py: 1.5,
                      flex: { xs: "none", sm: 1 },
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    <ErrorIcon sx={{ color: "#dc2626", fontSize: 20 }} />
                    <Box>
                      <Typography color="#b91c1c" sx={{ fontSize: 20, fontWeight: 700 }}>
                        {result.errors.length}
                      </Typography>
                      <Typography color="#dc2626" sx={{ fontSize: 11 }}>
                        Rows with errors
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Error details */}
              {result.errors?.length > 0 && (
                <Box>
                  <Typography
                    color="text.secondary"
                    sx={{
                      fontSize: 12,
                      fontWeight: 500,
                      mb: 1,
                    }}
                  >
                    ROW ERRORS
                  </Typography>
                  <Box
                    sx={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    {result.errors.map((e, i) => (
                      <Box
                        key={e.row}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          px: 2,
                          py: 1,
                          borderBottom: i < result.errors.length - 1
                            ? "1px solid #fecaca"
                            : "none",
                        }}
                      >
                        <Chip
                          label={`Row ${e.row}`}
                          size="small"
                          sx={{
                            background: "#fee2e2",
                            color: "#b91c1c",
                            fontSize: 11,
                            fontWeight: 500,
                            height: 20,
                          }}
                        />
                        <Typography color="#dc2626" sx={{ fontSize: 12 }}>
                          {e.reason}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Success message if no errors */}
              {result.errors?.length === 0 && result.duplicates === 0 && (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  All rows imported successfully — no errors found!
                </Alert>
              )}

            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleClose}
            variant="contained"
            sx={{
              bgcolor: "primary.main",
              color: "#ffffff",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              boxShadow: "none",
              "&:hover": {
                bgcolor: (theme) => theme.palette.mode === "dark" ? "#6366f1" : "#4338ca",
                boxShadow: "none",
              },
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}