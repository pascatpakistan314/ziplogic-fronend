import { useState, useEffect, useCallback } from 'react'
import { Search, Eye, Download, Trash2, ChevronLeft, ChevronRight, Loader2, RefreshCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI } from '../../services/api'

const statusColors = {
  completed: 'bg-green-500/20 text-green-400',
  failed: 'bg-red-500/20 text-red-400',
  generating: 'bg-yellow-500/20 text-yellow-400',
  pending: 'bg-dark-700 text-dark-300',
}

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const perPage = 20

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: perPage }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      const { data } = await adminAPI.getProjects(params)
      if (data.success) {
        setProjects(data.projects)
        setTotal(data.total)
      }
    } catch (err) {
      toast.error('Failed to load projects')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleDelete = async (project) => {
    if (!window.confirm(`Delete project "${project.name}"?`)) return
    try {
      const { data } = await adminAPI.deleteProject(project.id)
      if (data.success) {
        toast.success('Project deleted')
        fetchProjects()
      }
    } catch (err) {
      toast.error('Failed to delete project')
    }
  }

  const handleView = (project) => {
    // Open project detail in new tab or modal
    window.open(`/admin/projects/${project.id}`, '_blank')
  }

  const handleDownload = (project) => {
    if (project.status !== 'completed') return
    const url = adminAPI.downloadProject(project.id)
    const token = localStorage.getItem('token')
    // Create temp link with auth
    const link = document.createElement('a')
    link.href = `${url}?token=${token}`
    link.download = `${project.name}.zip`
    link.click()
    toast.success('Download started')
  }

  const totalPages = Math.ceil(total / perPage)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-dark-400">All generated projects</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-dark-400">{total} total projects</span>
          <button onClick={fetchProjects} className="p-2 hover:bg-dark-700 rounded-lg" title="Refresh">
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="card p-4 mb-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input type="text" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="input w-40">
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="generating">Generating</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 text-dark-400">No projects found</div>
        ) : (
          <table className="w-full">
            <thead className="bg-dark-800">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">Project</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">User</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">Files</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">Time</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">Created</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-dark-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-dark-800/50">
                  <td className="px-6 py-4 font-medium">{project.name}</td>
                  <td className="px-6 py-4 text-dark-400">{project.user}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[project.status] || 'bg-dark-700 text-dark-300'}`}>{project.status}</span>
                  </td>
                  <td className="px-6 py-4">{project.total_files}</td>
                  <td className="px-6 py-4 text-dark-400">{project.execution_time ? `${project.execution_time}s` : '-'}</td>
                  <td className="px-6 py-4 text-dark-400">{new Date(project.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleView(project)} className="p-2 hover:bg-dark-700 rounded-lg" title="View"><Eye className="w-4 h-4" /></button>
                      {project.status === 'completed' && (
                        <button onClick={() => handleDownload(project)} className="p-2 hover:bg-dark-700 rounded-lg" title="Download"><Download className="w-4 h-4" /></button>
                      )}
                      <button onClick={() => handleDelete(project)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
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
            <span className="text-sm text-dark-400">
              Page {page} of {totalPages} ({total} total)
            </span>
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
