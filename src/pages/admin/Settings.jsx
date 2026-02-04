import { useState, useEffect } from 'react'
import { Save, Shield, Zap, DollarSign, Mail, AlertTriangle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI } from '../../services/api'

export default function Settings() {
  const [settings, setSettings] = useState({
    // Rate Limits
    freeProjectsPerDay: 3,
    builderProjectsPerDay: 10,
    proProjectsPerDay: 50,
    agencyProjectsPerDay: 200,
    enterpriseProjectsPerDay: 999,

    // Pricing (new tiers)
    builderPrice: 149,
    proPrice: 299,
    agencyPrice: 599,
    enterprisePrice: 1299,

    // Security
    enableFingerprinting: true,
    enableHoneypots: true,
    enableRateLimiting: true,
    licenseExpiryDays: 30,

    // Email
    emailFrom: 'noreply@ziplogic.ai',
    sendWelcomeEmail: true,
    sendProjectComplete: true,

    // Maintenance
    maintenanceMode: false,
    maintenanceMessage: 'We are currently performing maintenance. Please check back soon.',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await adminAPI.getSettings()
        if (data.success && data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }))
        }
      } catch (err) {
        // If endpoint doesn't exist yet, use defaults - that's fine
        console.warn('Settings endpoint not available, using defaults')
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await adminAPI.updateSettings(settings)
      if (data.success) {
        toast.success('Settings saved!')
      } else {
        toast.error(data.message || 'Failed to save')
      }
    } catch (err) {
      // If endpoint not wired yet, still show confirmation but warn
      if (err.response?.status === 404) {
        toast.error('Settings API not deployed yet - settings not persisted')
      } else {
        toast.error('Failed to save settings')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-dark-400">Configure platform settings</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rate Limits */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-primary-500" />
            <h2 className="text-xl font-bold">Rate Limits</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-dark-400 mb-1">Free Plan - Projects/Day</label>
              <input type="number" value={settings.freeProjectsPerDay} onChange={(e) => handleChange('freeProjectsPerDay', parseInt(e.target.value) || 0)} className="input" />
            </div>
            <div>
              <label className="block text-sm text-dark-400 mb-1">Builder Plan - Projects/Day</label>
              <input type="number" value={settings.builderProjectsPerDay} onChange={(e) => handleChange('builderProjectsPerDay', parseInt(e.target.value) || 0)} className="input" />
            </div>
            <div>
              <label className="block text-sm text-dark-400 mb-1">Pro Plan - Projects/Day</label>
              <input type="number" value={settings.proProjectsPerDay} onChange={(e) => handleChange('proProjectsPerDay', parseInt(e.target.value) || 0)} className="input" />
            </div>
            <div>
              <label className="block text-sm text-dark-400 mb-1">Agency Plan - Projects/Day</label>
              <input type="number" value={settings.agencyProjectsPerDay} onChange={(e) => handleChange('agencyProjectsPerDay', parseInt(e.target.value) || 0)} className="input" />
            </div>
            <div>
              <label className="block text-sm text-dark-400 mb-1">Enterprise Plan - Projects/Day</label>
              <input type="number" value={settings.enterpriseProjectsPerDay} onChange={(e) => handleChange('enterpriseProjectsPerDay', parseInt(e.target.value) || 0)} className="input" />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-bold">Pricing</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-dark-400 mb-1">Builder Plan Price ($/mo)</label>
              <input type="number" value={settings.builderPrice} onChange={(e) => handleChange('builderPrice', parseInt(e.target.value) || 0)} className="input" />
            </div>
            <div>
              <label className="block text-sm text-dark-400 mb-1">Pro Plan Price ($/mo)</label>
              <input type="number" value={settings.proPrice} onChange={(e) => handleChange('proPrice', parseInt(e.target.value) || 0)} className="input" />
            </div>
            <div>
              <label className="block text-sm text-dark-400 mb-1">Agency Plan Price ($/mo)</label>
              <input type="number" value={settings.agencyPrice} onChange={(e) => handleChange('agencyPrice', parseInt(e.target.value) || 0)} className="input" />
            </div>
            <div>
              <label className="block text-sm text-dark-400 mb-1">Enterprise Plan Price ($/mo)</label>
              <input type="number" value={settings.enterprisePrice} onChange={(e) => handleChange('enterprisePrice', parseInt(e.target.value) || 0)} className="input" />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold">Security</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={settings.enableFingerprinting} onChange={(e) => handleChange('enableFingerprinting', e.target.checked)} className="w-5 h-5 rounded" />
              <span>Enable Code Fingerprinting</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={settings.enableHoneypots} onChange={(e) => handleChange('enableHoneypots', e.target.checked)} className="w-5 h-5 rounded" />
              <span>Enable Honeypot Traps</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={settings.enableRateLimiting} onChange={(e) => handleChange('enableRateLimiting', e.target.checked)} className="w-5 h-5 rounded" />
              <span>Enable Rate Limiting</span>
            </label>
            <div>
              <label className="block text-sm text-dark-400 mb-1">License Expiry (Days)</label>
              <input type="number" value={settings.licenseExpiryDays} onChange={(e) => handleChange('licenseExpiryDays', parseInt(e.target.value) || 0)} className="input" />
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold">Email</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-dark-400 mb-1">From Email</label>
              <input type="email" value={settings.emailFrom} onChange={(e) => handleChange('emailFrom', e.target.value)} className="input" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={settings.sendWelcomeEmail} onChange={(e) => handleChange('sendWelcomeEmail', e.target.checked)} className="w-5 h-5 rounded" />
              <span>Send Welcome Email</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={settings.sendProjectComplete} onChange={(e) => handleChange('sendProjectComplete', e.target.checked)} className="w-5 h-5 rounded" />
              <span>Send Project Complete Email</span>
            </label>
          </div>
        </div>

        {/* Maintenance */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold">Maintenance Mode</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => handleChange('maintenanceMode', e.target.checked)} className="w-5 h-5 rounded" />
              <span className="text-red-400">Enable Maintenance Mode (blocks all user access)</span>
            </label>
            {settings.maintenanceMode && (
              <div>
                <label className="block text-sm text-dark-400 mb-1">Maintenance Message</label>
                <textarea value={settings.maintenanceMessage} onChange={(e) => handleChange('maintenanceMessage', e.target.value)} className="input h-24" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
