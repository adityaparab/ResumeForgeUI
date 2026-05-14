import { zodResolver } from '@hookform/resolvers/zod'
import { FileText, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLoginMutation } from '@/features/auth/hooks/useAuthMutations'
import { type LoginDto, LoginDtoSchema } from '@/lib/schemas/auth.schema'

export default function Login() {
  const loginMutation = useLoginMutation()

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <FileText className="size-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">ResumeForge</span>
          </div>
          <p className="text-sm text-muted-foreground">
            AI-powered resume analysis and optimization
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                />
                {errors.email && (
                  <p id="email-error" role="alert" className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  {...register('password')}
                />
                {errors.password && (
                  <p id="password-error" role="alert" className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full" size="lg" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>

              {/* API error */}
              {loginMutation.isError && (
                <p role="alert" className="text-center text-sm text-destructive">
                  {loginMutation.error instanceof Error
                    ? loginMutation.error.message
                    : /* v8 ignore next */ 'Login failed. Please try again.'}
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-primary underline underline-offset-4">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
