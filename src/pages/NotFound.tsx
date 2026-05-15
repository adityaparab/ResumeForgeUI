import { Button, Center, Heading, Text, VStack } from '@chakra-ui/react'
import { Home } from 'lucide-react'
import { Link } from 'react-router'

export default function NotFound() {
  return (
    <Center minH="100dvh" px={4}>
      <VStack gap={6} textAlign="center">
        <Text
          fontSize={{ base: '7xl', md: '9xl' }}
          fontWeight="900"
          color="purple.500"
          lineHeight="1"
          letterSpacing="tight"
        >
          404
        </Text>
        <VStack gap={2}>
          <Heading as="h1" size="2xl" color="fg">
            Page not found
          </Heading>
          <Text color="fg.muted" fontSize="lg" maxW="sm">
            Sorry, we couldn&rsquo;t find the page you&rsquo;re looking for.
          </Text>
        </VStack>
        <Button asChild colorPalette="purple" size="lg" borderRadius="lg">
          <Link to="/">
            <Home size={18} />
            Go home
          </Link>
        </Button>
      </VStack>
    </Center>
  )
}
