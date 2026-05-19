import { api } from '../api/client'

export type AdminUser = {
  id: string
  username: string
  email: string
  role: 'user' | 'moderator' | 'admin'
  isVIP: boolean
  vipExpireAt: string | null
  isUnlimitedVIP: boolean
  vipActive: boolean
  banned: boolean
  createdAt: string
  lastLogin: string | null
  isAdmin: boolean
}

export type Pagination = { page: number; limit: number; total: number; pages: number }

export type ActivityLogItem = {
  id: string
  actorId: string | null
  actorName: string | null
  actorEmail: string | null
  actorRole: string
  action: string
  targetType: string
  targetId: string
  metadata: Record<string, unknown>
  ipAddress: string
  createdAt: string
}

export type SystemSettings = {
  siteName: string
  logo: string
  bannerImages: string[]
  maintenanceMode: boolean
  registrationEnabled: boolean
  commentsEnabled: boolean
  emailConfig: {
    host: string
    port: number
    user: string
    password: string
    from: string
  }
  thirdPartyAPIKeys: { phimapi: string; vnpay: string }
}

export async function fetchDashboardOverview() {
  return api<{
    totalUsers: number
    totalMovies: number
    totalViews: number
    newUsersToday: number
    vipUsers: number
    mostViewedMovies: { _id: string; title: string; slug: string; viewCount: number }[]
    recentlyActiveUsers: { userId: string; username: string; email: string; lastActive: string }[]
  }>('/api/admin/dashboard/overview')
}

export async function fetchDashboardCharts(days = 14) {
  return api<{
    days: number
    charts: {
      dailyActiveUsers: { date: string; count: number }[]
      movieViewsOverTime: { date: string; count: number }[]
      newRegistrations: { date: string; count: number }[]
      vipSubscriptions: { date: string; count: number }[]
    }
  }>(`/api/admin/dashboard/charts?days=${days}`)
}

export async function fetchUsers(params: Record<string, string | number>) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== undefined) q.set(k, String(v))
  })
  return api<{ items: AdminUser[]; pagination: Pagination }>(`/api/admin/users?${q}`)
}

export async function banUser(id: string) {
  return api<{ user: AdminUser }>(`/api/admin/users/${id}/ban`, { method: 'PATCH' })
}

export async function unbanUser(id: string) {
  return api<{ user: AdminUser }>(`/api/admin/users/${id}/unban`, { method: 'PATCH' })
}

export async function deleteUser(id: string) {
  return api<{ ok: boolean }>(`/api/admin/users/${id}`, { method: 'DELETE' })
}

export async function resetUserPassword(id: string, newPassword: string) {
  return api<{ ok: boolean }>(`/api/admin/users/${id}/reset-password`, {
    method: 'POST',
    json: { newPassword },
  })
}

export async function setUserRole(id: string, role: AdminUser['role']) {
  return api<{ user: AdminUser }>(`/api/admin/users/${id}/role`, {
    method: 'PATCH',
    json: { role },
  })
}

export async function updateUserVip(id: string, body: Record<string, unknown>) {
  return api<{ user: AdminUser }>(`/api/admin/users/${id}/vip`, {
    method: 'PATCH',
    json: body,
  })
}

export async function fetchActivityLogs(params: Record<string, string | number>) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== '' && v !== undefined) q.set(k, String(v))
  })
  return api<{ items: ActivityLogItem[]; pagination: Pagination }>(`/api/admin/logs?${q}`)
}

export async function fetchAdminSettings() {
  return api<{ settings: SystemSettings }>('/api/admin/settings')
}

export async function updateAdminSettings(body: Partial<SystemSettings>) {
  return api<{ settings: SystemSettings }>('/api/admin/settings', {
    method: 'PUT',
    json: body,
  })
}
