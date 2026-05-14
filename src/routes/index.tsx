import { lazy, Suspense } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import MainLayout from '@/components/layout/MainLayout'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'

const AnalysisList = lazy(() => import('@/pages/AnalysisList'))
const AnalysisResult = lazy(() => import('@/pages/AnalysisResult'))
const AnalysisStream = lazy(() => import('@/pages/AnalysisStream'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Login = lazy(() => import('@/pages/Login'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const Register = lazy(() => import('@/pages/Register'))
const ResumeDetail = lazy(() => import('@/pages/ResumeDetail'))
const ResumeList = lazy(() => import('@/pages/ResumeList'))
const ResumeStream = lazy(() => import('@/pages/ResumeStream'))
const Settings = lazy(() => import('@/pages/Settings'))

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<LoadingSpinner />}>{element}</Suspense>
}

const routes: RouteObject[] = [
  {
    element: <PublicRoute />,
    children: [
      { path: '/login', element: withSuspense(<Login />) },
      { path: '/register', element: withSuspense(<Register />) },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: withSuspense(<Dashboard />) },
          { path: 'analysis', element: withSuspense(<AnalysisList />) },
          { path: 'analysis/stream/:analysisId', element: withSuspense(<AnalysisStream />) },
          { path: 'analysis/:analysisId', element: withSuspense(<AnalysisResult />) },
          { path: 'resume', element: withSuspense(<ResumeList />) },
          { path: 'resume/stream/:resumeId', element: withSuspense(<ResumeStream />) },
          { path: 'resume/:resumeId', element: withSuspense(<ResumeDetail />) },
          { path: 'settings', element: withSuspense(<Settings />) },
        ],
      },
    ],
  },
  {
    path: '*',
    element: withSuspense(<NotFound />),
  },
]

export const router = createBrowserRouter(routes)
