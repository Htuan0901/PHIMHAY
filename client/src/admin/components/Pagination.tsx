type PaginationProps = {
  page: number
  pages: number
  total: number
  onPage: (page: number) => void
}

export function Pagination({ page, pages, total, onPage }: PaginationProps) {
  if (pages <= 1) return null
  return (
    <div className="admin-toolbar" style={{ justifyContent: 'space-between' }}>
      <span style={{ color: '#9aa3b5', fontSize: '0.85rem' }}>Tổng {total} bản ghi</span>
      <div>
        <button
          type="button"
          className="admin-btn admin-btn-ghost"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          Trước
        </button>
        <span style={{ margin: '0 0.5rem' }}>
          {page} / {pages}
        </span>
        <button
          type="button"
          className="admin-btn admin-btn-ghost"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
        >
          Sau
        </button>
      </div>
    </div>
  )
}
