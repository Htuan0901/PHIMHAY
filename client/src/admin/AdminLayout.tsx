import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './admin.css'

const links: { to: string; label: string; highlight?: boolean }[] = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/content', label: 'Thêm & quản lý phim', highlight: true },
  { to: '/admin/users', label: 'Người dùng' },
  { to: '/admin/logs', label: 'Nhật ký' },
  { to: '/admin/settings', label: 'Cài đặt' },
]

function isAdminUser(user: { isAdmin?: boolean; role?: string } | null) {
  return !!user && (user.isAdmin || user.role === 'admin')
}

export function AdminLayout() {
  const { user, loading } = useAuth()

  if (loading) return <p style={{ padding: '2rem' }}>Đang tải...</p>
  if (!isAdminUser(user)) return <Navigate to="/" replace />

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <h2>PHIMHAY Admin</h2>
        <nav className="admin-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                [isActive ? 'active' : '', l.highlight ? 'admin-nav--movies' : ''].filter(Boolean).join(' ')
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}

export function AdminIndexRedirect() {
  return <Navigate to="/admin/content" replace />
}
