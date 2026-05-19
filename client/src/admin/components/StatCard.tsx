type StatCardProps = {
  label: string
  value: string | number
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="admin-stat-card">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  )
}
