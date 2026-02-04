import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { projectsAPI, dashboardAPI } from '../services/api'
import { Zap, Plus, Folder, Clock, CheckCircle, XCircle, Trash2, ExternalLink } from 'lucide-react'
import { FullPageLoading } from '../components/Loading'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      const [projectsRes, statsRes] = await Promise.all([
        projectsAPI.list(),
        dashboardAPI.getStats()
      ])
      setProjects(projectsRes.data.projects || [])
      setStats(statsRes.data.stats)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }
  
  const handleDelete = async (projectId) => {
    if (!confirm('Delete this project?')) return
    
    try {
      await projectsAPI.delete(projectId)
      setProjects(projects.filter(p => p.id !== projectId))
      toast.success('Project deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }
  
  const statusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />
      default: return <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />
    }
  }
  
  if (loading) return <FullPageLoading text="Loading dashboard..." />
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-dark-400">Welcome back, {user?.username}</p>
        </div>
        <Link to="/new-project" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          New Project
        </Link>
      </div>
      
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-6">
            <p className="text-dark-400 text-sm">Projects Used</p>
            <p className="text-3xl font-bold">{stats.projects_generated}/{stats.project_limit}</p>
          </div>
          <div className="card p-6">
            <p className="text-dark-400 text-sm">Total Projects</p>
            <p className="text-3xl font-bold">{stats.total_projects}</p>
          </div>
          <div className="card p-6">
            <p className="text-dark-400 text-sm">Completed</p>
            <p className="text-3xl font-bold text-green-500">{stats.completed_projects}</p>
          </div>
          <div className="card p-6">
            <p className="text-dark-400 text-sm">Plan</p>
            <p className="text-3xl font-bold capitalize gradient-text">{stats.subscription_plan}</p>
          </div>
        </div>
      )}
      
      {/* Projects */}
      <div className="card">
        <div className="p-6 border-b border-dark-700">
          <h2 className="text-xl font-bold">Your Projects</h2>
        </div>
        
        {projects.length === 0 ? (
          <div className="p-12 text-center">
            <Folder className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No projects yet</h3>
            <p className="text-dark-400 mb-6">Create your first project to get started</p>
            <Link to="/new-project" className="btn-primary inline-flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Create Project
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-dark-700">
            {projects.map((project) => (
              <div key={project.id} className="p-6 hover:bg-dark-800/50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {statusIcon(project.status)}
                    <div>
                      <Link 
                        to={`/project/${project.id}`}
                        className="text-lg font-medium hover:text-primary-400 transition"
                      >
                        {project.name}
                      </Link>
                      <p className="text-dark-400 text-sm">
                        {project.total_files} files • {project.execution_time?.toFixed(1)}s
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link 
                      to={`/project/${project.id}`}
                      className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(project.id)}
                      className="p-2 text-dark-400 hover:text-red-500 hover:bg-dark-700 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Upgrade CTA */}
      {stats?.subscription_plan === 'free' && (
        <div className="card mt-8 p-8 border-primary-500/30 bg-gradient-to-r from-primary-900/20 to-purple-900/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Upgrade for more projects</h3>
              <p className="text-dark-400">Get up to 50 projects per month with Pro plan</p>
            </div>
            <Link to="/pricing" className="btn-primary">
              View Plans
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
