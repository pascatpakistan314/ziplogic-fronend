import { useState, useEffect, useCallback } from 'react'
import { Search, RefreshCcw, DollarSign, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI } from '../../services/api'

const statusColors = {
  completed: 'bg-green-500/20 text-green-400',
  refunded: 'bg-yellow-500/20 text-yellow-400',
  failed: 'bg-red-500/20 text-red-400',
}

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState({ totalRevenue: 0, refunded: 0, net: 0 })
  const perPage = 20

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: perPage }
      if (search) params.search = search
      const { data } = await adminAPI.getPayments(params)
      if (data.success) {
        setPayments(data.payments)
        setTotal(data.total)
        // Calculate stats from all payments (or use server stats if available)
        if (data.stats) {
          setStats(data.stats)
        } else {
          // Client-side calc from current page - for full accuracy, backend should provide
          const completed = data.payments.filter(p => p.status === 'completed')
          const refundedPayments = data.payments.filter(p => p.status === 'refunded')
          const rev = completed.reduce((s, p) => s + p.amount, 0)
          const ref = refundedPayments.reduce((s, p) => s + p.amount, 0)
          setStats({ totalRevenue: rev, refunded: ref, net: rev - ref })
        }
      }
    } catch (err) {
      toast.error('Failed to load payments')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleRefund = async (payment) => {
    if (payment.status !== 'completed') return
    if (!window.confirm(`Refund $${payment.amount} to ${payment.user}?`)) return
    try {
      const { data } = await adminAPI.refundPayment(payment.id)
      if (data.success) {
        toast.success('Payment refunded')
        fetchPayments()
      } else {
        toast.error(data.message || 'Refund failed')
      }
    } catch (err) {
      toast.error('Failed to process refund')
    }
  }

  const totalPages = Math.ceil(total / perPage)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-dark-400">Transaction history and revenue</p>
        </div>
        <button onClick={fetchPayments} className="p-2 hover:bg-dark-700 rounded-lg" title="Refresh">
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg"><DollarSign className="w-6 h-6 text-green-500" /></div>
            <div>
              <p className="text-dark-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/10 rounded-lg"><RefreshCcw className="w-6 h-6 text-yellow-500" /></div>
            <div>
              <p className="text-dark-400 text-sm">Refunded</p>
              <p className="text-2xl font-bold">${stats.refunded.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-500/10 rounded-lg"><DollarSign className="w-6 h-6 text-primary-500" /></div>
            <div>
              <p className="text-dark-400 text-sm">Net Revenue</p>
              <p className="text-2xl font-bold">${stats.net.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input type="text" placeholder="Search by email..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 text-dark-400">No payments found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-dark-800">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">User</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">Plan</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">Amount</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">Date</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-dark-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-dark-800/50">
                  <td className="px-6 py-4">{payment.user}</td>
                  <td className="px-6 py-4 capitalize">{payment.plan}</td>
                  <td className="px-6 py-4 font-medium">${payment.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[payment.status] || 'bg-dark-700 text-dark-300'}`}>{payment.status}</span>
                  </td>
                  <td className="px-6 py-4 text-dark-400">{new Date(payment.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    {payment.status === 'completed' && (
                      <button onClick={() => handleRefund(payment)} className="text-sm text-yellow-400 hover:text-yellow-300">Refund</button>
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
