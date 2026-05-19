import { useCallback, useEffect, useState } from 'react'
import { fetchActivityLogs, type ActivityLogItem } from '../api'
import { Pagination } from '../components/Pagination'

export function ActivityLogsPage() {
  const [items, setItems] = useState<ActivityLogItem[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 30, total: 0, pages: 1 })
  const [action, setAction] = useState('')
  const [targetType, setTargetType] = useState('')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(
    async (page = 1) => {
      try {
        const data = await fetchActivityLogs({ page, limit: 30, action, targetType, search })
        setItems(data.items)
        setPagination(data.pagination)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Lỗi tải nhật ký')
      }
    },
    [action, targetType, search]
  )

  useEffect(() => {
    const t = setTimeout(() => load(1), 300)
    return () => clearTimeout(t)
  }, [load])

  return (
    <>
      <h1 className="admin-page-title">Nhật ký hoạt động</h1>
      {error && <p className="admin-error">{error}</p>}

      <div className="admin-toolbar">
        <input placeholder="Tìm action / IP / target..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <input placeholder="Action (vd: user.login)" value={action} onChange={(e) => setAction(e.target.value)} />
        <select value={targetType} onChange={(e) => setTargetType(e.target.value)}>
          <option value="">Loại đích</option>
          <option value="user">user</option>
          <option value="movie">movie</option>
          <option value="settings">settings</option>
        </select>
      </div>

      <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Người thực hiện</th>
              <th>Vai trò</th>
              <th>Hành động</th>
              <th>Đích</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {items.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                <td>
                  {log.actorName || '—'}
                  {log.actorEmail && (
                    <div style={{ fontSize: '0.75rem', color: '#9aa3b5' }}>{log.actorEmail}</div>
                  )}
                </td>
                <td>{log.actorRole}</td>
                <td>
                  <code>{log.action}</code>
                </td>
                <td>
                  {log.targetType && (
                    <span>
                      {log.targetType}:{log.targetId}
                    </span>
                  )}
                </td>
                <td>{log.ipAddress || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={pagination.page}
        pages={pagination.pages}
        total={pagination.total}
        onPage={load}
      />
    </>
  )
}
