import { useState, useEffect, useCallback } from 'react'
import { Search, UserCheck, UserX, Edit3, Trash2, ChevronLeft, ChevronRight, Loader2, RefreshCcw, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI } from '../../services/api'

const planColors = {
  free: 'bg-dark-700 text-dark-300',
  builder: 'bg-blue-500/20 text-blue-400',
  pro: 'bg-purple-500/20 text-purple-400',
  agency: 'bg-orange-500/20 text-orange-400',
  enterprise: 'bg-green-500/20 text-green-400',
  // Legacy support
  starter: 'bg-blue-500/20 text-blue-400',
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [planFilter, setPlanFilter] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [editPlan, setEditPlan] = useState('')
  const [editActive, setEditActive] = useState(true)
  const perPage = 20

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: perPage }
      if (search) params.search = search
      if (planFilter) params.plan = planFilter
      const { data } = await adminAPI.getUsers(params)
      if (data.success) {
        setUsers(data.users)
        setTotal(data.total)
      }
    } catch (err) {
      toast.error('Failed to load users')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search, planFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user ${user.email}? This cannot be undone.`)) return
    try {
      const { data } = await adminAPI.deleteUser(user.id)
      if (data.success) {
        toast.success('User deleted')
        fetchUsers()
      } else {
        toast.error(data.message || 'Failed to delete')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user')
    }
  }

  const openEdit = (user) => {
    setEditingUser(user)
    setEditPlan(user.plan)
    setEditActive(user.is_active)
  }

  const handleUpdate = async () => {
    if (!editingUser) return
    try {
      const { data } = await adminAPI.updateUser(editingUser.id, {
        plan: editPlan,
        is_active: editActive,
      })
      if (data.success) {
        toast.success('User updated')
        setEditingUser(null)
        fetchUsers()
      } else {
        toast.error(data.message || 'Update failed')
      }
    } catch (err) {
      toast.error('Failed to update user')
    }
  }

  const totalPages = Math.ceil(total / perPage)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-dark-400">Manage platform users</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-dark-400">{total} total users</span>
          <button onClick={fetchUsers} className="p-2 hover:bg-dark-700 rounded-lg" title="Refresh">
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="card p-4 mb-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input type="text" placeholder="Search by email or username..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
          </div>
          <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1) }} className="input w-40">
            <option value="">All Plans</option>
            <option value="free">Free</option>
            <option value="builder">Builder</option>
            <option value="pro">Pro</option>
            <option value="agency">Agency</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-dark-400">No users found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-dark-800">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">Email</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">Username</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">Plan</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">Projects</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">Joined</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-dark-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-dark-800/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{user.email}</p>
                      {user.is_verified && <span className="text-xs text-green-400">âœ“ verified</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-dark-400">{user.username || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${planColors[user.plan] || 'bg-dark-700 text-dark-300'}`}>{user.plan}</span>
                  </td>
                  <td className="px-6 py-4">{user.projects}</td>
                  <td className="px-6 py-4">
                    {user.is_active ? (
                      <span className="flex items-center gap-1 text-green-400 text-sm"><UserCheck className="w-4 h-4" /> Active</span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-400 text-sm"><UserX className="w-4 h-4" /> Disabled</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-dark-400">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(user)} className="p-2 hover:bg-dark-700 rounded-lg" title="Edit">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(user)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-dark-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-dark-400 mb-4">{editingUser.email}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-dark-400 mb-1">Subscription Plan</label>
                <select value={editPlan} onChange={(e) => setEditPlan(e.target.value)} className="input">
                  <option value="free">Free</option>
                  <option value="builder">Builder ($149/mo)</option>
                  <option value="pro">Pro ($299/mo)</option>
                  <option value="agency">Agency ($599/mo)</option>
                  <option value="enterprise">Enterprise ($1,299/mo)</option>
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} className="w-5 h-5 rounded" />
                <span>Account Active</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingUser(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleUpdate} className="btn-primary flex-1">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
