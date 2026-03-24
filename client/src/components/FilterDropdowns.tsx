
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'

type Filters = {
  types: string[]
  countries: string[]
}

export function FilterDropdowns() {
  const [filters, setFilters] = useState<Filters | null>(null)
  const [searchParams] = useSearchParams()
  const nav = useNavigate()
  const type = searchParams.get('type')
  const country = searchParams.get('country')

  useEffect(() => {
    api<Filters>('/api/movies/filters')
      .then(setFilters)
      .catch(() => {
        /* ignore */
      })
  }, [])

  function translateType(type: string) {
    switch (type) {
      case 'hoathinh':
        return 'Hoạt hình'
      case 'series':
        return 'Phim bộ'
      case 'movies':
        return 'Phim lẻ'
      case 'phim hoạt hình từ Nhật Bản':
        return 'Anime'
      default:
        return type
    }
  }

  function handleFilterChange(filterType: 'type' | 'country', value: string) {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(filterType, value)
    } else {
      newParams.delete(filterType)
    }
    newParams.set('page', '1')
    // By navigating to `/` we ensure that we are on the home page when a filter is selected.
    nav(`/?${newParams.toString()}`)
  }
  if (!filters) {
    return null
  }

  return (
    <>
      <div className="filter-dropdown">
        <button className="filter-dropdown__button">
          {type ? translateType(type) : 'Thể loại'}
        </button>
        <div className="filter-dropdown__menu">
          <a onClick={() => handleFilterChange('type', '')}>Tất cả</a>
          {filters.types.map((t) => (
            <a key={t} onClick={() => handleFilterChange('type', t)}>
              {translateType(t)}
            </a>
          ))}
        </div>
      </div>
      <div className="filter-dropdown">
        <button className="filter-dropdown__button">
          {country || 'Quốc gia'}
        </button>
        <div className="filter-dropdown__menu filter-dropdown__menu--country">
          <a onClick={() => handleFilterChange('country', '')}>Tất cả</a>
          {filters.countries.map((c) => (
            <a key={c} onClick={() => handleFilterChange('country', c)}>
              {c}
            </a>
          ))}
        </div>
      </div>
      <style>{`
        .filter-dropdown {
          position: relative;
        }
        .filter-dropdown__button {
            background: transparent;
            color: #fff;
            border: 1px solid #444;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.9rem;
        }
        .filter-dropdown:hover .filter-dropdown__menu {
          display: block;
        }
        .filter-dropdown__menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          background: #111;
          border: 1px solid #444;
          border-radius: 4px;
          padding: 0.5rem;
          max-height: 300px;
          overflow-y: auto;
          z-index: 10;
        }
        .filter-dropdown__menu a {
          display: block;
          padding: 0.5rem 1rem;
          color: #fff;
          text-decoration: none;
          cursor: pointer;
          white-space: nowrap;
        }
        .filter-dropdown__menu a:hover {
          background: #333;
        }
        .filter-dropdown__menu--country a {
          font-size: 0.8rem;
        }
        .filter-dropdown__menu--country {
          overflow-y: hidden;
        }
      `}</style>
    </>
  )
}
