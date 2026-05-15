import { Paper, Skeleton, Stack } from '@mui/material'

export function StatsCardSkeleton() {
  return (
    <Paper
      aria-label="Loading dashboard metric"
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        p: 3,
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Skeleton animation="wave" height={22} width="46%" />
          <Skeleton animation="wave" height={40} variant="rounded" width={40} />
        </Stack>
        <Skeleton animation="wave" height={48} width="32%" />
        <Skeleton animation="wave" height={18} width="62%" />
      </Stack>
    </Paper>
  )
}
