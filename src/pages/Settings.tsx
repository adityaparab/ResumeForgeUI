import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded'
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded'
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded'
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { API_URL } from '@/constants'
import { useLogoutMutation } from '@/features/auth/hooks/useAuthMutations'
import { selectAccessToken, selectCurrentUser } from '@/stores/authSlice'
import {
  clearCompletedJobs,
  markAllJobNotificationsRead,
  selectActiveJobs,
  selectTheme,
  selectUnreadJobCount,
  setTheme,
  type Theme,
} from '@/stores/uiSlice'

const THEME_OPTIONS: Array<{ label: string; value: Theme }> = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
]

function isTheme(value: string): value is Theme {
  return value === 'system' || value === 'light' || value === 'dark'
}

export default function Settings() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)
  const accessToken = useAppSelector(selectAccessToken)
  const theme = useAppSelector(selectTheme)
  const activeJobs = useAppSelector(selectActiveJobs)
  const unreadJobCount = useAppSelector(selectUnreadJobCount)
  const logoutMutation = useLogoutMutation()
  const pendingJobCount = activeJobs.filter(
    (job) => job.status === 'pending' || job.status === 'processing',
  ).length
  const finishedJobCount = activeJobs.length - pendingJobCount

  function handleThemeChange(value: string) {
    if (isTheme(value)) {
      dispatch(setTheme(value))
    }
  }

  function markAllRead() {
    dispatch(markAllJobNotificationsRead(new Date().toISOString()))
  }

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box>
        <Typography component="h1" variant="h4">
          Settings
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75 }}>
          Account, appearance, notifications, and session status.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' } }}>
        <Paper
          elevation={0}
          sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 2, sm: 3 } }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Avatar
              sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}
              variant="rounded"
            >
              <AccountCircleRoundedIcon />
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography component="h2" variant="h6">
                Profile
              </Typography>
              <Typography color="text.secondary" noWrap>
                {user?.email ?? 'No profile email available'}
              </Typography>
            </Box>
          </Stack>
          <Divider sx={{ my: 2.5 }} />
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label={accessToken ? 'Authenticated session' : 'No active session'}
              size="small"
              color={accessToken ? 'success' : 'default'}
            />
            <Chip
              label={user?.id ? `User ${user.id}` : 'User profile unavailable'}
              size="small"
              variant="outlined"
            />
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 2, sm: 3 } }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
            <PaletteRoundedIcon color="primary" />
            <Typography component="h2" variant="h6">
              Theme Preference
            </Typography>
          </Stack>
          <FormControl>
            <FormLabel id="theme-preference-label">Color mode</FormLabel>
            <RadioGroup
              aria-labelledby="theme-preference-label"
              name="theme-preference"
              onChange={(event) => handleThemeChange(event.target.value)}
              row
              value={theme}
            >
              {THEME_OPTIONS.map((option) => (
                <FormControlLabel
                  control={<Radio />}
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Paper>

        <Paper
          elevation={0}
          sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 2, sm: 3 } }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
            <MarkEmailReadRoundedIcon color="primary" />
            <Typography component="h2" variant="h6">
              Notifications
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip label={`${activeJobs.length} tracked`} size="small" />
            <Chip
              color="warning"
              label={`${pendingJobCount} in progress`}
              size="small"
              variant="outlined"
            />
            <Chip color="info" label={`${unreadJobCount} unread`} size="small" variant="outlined" />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <Button
              disabled={unreadJobCount === 0}
              onClick={markAllRead}
              startIcon={<MarkEmailReadRoundedIcon />}
              type="button"
              variant="outlined"
            >
              Mark all read
            </Button>
            <Button
              disabled={finishedJobCount === 0}
              onClick={() => dispatch(clearCompletedJobs())}
              startIcon={<DeleteSweepRoundedIcon />}
              type="button"
              variant="outlined"
            >
              Clear finished notifications
            </Button>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 2, sm: 3 } }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
            <SecurityRoundedIcon color="primary" />
            <Typography component="h2" variant="h6">
              API And Account
            </Typography>
          </Stack>
          <Stack spacing={1.5}>
            <Box>
              <Typography color="text.secondary" variant="caption">
                API base
              </Typography>
              <Typography
                sx={{ fontFamily: 'monospace', overflowWrap: 'anywhere' }}
                variant="body2"
              >
                {API_URL}
              </Typography>
            </Box>
            <Box>
              <Typography color="text.secondary" variant="caption">
                Session token
              </Typography>
              <Typography variant="body2">{accessToken ? 'Available' : 'Unavailable'}</Typography>
            </Box>
            <Divider />
            <Button
              color="error"
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
              startIcon={<LogoutRoundedIcon />}
              type="button"
              variant="contained"
            >
              {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Box>
  )
}
