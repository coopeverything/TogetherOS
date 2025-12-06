'use client'

// apps/web/app/admin/settings/page.tsx
// Admin Settings Panel - View and edit RP/SP configuration

import { useState, useEffect } from 'react'
import type {
  SystemSetting,
  SettingsByCategory,
  SystemSettingAuditEntry,
  CATEGORY_METADATA,
} from '@togetheros/types'

export default function AdminSettingsPage() {
  const [settingsByCategory, setSettingsByCategory] = useState<SettingsByCategory[]>([])
  const [auditLog, setAuditLog] = useState<SystemSettingAuditEntry[]>([])
  const [activeTab, setActiveTab] = useState<'settings' | 'audit'>('settings')
  const [loading, setLoading] = useState(true)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [editReason, setEditReason] = useState('')

  useEffect(() => {
    loadSettings()
    loadAudit()
  }, [])

  async function loadSettings() {
    try {
      const res = await fetch('/api/admin/settings?grouped=true')
      const data = await res.json()
      if (data.success) {
        setSettingsByCategory(data.data)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadAudit() {
    try {
      const res = await fetch('/api/admin/settings/audit?limit=20')
      const data = await res.json()
      if (data.success) {
        setAuditLog(data.data)
      }
    } catch (error) {
      console.error('Failed to load audit log:', error)
    }
  }

  async function handleUpdate(key: string) {
    if (!editReason.trim()) {
      alert('Please provide a reason for this change')
      return
    }

    if (editReason.trim().length < 10) {
      alert('Reason must be at least 10 characters long')
      return
    }

    try {
      const res = await fetch(`/api/admin/settings/${key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          value: parseValue(editValue),
          reason: editReason,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setEditingKey(null)
        setEditValue('')
        setEditReason('')
        loadSettings()
        loadAudit()
        alert('Setting updated successfully!')
      } else {
        // Show detailed validation errors if available
        if (data.details && Array.isArray(data.details)) {
          const errorMessages = data.details.map((err: any) =>
            `${err.path.join('.')}: ${err.message}`
          ).join('\n')
          alert(`Validation failed:\n${errorMessages}`)
        } else {
          alert(`Failed to update: ${data.error}`)
        }
      }
    } catch (error) {
      console.error('Failed to update setting:', error)
      alert('Failed to update setting')
    }
  }

  async function handleDelete(key: string, description: string) {
    const reason = prompt(
      `Deleting: ${description}\n\nPlease provide a reason for deleting this setting (min 10 characters):`
    )

    if (!reason) return // User cancelled

    if (reason.trim().length < 10) {
      alert('Reason must be at least 10 characters long')
      return
    }

    if (!confirm(`Are you sure you want to delete "${key}"? This action will be logged in the audit trail.`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/settings/${key}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })

      const data = await res.json()
      if (data.success) {
        loadSettings()
        loadAudit()
        alert('Setting deleted successfully!')
      } else {
        alert(`Failed to delete: ${data.error}`)
      }
    } catch (error) {
      console.error('Failed to delete setting:', error)
      alert('Failed to delete setting')
    }
  }

  function parseValue(str: string): number | boolean | string {
    if (str === 'true') return true
    if (str === 'false') return false
    const num = Number(str)
    if (!isNaN(num)) return num
    return str
  }

  function startEdit(setting: SystemSetting) {
    setEditingKey(setting.key)
    setEditValue(String(setting.value))
    setEditReason('')
  }

  function cancelEdit() {
    setEditingKey(null)
    setEditValue('')
    setEditReason('')
  }

  const categoryLabels: Record<string, string> = {
    sp_weights: 'Support Points Weights',
    rp_earnings: 'Reputation Points Earnings',
    conversion_rates: 'Conversion Rates',
    tbc_settings: 'Timebank Credits (TBC)',
    sh_settings: 'Social Horizon (SH)',
    constraints: 'System Constraints',
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">System Settings</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">System Settings</h1>

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-4 px-1 border-b-2 font-medium ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-ink-400 hover:text-ink-700'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-4 px-1 border-b-2 font-medium ${
              activeTab === 'audit'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-ink-400 hover:text-ink-700'
            }`}
          >
            Audit Log
          </button>
        </nav>
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-8">
          {settingsByCategory.map((category) => (
            <div key={category.category} className="bg-bg-0 rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4">
                {categoryLabels[category.category] || category.category}
              </h2>

              <table className="min-w-full divide-y divide-border">
                <thead className="bg-bg-2">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-ink-400 uppercase tracking-wider">
                      Setting
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-ink-400 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-ink-400 uppercase tracking-wider">
                      Range
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-ink-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-bg-0 divide-y divide-border">
                  {category.settings.map((setting) => (
                    <tr key={setting.key}>
                      <td className="px-6 py-4">
                        <div className="text-base font-medium text-ink-900">
                          {setting.key.split('.')[1]}
                        </div>
                        <div className="text-sm text-ink-400">{setting.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        {editingKey === setting.key ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="border border-border rounded px-3 py-1.5 w-24"
                          />
                        ) : (
                          <span className="text-base font-semibold">{String(setting.value)}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-base text-ink-400">
                        {setting.minValue !== null && setting.maxValue !== null
                          ? `${setting.minValue} - ${setting.maxValue}`
                          : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {editingKey === setting.key ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Reason for change (min 10 chars)"
                              value={editReason}
                              onChange={(e) => setEditReason(e.target.value)}
                              className="border border-border rounded px-3 py-1.5 w-full text-base"
                              minLength={10}
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleUpdate(setting.key)}
                                className="bg-blue-600 text-white px-3 py-1.5 rounded text-base hover:bg-blue-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="bg-bg-2 text-ink-700 px-3 py-1.5 rounded text-base hover:bg-bg-1"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEdit(setting)}
                              className="text-blue-600 hover:text-blue-800 text-base font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(setting.key, setting.description)}
                              className="text-red-600 hover:text-red-800 text-base font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="bg-bg-0 rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Recent Changes</h2>
            <div className="space-y-4">
              {auditLog.map((entry) => (
                <div key={entry.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-ink-900">{entry.settingKey}</p>
                      <p className="text-base text-ink-400">
                        {entry.oldValue !== null ? (
                          <>
                            Changed from <span className="font-mono">{String(entry.oldValue)}</span>{' '}
                            to <span className="font-mono">{String(entry.newValue)}</span>
                          </>
                        ) : (
                          <>
                            Set to <span className="font-mono">{String(entry.newValue)}</span>
                          </>
                        )}
                      </p>
                      {entry.reason && (
                        <p className="text-base text-ink-400 mt-1">Reason: {entry.reason}</p>
                      )}
                    </div>
                    <div className="text-right text-base text-ink-400">
                      <p>{new Date(entry.changedAt).toLocaleString()}</p>
                      <p>by {entry.changedBy}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
