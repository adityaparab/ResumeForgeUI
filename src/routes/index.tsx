import { lazy, Suspense } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import MainLayout from '@/components/layout/MainLayout'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'

export const pageLoaders = {
  AnalysisList: () => import('@/pages/AnalysisList'),
  AnalysisResult: () => import('@/pages/AnalysisResult'),
  AnalysisStream: () => import('@/pages/AnalysisStream'),
  CreateResume: () => import('@/pages/CreateResume'),
  Dashboard: () => import('@/pages/Dashboard'),
  Login: () => import('@/pages/Login'),
  NotFound: () => import('@/pages/NotFound'),
  Register: () => import('@/pages/Register'),
  ResumeDetail: () => import('@/pages/ResumeDetail'),
  ResumeList: () => import('@/pages/ResumeList'),
  ResumeStream: () => import('@/pages/ResumeStream'),
  Settings: () => import('@/pages/Settings'),
}

const AnalysisList = lazy(pageLoaders.AnalysisList)
const AnalysisResult = lazy(pageLoaders.AnalysisResult)
const AnalysisStream = lazy(pageLoaders.AnalysisStream)
const CreateResume = lazy(pageLoaders.CreateResume)
const Dashboard = lazy(pageLoaders.Dashboard)
const Login = lazy(pageLoaders.Login)
const NotFound = lazy(pageLoaders.NotFound)
const Register = lazy(pageLoaders.Register)
const ResumeDetail = lazy(pageLoaders.ResumeDetail)
const ResumeList = lazy(pageLoaders.ResumeList)
const ResumeStream = lazy(pageLoaders.ResumeStream)
const Settings = lazy(pageLoaders.Settings)

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<LoadingSpinner />}>{element}</Suspense>
}

export const routes: RouteObject[] = [
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
          { path: 'resume/create', element: withSuspense(<CreateResume />) },
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
