import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { MonthlyLeaderboard } from '@/features/leaderboard/pages/MonthlyLeaderboard'
import { ChampionshipList } from '@/features/championships/pages/ChampionshipList'
import { ChampionshipDetail } from '@/features/championships/pages/ChampionshipDetail'
import { AdminLogin } from '@/features/auth/pages/AdminLogin'
import { AdminDashboard } from '@/features/auth/pages/AdminDashboard'
import { AdminChampionships } from '@/features/championships/pages/AdminChampionships'
import { AdminChampionshipDetail } from '@/features/championships/pages/AdminChampionshipDetail'
import { AdminPlayers } from '@/features/players/pages/AdminPlayers'

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<MonthlyLeaderboard />} />
          <Route path="championships" element={<ChampionshipList />} />
          <Route path="championships/:id" element={<ChampionshipDetail />} />
          <Route path="admin/login" element={<AdminLogin />} />
        </Route>
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="championships" element={<AdminChampionships />} />
          <Route path="championships/:id" element={<AdminChampionshipDetail />} />
          <Route path="players" element={<AdminPlayers />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
