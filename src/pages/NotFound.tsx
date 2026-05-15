import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import LoginRoundedIcon from '@mui/icons-material/LoginRounded'
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded'
import { Avatar, Box, Button, Container, Paper, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router'

export default function NotFound() {
  return (
    <Container
      component="main"
      maxWidth="sm"
      sx={{ display: 'grid', minHeight: '100vh', placeItems: 'center', py: 4 }}
    >
      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          p: { xs: 3, sm: 5 },
          width: '100%',
        }}
      >
        <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Avatar
            sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', height: 64, width: 64 }}
          >
            <SearchOffRoundedIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography component="h1" variant="h2">
              404
            </Typography>
            <Typography color="text.secondary" component="p" variant="h6">
              Page not found
            </Typography>
          </Box>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ width: '100%', justifyContent: 'center' }}
          >
            <Button
              component={RouterLink}
              startIcon={<HomeRoundedIcon />}
              to="/"
              variant="contained"
            >
              Go Home
            </Button>
            <Button
              component={RouterLink}
              startIcon={<LoginRoundedIcon />}
              to="/login"
              variant="outlined"
            >
              Sign In
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  )
}
