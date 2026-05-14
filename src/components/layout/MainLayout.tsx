import { Outlet } from 'react-router'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <Outlet />
      </main>
    </div>
  )
}
