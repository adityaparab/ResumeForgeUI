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
import { Eye, EyeOff, FileText, Shield, Sparkles, Zap } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { useLoginMutation } from '@/features/auth/hooks/useAuthMutations'
import { type LoginDto, LoginDtoSchema } from '@/lib/schemas/auth.schema'

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

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
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
              Land your dream job
              <br />
              with confidence
            </Heading>
            <Text fontSize="lg" color="whiteAlpha.800" lineHeight="1.6">
              AI-powered resume analysis that helps you stand out from the crowd.
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
                  Welcome back
                </Heading>
                <Text fontSize="sm" color="fg.muted">
                  Sign in to your account to continue
                </Text>
              </VStack>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack gap={4}>
                  {/* Email field */}
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

                  {/* Password field */}
                  <Field.Root invalid={!!errors.password}>
                    <Field.Label fontSize="sm" fontWeight="500" color="fg">
                      Password
                    </Field.Label>
                    <InputGroup
                      w="full"
                      endElement={
                        <IconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          variant="ghost"
                          size="sm"
                          color="fg.muted"
                          onClick={() => setShowPassword((v) => !v)}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </IconButton>
                      }
                    >
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        size="lg"
                        borderRadius="lg"
                        {...register('password')}
                      />
                    </InputGroup>
                    <Field.ErrorText fontSize="xs">{errors.password?.message}</Field.ErrorText>
                  </Field.Root>

                  {/* API error */}
                  {loginMutation.isError && (
                    <Box
                      px={4}
                      py={3}
                      borderRadius="lg"
                      bg="red.subtle"
                      borderWidth="1px"
                      borderColor="red.muted"
                    >
                      <Text role="alert" fontSize="sm" color="red.fg" textAlign="center">
                        {loginMutation.error instanceof Error
                          ? loginMutation.error.message
                          : /* v8 ignore next */ 'Login failed. Please try again.'}
                      </Text>
                    </Box>
                  )}

                  {/* Submit */}
                  <Button
                    type="submit"
                    size="lg"
                    w="full"
                    borderRadius="lg"
                    colorPalette="purple"
                    loading={loginMutation.isPending}
                    loadingText="Signing in…"
                    background="linear-gradient(135deg, #4f46e5, #7c3aed)"
                    _hover={{
                      background: 'linear-gradient(135deg, #4338ca, #6d28d9)',
                      transform: 'translateY(-1px)',
                    }}
                    _active={{ transform: 'translateY(0)' }}
                    transition="all 0.15s ease"
                    shadow="md"
                    fontWeight="600"
                  >
                    Sign in
                  </Button>
                </Stack>
              </form>
            </VStack>
          </Box>

          {/* Register link */}
          <Text fontSize="sm" color="fg.muted" textAlign="center">
            Don&apos;t have an account?{' '}
            <ChakraLink
              asChild
              color="purple.500"
              fontWeight="600"
              _hover={{ color: 'purple.600' }}
            >
              <Link to="/register">Create one free</Link>
            </ChakraLink>
          </Text>
        </VStack>
      </Flex>
    </Flex>
  )
}
