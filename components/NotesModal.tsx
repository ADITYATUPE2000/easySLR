"use client"

import { useState } from "react"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import { Box } from "@mui/material"

type Props = {
  open: boolean
  articleId: string
  articleTitle: string
  existingNotes: string
  onClose: () => void
  onSaved: () => void
}

export default function NotesModal({
  open,
  articleId,
  articleTitle,
  existingNotes,
  onClose,
  onSaved,
}: Props) {
  const [notes, setNotes]   = useState(existingNotes)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/articles/${articleId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    })
    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          pb: 1,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
            Review Notes
          </Typography>
          <Typography
            color="text.secondary"
            sx={{
              fontSize: 12,
              mt: 0.5,
              maxWidth: 380,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {articleTitle}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <TextField
          multiline
          rows={5}
          fullWidth
          placeholder="Write your notes about this article..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          sx={{ mt: 1 }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} size="small" color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          size="medium"
          variant="contained"
          disabled={saving}
          sx={{
            bgcolor: "primary.main",
            color: "#ffffff",
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": {
              bgcolor: (theme) => theme.palette.mode === "dark" ? "#6366f1" : "#4338ca",
              boxShadow: "none",
            },
          }}
        >
          {saving ? "Saving..." : "Save notes"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}