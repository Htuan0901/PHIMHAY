import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { fetchDashboardCharts, fetchDashboardOverview } from '../api'
import { StatCard } from '../components/StatCard'

export function DashboardPage() {
  const [overview, setOverview] = useState<Awaited<ReturnType<typeof fetchDashboardOverview>> | null>(null)
  const [charts, setCharts] = useState<Awaited<ReturnType<typeof fetchDashboardCharts>>['charts'] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([fetchDashboardOverview(), fetchDashboardCharts(14)])
      .then(([o, c]) => {
        setOverview(o)
        setCharts(c.charts)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Lỗi tải dashboard'))
  }, [])

  if (error) return <p className="admin-error">{error}</p>
  if (!overview) return <p>Đang tải thống kê...</p>

  const chartData = (charts?.dailyActiveUsers || []).map((row, i) => ({
    date: row.date.slice(5),
    active: row.count,
    views: charts?.movieViewsOverTime[i]?.count ?? 0,
    signups: charts?.newRegistrations[i]?.count ?? 0,
    vip: charts?.vipSubscriptions[i]?.count ?? 0,
  }))

  return (
    <>
      <h1 className="admin-page-title">Dashboard</h1>

      <div className="admin-quick-actions">
        <Link to="/admin/content" className="admin-quick-card">
          <strong>Thêm & quản lý phim</strong>
          <span>Import phim từ phimapi, thể loại, gán phim, chỉnh VIP/xem</span>
        </Link>
      </div>

      <div className="admin-stats">
        <StatCard label="Tổng người dùng" value={overview.totalUsers} />
        <StatCard label="Tổng phim" value={overview.totalMovies} />
        <StatCard label="Tổng lượt xem" value={overview.totalViews} />
        <StatCard label="Đăng ký hôm nay" value={overview.newUsersToday} />
        <StatCard label="Thành viên VIP" value={overview.vipUsers} />
      </div>

      <div className="admin-charts">
        <div className="admin-card">
          <h3 style={{ marginTop: 0 }}>Hoạt động 14 ngày</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#2a3142" />
              <XAxis dataKey="date" stroke="#9aa3b5" />
              <YAxis stroke="#9aa3b5" />
              <Tooltip contentStyle={{ background: '#171b26', border: '1px solid #2a3142' }} />
              <Legend />
              <Line type="monotone" dataKey="active" name="Đăng nhập" stroke="#3b82f6" dot={false} />
              <Line type="monotone" dataKey="views" name="Lượt xem" stroke="#10b981" dot={false} />
              <Line type="monotone" dataKey="signups" name="Đăng ký" stroke="#f59e0b" dot={false} />
              <Line type="monotone" dataKey="vip" name="VIP" stroke="#a855f7" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="admin-charts">
        <div className="admin-card">
          <h3 style={{ marginTop: 0 }}>Phim xem nhiều nhất</h3>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Phim</th>
                  <th>Lượt xem</th>
                </tr>
              </thead>
              <tbody>
                {overview.mostViewedMovies.map((m) => (
                  <tr key={m._id}>
                    <td>{m.title}</td>
                    <td>{m.viewCount ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="admin-card">
          <h3 style={{ marginTop: 0 }}>Người dùng hoạt động gần đây</h3>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tài khoản</th>
                  <th>Email</th>
                  <th>Lần cuối</th>
                </tr>
              </thead>
              <tbody>
                {overview.recentlyActiveUsers.map((u) => (
                  <tr key={u.userId}>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{new Date(u.lastActive).toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
