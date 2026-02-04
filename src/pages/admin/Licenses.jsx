import { useState, useEffect, useCallback } from 'react'
import { Search, Key, Ban, CheckCircle, AlertTriangle, Copy, ChevronLeft, ChevronRight, Loader2, RefreshCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI } from '../../services/api'

const statusColors = {
  active: 'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  revoked: 'bg-red-500/20 text-red-400',
  expired: 'bg-dark-700 text-dark-400',
}

export default function Licenses() {
  const [licenses, setLicenses] = useState([])
  const [search, setSearch] = useState('')
  const [verifyKey, setVerifyKey] = useState('')
  const [verifyResult, setVerifyResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [counts, setCounts] = useState({ active: 0, pending: 0, revoked: 0 })
  const perPage = 20

  const fetchLicenses = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: perPage }
      if (search) params.search = search
      const { data } = await adminAPI.getLicenses(params)
      if (data.success) {
        setLicenses(data.licenses)
        setTotal(data.total)
        if (data.counts) setCounts(data.counts)
      }
    } catch (err) {
      toast.error('Failed to load licenses')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchLicenses() }, [fetchLicenses])

  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleRevoke = async (license) => {
    if (license.status !== 'active') return
    if (!window.confirm(`Revoke license ${license.key}?`)) return
    try {
      const { data } = await adminAPI.revokeLicense(license.id)
      if (data.success) {
        toast.success('License revoked')
        fetchLicenses()
      } else {
        toast.error(data.message || 'Failed to revoke')
      }
    } catch (err) {
      toast.error('Failed to revoke license')
    }
  }

  const handleVerify = async () => {
    if (!verifyKey.trim()) return
    try {
      const { data } = await adminAPI.verifyLicense(verifyKey.trim())
      if (data.success) {
        setVerifyResult({ valid: data.valid, message: data.message, status: data.status })
        if (data.valid) {
          toast.success(`License valid! Status: ${data.status}`)
        } else {
          toast.error(data.message || 'License invalid')
        }
      }
    } catch (err) {
      toast.error('Verification failed')
      setVerifyResult({ valid: false, message: 'Verification failed' })
    }
  }

  const copyKey = (key) => {
    navigator.clipboard.writeText(key)
    toast.success('Copied!')
  }

  const totalPages = Math.ceil(total / perPage)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Licenses</h1>
          <p className="text-dark-400">Manage project licenses</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-green-400">{counts.active} active</span>
          <span className="text-yellow-400">{counts.pending} pending</span>
          <span className="text-red-400">{counts.revoked} revoked</span>
          <button onClick={fetchLicenses} className="p-2 hover:bg-dark-700 rounded-lg" title="Refresh">
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Verify License */}
      <div className="card p-6 mb-6">
        <h3 className="font-medium mb-3">Verify License</h3>
        <div className="flex gap-3">
          <input type="text" placeholder="Enter license key (ZLP-XXXX-XXXX-XXXX-XXXX)" value={verifyKey} onChange={(e) => setVerifyKey(e.target.value)} className="input flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()} />
          <button onClick={handleVerify} className="btn-primary">Verify</button>
        </div>
        {verifyResult && (
          <div className={`mt-3 p-3 rounded-lg text-sm ${verifyResult.valid ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {verifyResult.valid ? <CheckCircle className="w-4 h-4 inline mr-2" /> : <AlertTriangle className="w-4 h-4 inline mr-2" />}
            {verifyResult.message}
          </div>
        )}
      </div>

      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input type="text" placeholder="Search licenses..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : licenses.length === 0 ? (
          <div className="text-center py-12 text-dark-400">No licenses found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-dark-800">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">License Key</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">User</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">Project</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">Domain</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-dark-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {licenses.map((license) => (
                <tr key={license.id} className="hover:bg-dark-800/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-dark-800 px-2 py-1 rounded">{license.key}</code>
                      <button onClick={() => copyKey(license.key)} className="p-1 hover:bg-dark-700 rounded"><Copy className="w-4 h-4" /></button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-dark-400">{license.user}</td>
                  <td className="px-6 py-4">{license.project}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[license.status] || 'bg-dark-700 text-dark-300'}`}>{license.status}</span>
                  </td>
                  <td className="px-6 py-4 text-dark-400">{license.domain || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    {license.status === 'active' && (
                      <button onClick={() => handleRevoke(license)} className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 ml-auto">
                        <Ban className="w-4 h-4" /> Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-dark-800/50">
            <span className="text-sm text-dark-400">Page {page} of {totalPages} ({total} total)</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 hover:bg-dark-700 rounded-lg disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 hover:bg-dark-700 rounded-lg disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
