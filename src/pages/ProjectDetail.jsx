import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { projectsAPI } from '../services/api'
import { 
  ArrowLeft, Download, FileCode, Folder, FolderOpen,
  CheckCircle, XCircle, Clock, ChevronRight
} from 'lucide-react'
import { FullPageLoading } from '../components/Loading'
import toast from 'react-hot-toast'

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [files, setFiles] = useState({ frontend: [], backend: [] })
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileContent, setFileContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [expandedFolders, setExpandedFolders] = useState({})
  
  useEffect(() => {
    loadProject()
  }, [id])
  
  const loadProject = async () => {
    try {
      const [projectRes, filesRes] = await Promise.all([
        projectsAPI.get(id),
        projectsAPI.getFiles(id)
      ])
      setProject(projectRes.data.project)
      setFiles({
        frontend: filesRes.data.frontend_files || [],
        backend: filesRes.data.backend_files || []
      })
    } catch {
      toast.error('Failed to load project')
    } finally {
      setLoading(false)
    }
  }
  
  const loadFileContent = async (path, type) => {
    try {
      const res = await projectsAPI.getFileContent(id, path, type)
      setSelectedFile({ path, type })
      setFileContent(res.data.content)
    } catch {
      toast.error('Failed to load file')
    }
  }
  
  const handleDownload = () => {
    const token = localStorage.getItem('token')
    const url = projectsAPI.getDownloadUrl(id)
    
    // Open in new window with auth
    const link = document.createElement('a')
    link.href = url
    link.download = `${project.name}.zip`
    
    // Add auth header via fetch
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        link.href = url
        link.click()
        window.URL.revokeObjectURL(url)
      })
  }
  
  const toggleFolder = (folder) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folder]: !prev[folder]
    }))
  }
  
  const organizeFiles = (fileList) => {
    const tree = {}
    fileList.forEach(file => {
      const parts = file.split('/')
      let current = tree
      parts.forEach((part, i) => {
        if (i === parts.length - 1) {
          if (!current._files) current._files = []
          current._files.push(part)
        } else {
          if (!current[part]) current[part] = {}
          current = current[part]
        }
      })
    })
    return tree
  }
  
  const renderTree = (tree, path = '', type = 'frontend') => {
    const folders = Object.keys(tree).filter(k => k !== '_files').sort()
    const files = (tree._files || []).sort()
    
    return (
      <>
        {folders.map(folder => {
          const fullPath = path ? `${path}/${folder}` : folder
          const isExpanded = expandedFolders[fullPath]
          
          return (
            <div key={fullPath}>
              <button
                onClick={() => toggleFolder(fullPath)}
                className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-dark-700 rounded text-left text-dark-300 hover:text-white"
              >
                <ChevronRight className={`w-4 h-4 transition ${isExpanded ? 'rotate-90' : ''}`} />
                {isExpanded ? <FolderOpen className="w-4 h-4 text-yellow-500" /> : <Folder className="w-4 h-4 text-yellow-500" />}
                {folder}
              </button>
              {isExpanded && (
                <div className="ml-4 border-l border-dark-700">
                  {renderTree(tree[folder], fullPath, type)}
                </div>
              )}
            </div>
          )
        })}
        {files.map(file => {
          const fullPath = path ? `${path}/${file}` : file
          const isSelected = selectedFile?.path === fullPath && selectedFile?.type === type
          
          return (
            <button
              key={fullPath}
              onClick={() => loadFileContent(fullPath, type)}
              className={`flex items-center gap-2 w-full px-3 py-1.5 rounded text-left text-sm ${
                isSelected ? 'bg-primary-500/20 text-primary-300' : 'hover:bg-dark-700 text-dark-400 hover:text-white'
              }`}
            >
              <FileCode className="w-4 h-4 ml-5" />
              {file}
            </button>
          )
        })}
      </>
    )
  }
  
  if (loading) return <FullPageLoading text="Loading project..." />
  if (!project) return <div className="text-center py-20">Project not found</div>
  
  const frontendTree = organizeFiles(files.frontend)
  const backendTree = organizeFiles(files.backend)
  
  return (
    <div className="min-h-[80vh]">
      {/* Header */}
      <div className="bg-dark-900 border-b border-dark-700 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-dark-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                {project.name}
                {project.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {project.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
                {project.status !== 'completed' && project.status !== 'failed' && (
                  <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />
                )}
              </h1>
              <p className="text-dark-400 text-sm">
                {project.total_files} files • Generated in {project.execution_time?.toFixed(1)}s
              </p>
            </div>
          </div>
          {project.status === 'completed' && (
            <button onClick={handleDownload} className="btn-primary flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download ZIP
            </button>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex h-[calc(100vh-180px)]">
        {/* File tree */}
        <div className="w-72 bg-dark-900 border-r border-dark-700 overflow-y-auto p-4">
          {files.frontend.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-dark-400 uppercase mb-2 px-3">Frontend</h3>
              {renderTree(frontendTree, '', 'frontend')}
            </div>
          )}
          {files.backend.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-dark-400 uppercase mb-2 px-3">Backend</h3>
              {renderTree(backendTree, '', 'backend')}
            </div>
          )}
        </div>
        
        {/* Code viewer */}
        <div className="flex-1 bg-dark-950 overflow-hidden">
          {selectedFile ? (
            <div className="h-full flex flex-col">
              <div className="bg-dark-900 border-b border-dark-700 px-4 py-2 text-sm text-dark-400">
                {selectedFile.type}/{selectedFile.path}
              </div>
              <pre className="flex-1 overflow-auto p-4 text-sm font-mono text-dark-200">
                <code>{fileContent}</code>
              </pre>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-dark-500">
              <div className="text-center">
                <FileCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select a file to view its contents</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
