import { zodResolver } from '@hookform/resolvers/zod'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import {
  Alert,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link as RouterLink } from 'react-router'
import AuthPageShell from '@/features/auth/components/AuthPageShell'
import { useLoginMutation } from '@/features/auth/hooks/useAuthMutations'
import { type LoginDto, LoginDtoSchema } from '@/lib/schemas/auth.schema'

export default function Login() {
  const loginMutation = useLoginMutation()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({
    resolver: zodResolver(LoginDtoSchema),
  })

  const onSubmit = (data: LoginDto) => {
    loginMutation.mutate(data)
  }

  const { ref: emailRef, ...emailField } = register('email')
  const { ref: passwordRef, ...passwordField } = register('password')

  return (
    <AuthPageShell
      title="Welcome back"
      subtitle="Sign in to continue your resume analysis workspace."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <MuiLink component={RouterLink} to="/register" underline="hover" sx={{ fontWeight: 700 }}>
            Create one
          </MuiLink>
        </>
      }
    >
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          inputRef={emailRef}
          fullWidth
          slotProps={{
            formHelperText: {
              id: 'login-email-helper-text',
              role: errors.email ? 'alert' : undefined,
            },
          }}
          {...emailField}
        />

        <TextField
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Enter your password"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          inputRef={passwordRef}
          fullWidth
          slotProps={{
            formHelperText: {
              id: 'login-password-helper-text',
              role: errors.password ? 'alert' : undefined,
            },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={showPassword ? 'Hide password' : 'Show password'}>
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      edge="end"
                      onClick={() => setShowPassword((value) => !value)}
                      onMouseDown={(event) => event.preventDefault()}
                    >
                      {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            },
          }}
          {...passwordField}
        />

        {loginMutation.isError && (
          <Alert severity="error" role="alert">
            {loginMutation.error instanceof Error
              ? loginMutation.error.message
              : /* v8 ignore next */ 'Login failed. Please try again.'}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loginMutation.isPending}
          fullWidth
          sx={{ minHeight: 48 }}
        >
          {loginMutation.isPending ? (
            <>
              <CircularProgress color="inherit" size={18} sx={{ mr: 1 }} />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </Stack>
    </AuthPageShell>
  )
}
