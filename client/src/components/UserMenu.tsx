import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

function isAdminUser(user: { isAdmin?: boolean; role?: string } | null) {
  return !!user && (user.isAdmin === true || user.role === 'admin')
}

const adminLinks = [
  { to: '/admin/content', label: 'Thêm & quản lý phim' },
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/users', label: 'Quản lý người dùng' },
  { to: '/admin/logs', label: 'Nhật ký hoạt động' },
  { to: '/admin/settings', label: 'Cài đặt hệ thống' },
]

export function UserMenu() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const nav = useNavigate()
  const admin = isAdminUser(user)

  const handleLogout = () => {
    logout()
    nav('/')
    setIsOpen(false)
  }

  const close = () => setIsOpen(false)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (!user) return null

  return (
    <div className="user-menu" ref={menuRef}>
      <button type="button" className="user-menu__button" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen}>
        <svg
          className="user-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="white"
          width="24px"
          height="24px"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </button>
      {user.isVip && <span className="badge-vip badge-vip--outside">VIP</span>}

      {isOpen && (
        <div className="user-menu__dropdown">
          <ul>
            <li className="user-menu__user-info">
              {admin ? (
                <Link to="/admin/content" className="user-menu__admin-name" onClick={close}>
                  {user.displayName || user.email}
                  <span className="user-menu__admin-hint">Bảng quản trị →</span>
                </Link>
              ) : (
                <span>{user.displayName || user.email}</span>
              )}
            </li>

            {admin && (
              <>
                <li className="user-menu__section-label">Quản trị</li>
                {adminLinks.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} onClick={close}>
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li className="user-menu__separator" />
              </>
            )}

            <li>
              <Link to="/profile" onClick={close}>
                Tài khoản & Cài đặt
              </Link>
            </li>
            <li>
              <Link to="/watch-history" onClick={close}>
                Lịch sử xem
              </Link>
            </li>
            <li className="user-menu__separator" />
            <li>
              <button type="button" onClick={handleLogout}>
                Đăng xuất
              </button>
            </li>
          </ul>
        </div>
      )}

      <style>{`
        .user-menu__dropdown {
          width: ${admin ? '240px' : '200px'};
        }
        .user-menu__admin-name {
          display: block;
          color: #93c5fd !important;
          text-decoration: none;
          padding: 0;
        }
        .user-menu__admin-name:hover {
          color: #fff !important;
        }
        .user-menu__admin-hint {
          display: block;
          font-size: 0.75rem;
          font-weight: normal;
          color: #9aa3b5;
          margin-top: 0.2rem;
        }
        .user-menu__section-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #9aa3b5;
          padding: 0.35rem 1rem 0.15rem !important;
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}
