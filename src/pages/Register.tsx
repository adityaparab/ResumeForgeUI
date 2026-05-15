import {
  Box,
  Button,
  Link as ChakraLink,
  Field,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  Separator,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle, Eye, EyeOff, FileText, Shield, Sparkles, Zap } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'
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

const BRAND_FEATURES = [
  {
    icon: Sparkles,
    title: 'AI-Powered Analysis',
    description: 'Instant, detailed feedback on every section of your resume',
  },
  {
    icon: Shield,
    title: 'ATS Optimization',
    description: 'Beat applicant tracking systems with keyword intelligence',
  },
  {
    icon: Zap,
    title: 'Real-Time Scoring',
    description: 'Live scoring and targeted suggestions as you improve',
  },
] as const

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const registerMutation = useRegisterMutation()

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

  return (
    <Flex minH="100dvh" direction={{ base: 'column', lg: 'row' }}>
      {/* ── Left: brand panel (desktop only) ── */}
      <Box
        display={{ base: 'none', lg: 'flex' }}
        flex="1"
        flexDir="column"
        alignItems="center"
        justifyContent="center"
        p={14}
        position="relative"
        overflow="hidden"
        background="linear-gradient(145deg, #4f46e5 0%, #7c3aed 40%, #2563eb 100%)"
        color="white"
      >
        {/* Decorative blobs */}
        <Box
          position="absolute"
          top="-80px"
          right="-80px"
          w="360px"
          h="360px"
          borderRadius="full"
          background="whiteAlpha.100"
          filter="blur(60px)"
          pointerEvents="none"
        />
        <Box
          position="absolute"
          bottom="-100px"
          left="-60px"
          w="400px"
          h="400px"
          borderRadius="full"
          background="whiteAlpha.100"
          filter="blur(80px)"
          pointerEvents="none"
        />

        {/* Brand content */}
        <VStack gap={10} position="relative" maxW="440px" w="full" align="flex-start">
          {/* Logo */}
          <Flex align="center" gap={3}>
            <Flex
              align="center"
              justify="center"
              w={12}
              h={12}
              borderRadius="xl"
              background="whiteAlpha.200"
              backdropFilter="blur(8px)"
            >
              <FileText size={24} color="white" />
            </Flex>
            <Text fontSize="2xl" fontWeight="800" letterSpacing="tight" color="white">
              ResumeForge
            </Text>
          </Flex>

          <VStack gap={3} align="flex-start">
            <Heading
              as="h1"
              fontSize={{ lg: '3xl', xl: '4xl' }}
              fontWeight="800"
              lineHeight="1.2"
              color="white"
            >
              Start your journey
              <br />
              toward the perfect job
            </Heading>
            <Text fontSize="lg" color="whiteAlpha.800" lineHeight="1.6">
              Join thousands of professionals levelling up their careers with AI.
            </Text>
          </VStack>

          <Separator borderColor="whiteAlpha.300" />

          {/* Feature list */}
          <Stack gap={6} w="full">
            {BRAND_FEATURES.map(({ icon: Icon, title, description }) => (
              <Flex key={title} gap={4} align="flex-start">
                <Flex
                  shrink={0}
                  align="center"
                  justify="center"
                  w={10}
                  h={10}
                  borderRadius="lg"
                  background="whiteAlpha.200"
                  mt={0.5}
                >
                  <Icon size={18} color="white" />
                </Flex>
                <VStack gap={0.5} align="flex-start">
                  <Text fontWeight="700" color="white" fontSize="sm">
                    {title}
                  </Text>
                  <Text fontSize="sm" color="whiteAlpha.700" lineHeight="1.5">
                    {description}
                  </Text>
                </VStack>
              </Flex>
            ))}
          </Stack>

          {/* Social proof */}
          <Flex gap={6} pt={2}>
            {['50k+ resumes analysed', '3× more interviews', 'Free to start'].map((stat) => (
              <Flex key={stat} align="center" gap={1.5}>
                <CheckCircle size={14} color="white" opacity={0.8} />
                <Text fontSize="xs" color="whiteAlpha.800" fontWeight="500">
                  {stat}
                </Text>
              </Flex>
            ))}
          </Flex>
        </VStack>
      </Box>

      {/* ── Right: form panel ── */}
      <Flex
        flex={{ base: '1', lg: '0 0 480px' }}
        direction="column"
        align="center"
        justify="center"
        bg="bg"
        px={{ base: 5, sm: 8, lg: 12 }}
        py={{ base: 10, lg: 0 }}
        minH={{ base: '100dvh', lg: 'unset' }}
      >
        <VStack gap={8} w="full" maxW="380px">
          {/* Mobile logo */}
          <Flex display={{ base: 'flex', lg: 'none' }} align="center" gap={2.5} direction="column">
            <Flex
              align="center"
              justify="center"
              w={14}
              h={14}
              borderRadius="2xl"
              background="linear-gradient(135deg, #4f46e5, #7c3aed)"
              shadow="lg"
            >
              <FileText size={26} color="white" />
            </Flex>
            <VStack gap={1}>
              <Text fontSize="2xl" fontWeight="800" color="fg" letterSpacing="tight">
                ResumeForge
              </Text>
              <Text fontSize="sm" color="fg.muted" textAlign="center">
                AI-powered resume analysis
              </Text>
            </VStack>
          </Flex>

          {/* Form card */}
          <Box
            w="full"
            borderWidth="1px"
            borderColor="border.subtle"
            borderRadius="2xl"
            bg="bg.subtle"
            p={{ base: 6, sm: 8 }}
            shadow="sm"
          >
            <VStack gap={6} align="stretch">
              <VStack gap={1} align="flex-start">
                <Heading as="h2" fontSize="xl" fontWeight="700" color="fg">
                  Create your account
                </Heading>
                <Text fontSize="sm" color="fg.muted">
                  Get started with ResumeForge today — it's free
                </Text>
              </VStack>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <VStack gap={4} align="stretch">
                  {/* Email */}
                  <Field.Root invalid={!!errors.email}>
                    <Field.Label fontSize="sm" fontWeight="500" color="fg">
                      Email address
                    </Field.Label>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      size="lg"
                      borderRadius="lg"
                      {...register('email')}
                    />
                    <Field.ErrorText fontSize="xs">{errors.email?.message}</Field.ErrorText>
                  </Field.Root>

                  {/* Password */}
                  <Field.Root invalid={!!errors.password}>
                    <Field.Label fontSize="sm" fontWeight="500" color="fg">
                      Password
                    </Field.Label>
                    <InputGroup
                      endElement={
                        <IconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          variant="ghost"
                          size="sm"
                          tabIndex={-1}
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </IconButton>
                      }
                    >
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Min. 8 characters"
                        size="lg"
                        borderRadius="lg"
                        {...register('password')}
                      />
                    </InputGroup>
                    <Field.ErrorText fontSize="xs">{errors.password?.message}</Field.ErrorText>
                  </Field.Root>

                  {/* Confirm password */}
                  <Field.Root invalid={!!errors.confirmPassword}>
                    <Field.Label fontSize="sm" fontWeight="500" color="fg">
                      Confirm password
                    </Field.Label>
                    <InputGroup
                      endElement={
                        <IconButton
                          aria-label={showConfirm ? 'Hide password' : 'Show password'}
                          variant="ghost"
                          size="sm"
                          tabIndex={-1}
                          onClick={() => setShowConfirm((v) => !v)}
                        >
                          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </IconButton>
                      }
                    >
                      <Input
                        type={showConfirm ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Repeat your password"
                        size="lg"
                        borderRadius="lg"
                        {...register('confirmPassword')}
                      />
                    </InputGroup>
                    <Field.ErrorText fontSize="xs">
                      {errors.confirmPassword?.message}
                    </Field.ErrorText>
                  </Field.Root>

                  {/* API error */}
                  {registerMutation.isError && (
                    <Box
                      px={4}
                      py={3}
                      borderRadius="lg"
                      bg="red.subtle"
                      borderWidth="1px"
                      borderColor="red.200"
                    >
                      <Text role="alert" fontSize="sm" color="red.600" textAlign="center">
                        {registerMutation.error instanceof Error
                          ? registerMutation.error.message
                          : /* v8 ignore next */ 'Registration failed. Please try again.'}
                      </Text>
                    </Box>
                  )}

                  {/* Submit */}
                  <Button
                    type="submit"
                    colorPalette="purple"
                    size="lg"
                    w="full"
                    borderRadius="lg"
                    fontWeight="600"
                    loading={registerMutation.isPending}
                    loadingText="Creating account…"
                    mt={2}
                  >
                    Create account
                  </Button>
                </VStack>
              </form>
            </VStack>
          </Box>

          {/* Sign-in link */}
          <Text fontSize="sm" color="fg.muted" textAlign="center">
            Already have an account?{' '}
            <ChakraLink asChild fontWeight="600" color="purple.600">
              <Link to="/login">Sign in</Link>
            </ChakraLink>
          </Text>
        </VStack>
      </Flex>
    </Flex>
  )
}
