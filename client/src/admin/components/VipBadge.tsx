import type { AdminUser } from '../api'

export function VipBadge({ user }: { user: Pick<AdminUser, 'isVIP' | 'vipActive' | 'isUnlimitedVIP' | 'vipExpireAt'> }) {
  if (!user.isVIP) {
    return <span className="vip-badge vip-badge--none">Thường</span>
  }
  if (user.isUnlimitedVIP) {
    return <span className="vip-badge vip-badge--unlimited">VIP ∞</span>
  }
  if (user.vipActive) {
    const exp = user.vipExpireAt
      ? new Date(user.vipExpireAt).toLocaleDateString('vi-VN')
      : ''
    return (
      <span className="vip-badge vip-badge--active" title={exp ? `Hết hạn: ${exp}` : undefined}>
        VIP{exp ? ` · ${exp}` : ''}
      </span>
    )
  }
  return <span className="vip-badge vip-badge--none">VIP hết hạn</span>
}

export function RoleBadge({ role }: { role: string }) {
  return <span className={`role-badge role-badge--${role}`}>{role}</span>
}
