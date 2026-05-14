import { createBrowserRouter, type RouteObject } from 'react-router'
import MainLayout from '@/components/layout/MainLayout'
import AnalysisList from '@/pages/AnalysisList'
import AnalysisResult from '@/pages/AnalysisResult'
import AnalysisStream from '@/pages/AnalysisStream'
import Dashboard from '@/pages/Dashboard'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import Register from '@/pages/Register'
import ResumeDetail from '@/pages/ResumeDetail'
import ResumeList from '@/pages/ResumeList'
import ResumeStream from '@/pages/ResumeStream'
import Settings from '@/pages/Settings'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'

const routes: RouteObject[] = [
  {
    element: <PublicRoute />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'analysis', element: <AnalysisList /> },
          { path: 'analysis/stream/:analysisId', element: <AnalysisStream /> },
          { path: 'analysis/:analysisId', element: <AnalysisResult /> },
          { path: 'resume', element: <ResumeList /> },
          { path: 'resume/stream/:resumeId', element: <ResumeStream /> },
          { path: 'resume/:resumeId', element: <ResumeDetail /> },
          { path: 'settings', element: <Settings /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]

export const router = createBrowserRouter(routes)
