import { useState, useEffect } from 'react'
import { Users, FolderGit2, DollarSign, Activity, TrendingUp, AlertCircle, Loader2, RefreshCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI } from '../../services/api'

const planLabels = {
  free: 'Free',
  builder: 'Builder',
  pro: 'Pro',
  agency: 'Agency',
  enterprise: 'Enterprise',
  starter: 'Starter (legacy)',
}

const planBarColors = {
  free: 'bg-dark-500',
  builder: 'bg-blue-500',
  pro: 'bg-purple-500',
  agency: 'bg-orange-500',
  enterprise: 'bg-green-500',
  starter: 'bg-blue-400',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const { data } = await adminAPI.getStats()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (err) {
      toast.error('Failed to load dashboard stats')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-24">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-dark-400">Failed to load stats</p>
        <button onClick={fetchStats} className="btn-primary mt-4">Retry</button>
      </div>
    )
  }

  const totalPlanUsers = Object.values(stats.plans || {}).reduce((s, c) => s + c, 0) || 1
  const successRate = stats.projects.total > 0
    ? Math.round((stats.projects.completed / stats.projects.total) * 100)
    : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-dark-400">Platform overview</p>
        </div>
        <button onClick={fetchStats} className="p-2 hover:bg-dark-700 rounded-lg" title="Refresh">
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg"><Users className="w-6 h-6 text-blue-500" /></div>
            <div>
              <p className="text-dark-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold">{stats.users.total.toLocaleString()}</p>
              <p className="text-xs text-green-400 mt-1">+{stats.users.new_today} today</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-lg"><Activity className="w-6 h-6 text-purple-500" /></div>
            <div>
              <p className="text-dark-400 text-sm">Active Users (7d)</p>
              <p className="text-2xl font-bold">{stats.users.active.toLocaleString()}</p>
              <p className="text-xs text-dark-400 mt-1">{stats.users.total > 0 ? Math.round((stats.users.active / stats.users.total) * 100) : 0}% of total</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/10 rounded-lg"><FolderGit2 className="w-6 h-6 text-orange-500" /></div>
            <div>
              <p className="text-dark-400 text-sm">Projects Generated</p>
              <p className="text-2xl font-bold">{stats.projects.total.toLocaleString()}</p>
              <p className="text-xs text-green-400 mt-1">+{stats.projects.today} today</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg"><DollarSign className="w-6 h-6 text-green-500" /></div>
            <div>
              <p className="text-dark-400 text-sm">Revenue (30d)</p>
              <p className="text-2xl font-bold">${stats.revenue.this_month.toLocaleString()}</p>
              <p className="text-xs text-dark-400 mt-1">${stats.revenue.total.toLocaleString()} lifetime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Project Health */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            <h2 className="text-xl font-bold">Project Health</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-dark-400">Success Rate</span>
              <span className="text-2xl font-bold text-green-400">{successRate}%</span>
            </div>
            <div className="w-full bg-dark-700 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${successRate}%` }}></div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{stats.projects.completed}</p>
                <p className="text-xs text-dark-400">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">{stats.projects.failed}</p>
                <p className="text-xs text-dark-400">Failed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">{stats.projects.total - stats.projects.completed - stats.projects.failed}</p>
                <p className="text-xs text-dark-400">In Progress</p>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary-500" />
            <h2 className="text-xl font-bold">Plan Distribution</h2>
          </div>
          <div className="space-y-3">
            {Object.entries(stats.plans || {}).sort((a, b) => b[1] - a[1]).map(([plan, count]) => {
              const pct = Math.round((count / totalPlanUsers) * 100)
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm capitalize">{planLabels[plan] || plan}</span>
                    <span className="text-sm text-dark-400">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <div className={`${planBarColors[plan] || 'bg-primary-500'} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              )
            })}
            {Object.keys(stats.plans || {}).length === 0 && (
              <p className="text-dark-400 text-sm">No plan data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/admin/users" className="p-4 bg-dark-800 hover:bg-dark-700 rounded-lg text-center transition-colors">
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <span className="text-sm">Manage Users</span>
          </a>
          <a href="/admin/projects" className="p-4 bg-dark-800 hover:bg-dark-700 rounded-lg text-center transition-colors">
            <FolderGit2 className="w-6 h-6 mx-auto mb-2 text-orange-400" />
            <span className="text-sm">View Projects</span>
          </a>
          <a href="/admin/payments" className="p-4 bg-dark-800 hover:bg-dark-700 rounded-lg text-center transition-colors">
            <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-400" />
            <span className="text-sm">Payments</span>
          </a>
          <a href="/admin/settings" className="p-4 bg-dark-800 hover:bg-dark-700 rounded-lg text-center transition-colors">
            <Activity className="w-6 h-6 mx-auto mb-2 text-purple-400" />
            <span className="text-sm">Settings</span>
          </a>
        </div>
      </div>
    </div>
  )
}
