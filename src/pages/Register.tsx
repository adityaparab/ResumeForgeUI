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
import { z } from 'zod'
import AuthPageShell from '@/features/auth/components/AuthPageShell'
import { useRegisterMutation } from '@/features/auth/hooks/useAuthMutations'

const RegisterFormSchema = z
  .object({
    email: z
      .string()
      .email('Invalid email address')
      .max(254, 'Email must be at most 254 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be at most 128 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof RegisterFormSchema>

export default function Register() {
  const registerMutation = useRegisterMutation()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterFormSchema),
  })

  const onSubmit = ({ email, password }: RegisterFormData) => {
    registerMutation.mutate({ email, password })
  }

  const { ref: emailRef, ...emailField } = register('email')
  const { ref: passwordRef, ...passwordField } = register('password')
  const { ref: confirmPasswordRef, ...confirmPasswordField } = register('confirmPassword')

  return (
    <AuthPageShell
      title="Create an account"
      subtitle="Start managing resume analysis workflows with a protected workspace."
      footer={
        <>
          Already have an account?{' '}
          <MuiLink component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 700 }}>
            Sign in
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
              id: 'register-email-helper-text',
              role: errors.email ? 'alert' : undefined,
            },
          }}
          {...emailField}
        />

        <TextField
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Minimum 8 characters"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          inputRef={passwordRef}
          fullWidth
          slotProps={{
            formHelperText: {
              id: 'register-password-helper-text',
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

        <TextField
          id="confirmPassword"
          label="Confirm password"
          type={showConfirmPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Repeat your password"
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword?.message}
          inputRef={confirmPasswordRef}
          fullWidth
          slotProps={{
            formHelperText: {
              id: 'register-confirm-password-helper-text',
              role: errors.confirmPassword ? 'alert' : undefined,
            },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip
                    title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    <IconButton
                      aria-label={
                        showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                      }
                      edge="end"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      onMouseDown={(event) => event.preventDefault()}
                    >
                      {showConfirmPassword ? (
                        <VisibilityOffRoundedIcon />
                      ) : (
                        <VisibilityRoundedIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            },
          }}
          {...confirmPasswordField}
        />

        {registerMutation.isError && (
          <Alert severity="error" role="alert">
            {registerMutation.error instanceof Error
              ? registerMutation.error.message
              : /* v8 ignore next */ 'Registration failed. Please try again.'}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={registerMutation.isPending}
          fullWidth
          sx={{ minHeight: 48 }}
        >
          {registerMutation.isPending ? (
            <>
              <CircularProgress color="inherit" size={18} sx={{ mr: 1 }} />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </Stack>
    </AuthPageShell>
  )
}
