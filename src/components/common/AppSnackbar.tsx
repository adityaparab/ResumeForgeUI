import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { Alert, IconButton, Snackbar } from '@mui/material'
import { useEffect, useState } from 'react'
import { subscribeToToasts, type ToastMessage } from './toast'

export default function AppSnackbar() {
  const [currentToast, setCurrentToast] = useState<ToastMessage | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    return subscribeToToasts((message) => {
      setCurrentToast(message)
      setOpen(true)
    })
  }, [])

  function handleClose(_event?: React.SyntheticEvent | Event, reason?: string) {
    if (reason === 'clickaway') return
    setOpen(false)
  }

  const autoHideDuration =
    currentToast?.duration === Number.POSITIVE_INFINITY ? null : (currentToast?.duration ?? 6000)

  return (
    <Snackbar
      key={currentToast?.id}
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        severity={currentToast?.severity ?? 'info'}
        variant="filled"
        onClose={handleClose}
        action={
          <IconButton
            color="inherit"
            size="small"
            aria-label="Dismiss notification"
            onClick={handleClose}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        }
        sx={{ width: '100%' }}
      >
        {currentToast?.message}
      </Alert>
    </Snackbar>
  )
}
