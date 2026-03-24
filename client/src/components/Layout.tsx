import { Link, Outlet, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import { FilterDropdowns } from './FilterDropdowns'

function SearchForm() {
  const nav = useNavigate()
  const [searchParams] = useSearchParams()
  const [q, setQ] = useState(searchParams.get('q') || '')

  useEffect(() => {
    setQ(searchParams.get('q') || '')
  }, [searchParams])

  function onSearch(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = q.trim()
    if (trimmed) {
      nav(`/?q=${encodeURIComponent(trimmed)}`)
    } else {
      nav('/')
    }
  }

  return (
    <form onSubmit={onSearch} className="search-form">
      <input
        type="search"
        placeholder="Tìm kiếm phim..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
    </form>
  )
}

export function Layout() {
  const { user, logout } = useAuth()
  const nav = useNavigate()

  return (
    <>
      <header className="top-nav">
        <div className="top-nav__inner">
          <Link to="/" className="logo">
            PHIM<span>HAY</span>
          </Link>
          <SearchForm />
          <FilterDropdowns />
          <nav className="top-nav__links">
            <Link to="/">Trang chủ</Link>
            {user?.isAdmin && <Link to="/admin">Admin</Link>}
            {user && !user.isAdmin && !user.isVip && (
              <Link to="/vip" className="vip-link">
                Nâng VIP
              </Link>
            )}
            {!user && (
              <>
                <Link to="/login">Đăng nhập</Link>
                <Link to="/register" className="btn btn-primary btn--sm">
                  Đăng ký
                </Link>
              </>
            )}
            {user && (
              <>
                <span className="muted user-email">{user.displayName || user.email}</span>
                {user.isVip && (
                  <span className="badge-vip">
                    VIP
                    {user.vipExpiresAt &&
                      ` (Hết hạn: ${new Date(
                        user.vipExpiresAt
                      ).toLocaleDateString()})`}
                  </span>
                )}
                <button
                  type="button"
                  className="btn btn-ghost btn--sm"
                  onClick={() => {
                    logout()
                    nav('/')
                  }}
                >
                  Thoát
                </button>
              </>
            )}
          </nav>
        </div>
      </header>
      <Outlet />
      <style>{`
        .top-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          background: linear-gradient(180deg, rgba(0,0,0,0.92) 0%, transparent 100%);
          padding: 0.75rem 1.25rem;
        }
        .top-nav__inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .logo {
          font-weight: 800;
          font-size: 1.35rem;
          letter-spacing: -0.02em;
          color: var(--nf-red);
        }
        .logo span {
          color: #fff;
        }
        .search-form {
          flex-grow: 1;
          max-width: 400px;
        }
        .search-form input {
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid #444;
          border-radius: 20px;
          padding: 0.5rem 1rem;
          color: #fff;
          font-size: 0.9rem;
        }
        .search-form input::placeholder {
          color: #aaa;
        }
        .top-nav__links {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          font-size: 0.9rem;
        }
        .top-nav__links a:hover {
          color: #fff;
        }
        .vip-link {
          color: #f5c518;
        }
        .btn--sm {
          padding: 0.4rem 0.85rem;
          font-size: 0.85rem;
        }
        .user-email {
          max-width: 160px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .badge-vip {
          background: linear-gradient(90deg, #f5c518, #e6a800);
          color: #111;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.2rem 0.45rem;
          border-radius: 4px;
        }
      `}</style>
    </>
  )
}
