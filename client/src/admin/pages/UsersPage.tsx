import { useCallback, useEffect, useState } from 'react'
import {
  banUser,
  deleteUser,
  fetchUsers,
  resetUserPassword,
  setUserRole,
  unbanUser,
  updateUserVip,
  type AdminUser,
} from '../api'
import { ConfirmModal } from '../components/ConfirmModal'
import { Pagination } from '../components/Pagination'
import { RoleBadge, VipBadge } from '../components/VipBadge'

export function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 })
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [vip, setVip] = useState('')
  const [banned, setBanned] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState<{
    type: 'ban' | 'unban' | 'delete' | 'reset' | 'vip'
    user: AdminUser
  } | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [vipDays, setVipDays] = useState('30')
  const [vipDate, setVipDate] = useState('')

  const load = useCallback(
    async (page = 1) => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchUsers({ page, limit: 20, search, role, vip, banned })
        setUsers(data.items)
        setPagination(data.pagination)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Lỗi tải danh sách')
      } finally {
        setLoading(false)
      }
    },
    [search, role, vip, banned]
  )

  useEffect(() => {
    const t = setTimeout(() => load(1), 300)
    return () => clearTimeout(t)
  }, [load])

  async function handleConfirm() {
    if (!modal) return
    setLoading(true)
    try {
      if (modal.type === 'ban') await banUser(modal.user.id)
      if (modal.type === 'unban') await unbanUser(modal.user.id)
      if (modal.type === 'delete') await deleteUser(modal.user.id)
      if (modal.type === 'reset') await resetUserPassword(modal.user.id, newPassword)
      if (modal.type === 'vip') {
        if (vipDays === 'unlimited') {
          await updateUserVip(modal.user.id, { enableUnlimited: true })
        } else if (vipDays === 'remove') {
          await updateUserVip(modal.user.id, { removeVip: true })
        } else if (vipDate) {
          await updateUserVip(modal.user.id, { vipExpireAt: new Date(vipDate).toISOString() })
        } else {
          await updateUserVip(modal.user.id, { addDays: Number(vipDays) || 30 })
        }
      }
      setModal(null)
      setNewPassword('')
      await load(pagination.page)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Thao tác thất bại')
    } finally {
      setLoading(false)
    }
  }

  async function changeRole(user: AdminUser, newRole: AdminUser['role']) {
    try {
      await setUserRole(user.id, newRole)
      await load(pagination.page)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Đổi vai trò thất bại')
    }
  }

  return (
    <>
      <h1 className="admin-page-title">Quản lý người dùng</h1>
      {error && <p className="admin-error">{error}</p>}

      <div className="admin-toolbar">
        <input
          placeholder="Tìm username / email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Tất cả vai trò</option>
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
        <select value={vip} onChange={(e) => setVip(e.target.value)}>
          <option value="">VIP (tất cả)</option>
          <option value="true">Đang VIP</option>
          <option value="false">Không VIP</option>
          <option value="unlimited">VIP vô hạn</option>
          <option value="expired">VIP hết hạn</option>
        </select>
        <select value={banned} onChange={(e) => setBanned(e.target.value)}>
          <option value="">Trạng thái</option>
          <option value="false">Hoạt động</option>
          <option value="true">Đã khóa</option>
        </select>
      </div>

      <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>VIP</th>
              <th>Trạng thái</th>
              <th>Đăng ký</th>
              <th>Đăng nhập cuối</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0 ? (
              <tr>
                <td colSpan={8}>Đang tải...</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    <RoleBadge role={u.role} />
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u, e.target.value as AdminUser['role'])}
                      style={{ marginLeft: 6, fontSize: '0.75rem' }}
                    >
                      <option value="user">user</option>
                      <option value="moderator">moderator</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>
                    <VipBadge user={u} />
                  </td>
                  <td>{u.banned ? 'Đã khóa' : 'Hoạt động'}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>{u.lastLogin ? new Date(u.lastLogin).toLocaleString('vi-VN') : '—'}</td>
                  <td>
                    {u.banned ? (
                      <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setModal({ type: 'unban', user: u })}>
                        Mở khóa
                      </button>
                    ) : (
                      <button type="button" className="admin-btn admin-btn-danger" onClick={() => setModal({ type: 'ban', user: u })}>
                        Khóa
                      </button>
                    )}
                    <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setModal({ type: 'vip', user: u })}>
                      VIP
                    </button>
                    <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setModal({ type: 'reset', user: u })}>
                      Đặt MK
                    </button>
                    <button type="button" className="admin-btn admin-btn-danger" onClick={() => setModal({ type: 'delete', user: u })}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPage={load} />

      <ConfirmModal
        open={modal?.type === 'ban'}
        title="Khóa tài khoản"
        message={`Khóa tài khoản ${modal?.user.username}?`}
        danger
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setModal(null)}
      />
      <ConfirmModal
        open={modal?.type === 'unban'}
        title="Mở khóa"
        message={`Mở khóa ${modal?.user.username}?`}
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setModal(null)}
      />
      <ConfirmModal
        open={modal?.type === 'delete'}
        title="Xóa người dùng"
        message={`Xóa vĩnh viễn ${modal?.user.username}? Không thể hoàn tác.`}
        danger
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setModal(null)}
      />
      <ConfirmModal
        open={modal?.type === 'reset'}
        title="Đặt lại mật khẩu"
        message={
          <div>
            <p>Mật khẩu mới cho {modal?.user.username}:</p>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} />
          </div>
        }
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setModal(null)}
      />

      {modal?.type === 'vip' && (
        <div className="admin-modal-backdrop" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Quản lý VIP — {modal.user.username}</h3>
            <label className="admin-form">
              Thêm ngày
              <select value={vipDays} onChange={(e) => setVipDays(e.target.value)}>
                <option value="7">7 ngày</option>
                <option value="30">30 ngày</option>
                <option value="90">90 ngày</option>
                <option value="365">365 ngày</option>
                <option value="unlimited">Vô hạn</option>
                <option value="remove">Gỡ VIP</option>
              </select>
            </label>
            <label className="admin-form">
              Hoặc ngày hết hạn
              <input type="date" value={vipDate} onChange={(e) => setVipDate(e.target.value)} />
            </label>
            <div className="admin-modal-actions">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setModal(null)}>
                Hủy
              </button>
              <button type="button" className="admin-btn admin-btn-primary" onClick={handleConfirm} disabled={loading}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
