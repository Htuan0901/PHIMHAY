import { useEffect, useMemo, useState, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

type Ep = { name: string; slug: string; link_embed: string; link_m3u8: string }
type EpisodeServer = { server_name: string; server_data: Ep[] }

type MovieDetail = {
  id: string
  slug: string
  title: string
  canWatch: boolean
  accessReason: string
  episodes: EpisodeServer[]
}

type DetailRes = { movie: MovieDetail }

export function WatchPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const [detail, setDetail] = useState<DetailRes | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [srvIdx, setSrvIdx] = useState(0)
  const [epIdx, setEpIdx] = useState(0)
  const playerRef = useRef<HTMLDivElement>(null)
  const isInitialMount = useRef(true)

  useEffect(() => {
    if (!slug) return
    setErr(null)
    api<DetailRes>(`/api/movies/${encodeURIComponent(slug)}`)
      .then(setDetail)
      .catch((e: Error) => setErr(e.message))
  }, [slug])

  const m = detail?.movie
  const server = m?.episodes?.[srvIdx]
  const episode = server?.server_data?.[epIdx]
  const embedUrl = episode?.link_embed || ''

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
    } else {
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [epIdx, srvIdx])

  const lockMessage = useMemo(() => {
    if (!m) return null
    if (m.canWatch) return null
    if (m.accessReason === 'guest') return 'Khách chỉ xem trang chủ — đăng nhập để xem phim.'
    if (m.accessReason === 'vip_only') return 'Phim chỉ dành cho VIP. Nâng cấp để xem.'
    return 'Bạn không thể xem nội dung này.'
  }, [m])

  return (
    <div className="page watch-page">
      <h1 className="watch-title">
        <Link to={`/phim/${slug}`}>{m?.title || 'Xem phim'}</Link>
      </h1>
      {err && <p className="error-text">{err}</p>}
      {!detail && !err && <p className="muted">Đang tải…</p>}

      {lockMessage && (
        <div className="lock-box">
          <p>{lockMessage}</p>
          {!user && (
            <Link to="/login" className="btn btn-primary">
              Đăng nhập
            </Link>
          )}
          {user && m?.accessReason === 'vip_only' && (
            <Link to="/vip" className="btn btn-primary">
              Nâng VIP
            </Link>
          )}
        </div>
      )}

      {m?.canWatch && m.episodes?.length > 0 && (
        <section ref={playerRef} className="player-block">
          {embedUrl ? (
            <div className="iframe-wrap">
              <iframe title="player" src={embedUrl} allowFullScreen />
            </div>
          ) : (
            <p className="muted">Không có link phát.</p>
          )}

          <div className="button-group-label">Server</div>
          <div className="button-group">
            {m.episodes.map((s, i) => (
              <button
                key={s.server_name}
                type="button"
                className={`btn ${i === srvIdx ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => {
                  setSrvIdx(i)
                  setEpIdx(0)
                }}
              >
                {s.server_name}
              </button>
            ))}
          </div>

          <div className="button-group-label">Tập</div>
          <div className="button-group episode-list">
            {(server?.server_data || []).map((ep, i) => (
              <button
                key={ep.slug}
                type="button"
                className={`btn ${i === epIdx ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setEpIdx(i)}
              >
                {ep.name}
              </button>
            ))}
          </div>
        </section>
      )}
      <style>{`
        .watch-title a {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          display: inline-block;
        }
        .lock-box {
          background: rgba(229, 9, 20, 0.12);
          border: 1px solid rgba(229, 9, 20, 0.35);
          padding: 1rem 1.25rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1rem;
        }
        .player-block {
          margin-bottom: 2rem;
        }
        .button-group-label {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          margin-top: 1rem;
        }
        .button-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .episode-list {
          max-height: 250px;
          overflow-y: auto;
          background: rgba(0, 0, 0, 0.2);
          padding: 0.75rem;
          border-radius: 8px;
        }
        .iframe-wrap {
          margin-top: 1rem;
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          border-radius: 8px;
          border: 1px solid #333;
          background: #000;
        }
        .iframe-wrap iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }
      `}</style>
    </div>
  )
}
