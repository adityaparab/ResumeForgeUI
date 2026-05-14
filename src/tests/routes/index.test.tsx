import { describe, expect, it } from 'vitest'
import { pageLoaders, router, routes } from '@/routes'

describe('routes', () => {
  it('creates the browser router with public, protected, and fallback route groups', () => {
    expect(router).toBeDefined()
    expect(routes).toHaveLength(3)
    expect(routes[0]?.children?.map((route) => route.path)).toEqual(['/login', '/register'])

    const protectedChildren = routes[1]?.children?.[0]?.children ?? []
    expect(protectedChildren.map((route) => route.path ?? 'index')).toEqual([
      'index',
      'analysis',
      'analysis/stream/:analysisId',
      'analysis/:analysisId',
      'resume',
      'resume/stream/:resumeId',
      'resume/:resumeId',
      'settings',
    ])
    expect(routes[2]?.path).toBe('*')
  })

  it('loads every lazy page module', async () => {
    const modules = await Promise.all(Object.values(pageLoaders).map((loadPage) => loadPage()))

    expect(modules).toHaveLength(Object.keys(pageLoaders).length)
    modules.forEach((module) => {
      expect(module.default).toBeTypeOf('function')
    })
  })
})
