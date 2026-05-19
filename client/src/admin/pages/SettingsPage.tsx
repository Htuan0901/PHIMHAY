import { useEffect, useState, type FormEvent } from 'react'
import { fetchAdminSettings, updateAdminSettings, type SystemSettings } from '../api'

export function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [bannerUrl, setBannerUrl] = useState('')

  useEffect(() => {
    fetchAdminSettings()
      .then((r) => setSettings(r.settings))
      .catch((e) => setError(e instanceof Error ? e.message : 'Lỗi tải cài đặt'))
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!settings) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const { settings: updated } = await updateAdminSettings(settings)
      setSettings(updated)
      setSuccess('Đã lưu cài đặt')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại')
    } finally {
      setSaving(false)
    }
  }

  function handleLogoFile(file: File | null) {
    if (!file || !settings) return
    const reader = new FileReader()
    reader.onload = () => {
      setSettings({ ...settings, logo: String(reader.result) })
    }
    reader.readAsDataURL(file)
  }

  function addBanner() {
    if (!settings || !bannerUrl.trim()) return
    setSettings({ ...settings, bannerImages: [...settings.bannerImages, bannerUrl.trim()] })
    setBannerUrl('')
  }

  if (!settings) return <p>Đang tải cài đặt...</p>

  return (
    <>
      <h1 className="admin-page-title">Cài đặt hệ thống</h1>
      {error && <p className="admin-error">{error}</p>}
      {success && <p className="admin-success">{success}</p>}

      <form className="admin-form admin-card" onSubmit={onSubmit}>
        <label>
          Tên website
          <input
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
          />
        </label>

        <label>
          Logo (upload hoặc URL)
          <input type="file" accept="image/*" onChange={(e) => handleLogoFile(e.target.files?.[0] ?? null)} />
          <input
            value={settings.logo.startsWith('data:') ? '' : settings.logo}
            placeholder="https://..."
            onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
          />
        </label>
        {settings.logo && (
          <img src={settings.logo} alt="Logo preview" style={{ maxHeight: 48, marginTop: 8 }} />
        )}

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
          <input
            type="checkbox"
            checked={settings.maintenanceMode}
            onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
          />
          Chế độ bảo trì
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={settings.registrationEnabled}
            onChange={(e) => setSettings({ ...settings, registrationEnabled: e.target.checked })}
          />
          Cho phép đăng ký
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={settings.commentsEnabled}
            onChange={(e) => setSettings({ ...settings, commentsEnabled: e.target.checked })}
          />
          Bật bình luận
        </label>

        <h3 style={{ marginTop: '1.5rem' }}>Banner trang chủ</h3>
        <div className="admin-toolbar">
          <input
            placeholder="URL ảnh banner"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
          />
          <button type="button" className="admin-btn admin-btn-ghost" onClick={addBanner}>
            Thêm banner
          </button>
        </div>
        <ul>
          {settings.bannerImages.map((url, i) => (
            <li key={url + i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <img src={url} alt="" style={{ height: 40, borderRadius: 4 }} />
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={() =>
                  setSettings({
                    ...settings,
                    bannerImages: settings.bannerImages.filter((_, idx) => idx !== i),
                  })
                }
              >
                Xóa
              </button>
            </li>
          ))}
        </ul>

        <h3 style={{ marginTop: '1.5rem' }}>Email (SMTP)</h3>
        <label>
          Host
          <input
            value={settings.emailConfig.host}
            onChange={(e) =>
              setSettings({
                ...settings,
                emailConfig: { ...settings.emailConfig, host: e.target.value },
              })
            }
          />
        </label>
        <label>
          Port
          <input
            type="number"
            value={settings.emailConfig.port}
            onChange={(e) =>
              setSettings({
                ...settings,
                emailConfig: { ...settings.emailConfig, port: Number(e.target.value) },
              })
            }
          />
        </label>
        <label>
          User
          <input
            value={settings.emailConfig.user}
            onChange={(e) =>
              setSettings({
                ...settings,
                emailConfig: { ...settings.emailConfig, user: e.target.value },
              })
            }
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={settings.emailConfig.password}
            onChange={(e) =>
              setSettings({
                ...settings,
                emailConfig: { ...settings.emailConfig, password: e.target.value },
              })
            }
          />
        </label>

        <h3 style={{ marginTop: '1.5rem' }}>API keys</h3>
        <label>
          PhimAPI
          <input
            value={settings.thirdPartyAPIKeys.phimapi}
            onChange={(e) =>
              setSettings({
                ...settings,
                thirdPartyAPIKeys: { ...settings.thirdPartyAPIKeys, phimapi: e.target.value },
              })
            }
          />
        </label>
        <label>
          VNPay
          <input
            value={settings.thirdPartyAPIKeys.vnpay}
            onChange={(e) =>
              setSettings({
                ...settings,
                thirdPartyAPIKeys: { ...settings.thirdPartyAPIKeys, vnpay: e.target.value },
              })
            }
          />
        </label>

        <div style={{ marginTop: '1.25rem' }}>
          <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </div>
      </form>
    </>
  )
}
