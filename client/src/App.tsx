import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { MovieDetail } from './pages/MovieDetail'
import { Admin } from './pages/Admin'
import { Vip } from './pages/Vip'
import { PaymentReturn } from './pages/PaymentReturn'
import { WatchPage } from './pages/WatchPage'
import { Profile } from './pages/Profile'
import { WatchHistoryPage } from './pages/WatchHistory'
import { AdminLayout, AdminIndexRedirect } from './admin/AdminLayout'
import { DashboardPage } from './admin/pages/DashboardPage'
import { UsersPage } from './admin/pages/UsersPage'
import { ActivityLogsPage } from './admin/pages/ActivityLogsPage'
import { SettingsPage } from './admin/pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/phim/:slug" element={<MovieDetail />} />
            <Route path="/xem-phim/:slug" element={<WatchPage />} />
            <Route path="/vip" element={<Vip />} />
            <Route path="/payment/return" element={<PaymentReturn />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/watch-history" element={<WatchHistoryPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminIndexRedirect />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="logs" element={<ActivityLogsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="content" element={<Admin />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
      <SpeedInsights />
    </BrowserRouter>
  )
}
