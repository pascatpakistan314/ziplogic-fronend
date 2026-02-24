import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { projectsAPI, editorAPI } from '../services/api'
import {
  ArrowLeft, Save, Wand2, Upload, Plus, Trash2, Download,
  FileCode, FolderOpen, ChevronRight, ChevronDown, Eye, EyeOff,
  Send, Loader2, Check, X, Image, RefreshCw, Play, Code2,
  MessageSquare, Sparkles, File, MoreVertical
} from 'lucide-react'
import toast from 'react-hot-toast'

// ═══════════════════════════════════════════════════════
// FILE TREE COMPONENT
// ═══════════════════════════════════════════════════════

function FileTree({ files, selectedFile, onSelect, onDelete }) {
  const [expanded, setExpanded] = useState({})
  
  // Build tree structure from flat paths
  const tree = {}
  Object.keys(files).sort().forEach(path => {
    const parts = path.split('/')
    let current = tree
    parts.forEach((part, i) => {
      if (i === parts.length - 1) {
        current[part] = { __path: path, __isFile: true }
      } else {
        if (!current[part]) current[part] = {}
        current = current[part]
      }
    })
  })
  
  const toggle = (path) => setExpanded(p => ({ ...p, [path]: !p[path] }))
  
  const getIcon = (name) => {
    const ext = name.split('.').pop()
    const colors = {
      tsx: 'text-blue-400', ts: 'text-blue-300', jsx: 'text-cyan-400',
      js: 'text-yellow-400', css: 'text-pink-400', html: 'text-orange-400',
      json: 'text-yellow-500', prisma: 'text-teal-400', md: 'text-gray-400',
      png: 'text-green-400', jpg: 'text-green-400', svg: 'text-purple-400',
    }
    return <FileCode size={14} className={colors[ext] || 'text-white/50'} />
  }
  
  const renderNode = (node, name, path, depth = 0) => {
    if (node.__isFile) {
      const isImage = /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(name)
      const isSelected = node.__path === selectedFile
      return (
        <div
          key={node.__path}
          onClick={() => onSelect(node.__path)}
          className={`flex items-center gap-2 px-2 py-1 cursor-pointer rounded text-sm group
            ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {isImage ? <Image size={14} className="text-green-400" /> : getIcon(name)}
          <span className="truncate flex-1">{name}</span>
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(node.__path) }}
              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      )
    }
    
    const isOpen = expanded[path] !== false // default open
    const children = Object.entries(node).filter(([k]) => !k.startsWith('__'))
    
    return (
      <div key={path}>
        <div
          onClick={() => toggle(path)}
          className="flex items-center gap-1 px-2 py-1 cursor-pointer text-sm text-white/60 hover:text-white/90"
          style={{ paddingLeft: `${depth * 16 + 4}px` }}
        >
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <FolderOpen size={14} className="text-yellow-500/70" />
          <span>{name}</span>
        </div>
        {isOpen && children.map(([k, v]) => renderNode(v, k, `${path}/${k}`, depth + 1))}
      </div>
    )
  }
  
  return (
    <div className="text-sm overflow-y-auto max-h-full">
      {Object.entries(tree).map(([k, v]) => renderNode(v, k, k, 0))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// CODE EDITOR COMPONENT (textarea with line numbers)
// ═══════════════════════════════════════════════════════

function CodeEditor({ content, onChange, language }) {
  const textareaRef = useRef(null)
  const lineNumbersRef = useRef(null)
  const lines = (content || '').split('\n')
  
  const syncScroll = () => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }
  
  const handleTab = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const { selectionStart, selectionEnd } = e.target
      const newContent = content.substring(0, selectionStart) + '  ' + content.substring(selectionEnd)
      onChange(newContent)
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = selectionStart + 2
      }, 0)
    }
  }
  
  return (
    <div className="flex flex-1 overflow-hidden bg-[#0d1117] rounded-lg border border-white/10">
      {/* Line numbers */}
      <div
        ref={lineNumbersRef}
        className="flex-shrink-0 overflow-hidden select-none bg-[#0d1117] border-r border-white/10 text-right py-3 px-2"
        style={{ width: '50px' }}
      >
        {lines.map((_, i) => (
          <div key={i} className="text-white/20 text-xs leading-5 font-mono">{i + 1}</div>
        ))}
      </div>
      
      {/* Code area */}
      <textarea
        ref={textareaRef}
        value={content || ''}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        onKeyDown={handleTab}
        spellCheck={false}
        className="flex-1 bg-transparent text-emerald-300/90 font-mono text-sm leading-5 p-3 
                   resize-none outline-none border-none overflow-auto"
        style={{ tabSize: 2 }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// AI CHAT PANEL
// ═══════════════════════════════════════════════════════

function AIChatPanel({ projectId, selectedFile, onFileUpdated }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  const sendCommand = async () => {
    if (!input.trim() || loading) return
    
    const command = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: command }])
    setLoading(true)
    
    try {
      const res = await editorAPI.aiEdit(projectId, command, selectedFile)
      const data = res.data
      
      if (data.success) {
        setMessages(prev => [...prev, {
          role: 'ai',
          text: `✅ Updated **${data.file_path}**`,
          file: data.file_path
        }])
        onFileUpdated(data.file_path, data.content)
        toast.success(`Updated ${data.file_path}`)
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: `❌ ${data.error}` }])
        toast.error(data.error)
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'AI edit failed'
      setMessages(prev => [...prev, { role: 'ai', text: `❌ ${msg}` }])
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
        <Sparkles size={16} className="text-purple-400" />
        <span className="text-sm font-medium text-white/80">AI Editor</span>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-white/30 text-sm text-center mt-8">
            <Wand2 size={24} className="mx-auto mb-2 opacity-50" />
            <p>Tell AI what to change:</p>
            <p className="text-xs mt-2 italic">"Change the title to My Store"</p>
            <p className="text-xs italic">"Make the navbar dark blue"</p>
            <p className="text-xs italic">"Add a contact page"</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`text-sm ${msg.role === 'user' ? 'text-right' : ''}`}>
            <div className={`inline-block max-w-[90%] px-3 py-2 rounded-lg ${
              msg.role === 'user'
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-white/5 text-white/80'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-purple-400 text-sm">
            <Loader2 size={14} className="animate-spin" />
            <span>AI is editing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-3 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendCommand()}
            placeholder={selectedFile ? `Edit ${selectedFile.split('/').pop()}...` : 'Describe your change...'}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm
                       text-white placeholder-white/30 outline-none focus:border-emerald-500/50"
          />
          <button
            onClick={sendCommand}
            disabled={loading || !input.trim()}
            className="px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30
                       disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// MAIN EDITOR PAGE
// ═══════════════════════════════════════════════════════

export default function ProjectEditor() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [files, setFiles] = useState({})
  const [selectedFile, setSelectedFile] = useState(null)
  const [editedContent, setEditedContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showAI, setShowAI] = useState(true)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showNewFile, setShowNewFile] = useState(false)
  const [newFilePath, setNewFilePath] = useState('')
  const fileInputRef = useRef(null)
  
  // Load project
  useEffect(() => { loadProject() }, [id])
  
  // Track changes
  useEffect(() => {
    setHasChanges(editedContent !== originalContent)
  }, [editedContent, originalContent])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        saveFile()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedFile, editedContent])
  
  const loadProject = async () => {
    try {
      const [projRes, filesRes] = await Promise.all([
        projectsAPI.get(id),
        projectsAPI.getFiles(id)
      ])
      setProject(projRes.data.project || projRes.data)
      
      // Build flat file map from the files response
      const allFiles = {}
      const frontendFiles = filesRes.data.frontend_files || []
      const backendFiles = filesRes.data.backend_files || []
      
      // Also try getting all files as dict
      if (filesRes.data.files && typeof filesRes.data.files === 'object') {
        Object.assign(allFiles, filesRes.data.files)
      }
      
      // Merge file lists
      for (const f of [...frontendFiles, ...backendFiles]) {
        if (typeof f === 'string') {
          allFiles[f] = allFiles[f] || null // path only, content loaded on click
        } else if (f.path) {
          allFiles[f.path] = f.content || null
        }
      }
      
      setFiles(allFiles)
      
      // Auto-select first tsx/jsx file
      const firstEditable = Object.keys(allFiles).find(f => 
        /\.(tsx|jsx|ts|js|css|html|json|prisma|md)$/.test(f)
      )
      if (firstEditable) {
        selectFile(firstEditable, allFiles)
      }
      
    } catch (err) {
      toast.error('Failed to load project')
    } finally {
      setLoading(false)
    }
  }
  
  const selectFile = async (path, allFiles = files) => {
    // Save current file if changed
    if (hasChanges && selectedFile) {
      const save = window.confirm(`Save changes to ${selectedFile}?`)
      if (save) await saveFile()
    }
    
    setSelectedFile(path)
    
    // Load content
    let content = allFiles[path]
    if (content === null || content === undefined) {
      try {
        const res = await projectsAPI.getFileContent(id, path)
        content = res.data.content
        setFiles(prev => ({ ...prev, [path]: content }))
      } catch {
        content = '// Failed to load file'
      }
    }
    
    setEditedContent(content || '')
    setOriginalContent(content || '')
  }
  
  const saveFile = async () => {
    if (!selectedFile || saving) return
    setSaving(true)
    
    try {
      await editorAPI.saveFile(id, selectedFile, editedContent)
      setOriginalContent(editedContent)
      setFiles(prev => ({ ...prev, [selectedFile]: editedContent }))
      setHasChanges(false)
      toast.success('Saved!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed')
    } finally {
      setSaving(false)
    }
  }
  
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    try {
      const res = await editorAPI.uploadImage(id, file)
      if (res.data.success) {
        toast.success(`Uploaded ${file.name} to ${res.data.path}`)
        setFiles(prev => ({ ...prev, [res.data.path]: `[IMAGE:${file.name}]` }))
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed')
    }
    
    e.target.value = '' // Reset
  }
  
  const handleAddFile = async () => {
    if (!newFilePath.trim()) return
    
    try {
      await editorAPI.addFile(id, newFilePath, '')
      setFiles(prev => ({ ...prev, [newFilePath]: '' }))
      setShowNewFile(false)
      setNewFilePath('')
      selectFile(newFilePath)
      toast.success(`Created ${newFilePath}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create file')
    }
  }
  
  const handleDeleteFile = async (path) => {
    if (!window.confirm(`Delete ${path}?`)) return
    
    try {
      await editorAPI.deleteFile(id, path)
      const newFiles = { ...files }
      delete newFiles[path]
      setFiles(newFiles)
      if (selectedFile === path) {
        setSelectedFile(null)
        setEditedContent('')
      }
      toast.success(`Deleted ${path}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed')
    }
  }
  
  const handleAIFileUpdated = (filePath, content) => {
    setFiles(prev => ({ ...prev, [filePath]: content }))
    if (filePath === selectedFile) {
      setEditedContent(content)
      setOriginalContent(content)
    }
  }
  
  const startPreview = async () => {
    setPreviewLoading(true)
    try {
      const res = await fetch(`/api/agents_v3/preview/start/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ project_id: id })
      })
      const data = await res.json()
      if (data.success && data.url) {
        setPreviewUrl(data.url)
        setShowPreview(true)
      } else if (data.local_url) {
        setPreviewUrl(data.local_url)
        setShowPreview(true)
      } else {
        toast.error(data.error || 'Preview failed')
      }
    } catch {
      toast.error('Preview start failed')
    } finally {
      setPreviewLoading(false)
    }
  }
  
  const handleDownload = () => {
    const token = localStorage.getItem('token')
    const url = projectsAPI.getDownloadUrl(id)
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const a = document.createElement('a')
        a.href = window.URL.createObjectURL(blob)
        a.download = `${project?.name || 'project'}.zip`
        a.click()
        window.URL.revokeObjectURL(a.href)
      })
  }
  
  // ─── LOADING STATE ───
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-400" size={32} />
      </div>
    )
  }
  
  const isImage = selectedFile && /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(selectedFile)
  const fileCount = Object.keys(files).length
  
  return (
    <div className="h-screen flex flex-col bg-[#0a0f1a]">
      {/* ─── TOP BAR ─── */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0d1321] border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-white font-semibold text-sm">{project?.name || 'Project'}</h1>
            <span className="text-white/30 text-xs">{fileCount} files</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Save button */}
          <button
            onClick={saveFile}
            disabled={!hasChanges || saving}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${hasChanges 
                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30' 
                : 'bg-white/5 text-white/30 border border-white/10'}`}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save {hasChanges ? '•' : ''}
          </button>
          
          {/* Upload Image */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
                       bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
          >
            <Upload size={14} />
            Image
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          
          {/* Preview toggle */}
          <button
            onClick={() => showPreview ? setShowPreview(false) : startPreview()}
            disabled={previewLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
                       bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30"
          >
            {previewLoading ? <Loader2 size={14} className="animate-spin" /> : showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            Preview
          </button>
          
          {/* AI toggle */}
          <button
            onClick={() => setShowAI(!showAI)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all
              ${showAI 
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
                : 'bg-white/5 text-white/60 border-white/10 hover:text-white'}`}
          >
            <Wand2 size={14} />
            AI
          </button>
          
          {/* Download */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
                       bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
          >
            <Download size={14} />
          </button>
        </div>
      </div>
      
      {/* ─── MAIN AREA ─── */}
      <div className="flex flex-1 overflow-hidden">
        {/* FILE TREE SIDEBAR */}
        <div className="w-56 flex-shrink-0 bg-[#0d1321] border-r border-white/10 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <span className="text-xs text-white/40 uppercase tracking-wider">Files</span>
            <button
              onClick={() => setShowNewFile(true)}
              className="text-white/40 hover:text-emerald-400 transition-colors"
              title="New file"
            >
              <Plus size={14} />
            </button>
          </div>
          
          {showNewFile && (
            <div className="px-2 py-2 border-b border-white/10 flex gap-1">
              <input
                type="text"
                value={newFilePath}
                onChange={(e) => setNewFilePath(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFile()}
                placeholder="src/components/New.tsx"
                className="flex-1 bg-white/5 border border-white/20 rounded px-2 py-1 text-xs text-white 
                           placeholder-white/30 outline-none focus:border-emerald-500/50"
                autoFocus
              />
              <button onClick={handleAddFile} className="text-emerald-400 hover:text-emerald-300">
                <Check size={14} />
              </button>
              <button onClick={() => setShowNewFile(false)} className="text-white/40 hover:text-white">
                <X size={14} />
              </button>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto py-1">
            <FileTree
              files={files}
              selectedFile={selectedFile}
              onSelect={(path) => selectFile(path)}
              onDelete={handleDeleteFile}
            />
          </div>
        </div>
        
        {/* CODE EDITOR */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* File tab */}
          {selectedFile && (
            <div className="flex items-center gap-2 px-4 py-2 bg-[#0d1321] border-b border-white/10">
              <FileCode size={14} className="text-emerald-400" />
              <span className="text-sm text-white/70">{selectedFile}</span>
              {hasChanges && <span className="w-2 h-2 bg-orange-400 rounded-full" title="Unsaved changes" />}
              <span className="text-xs text-white/20 ml-auto">
                {editedContent.split('\n').length} lines • Ctrl+S to save
              </span>
            </div>
          )}
          
          {/* Editor area */}
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col p-2 overflow-hidden">
              {selectedFile ? (
                isImage ? (
                  <div className="flex-1 flex items-center justify-center bg-[#0d1117] rounded-lg border border-white/10">
                    <div className="text-center">
                      <Image size={48} className="text-white/20 mx-auto mb-3" />
                      <p className="text-white/40 text-sm">{selectedFile}</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-3 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm
                                   hover:bg-emerald-500/30 transition-colors"
                      >
                        Replace Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <CodeEditor
                    content={editedContent}
                    onChange={setEditedContent}
                    language={selectedFile.split('.').pop()}
                  />
                )
              ) : (
                <div className="flex-1 flex items-center justify-center bg-[#0d1117] rounded-lg border border-white/10">
                  <div className="text-center text-white/20">
                    <Code2 size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Select a file to edit</p>
                    <p className="text-xs mt-1">or use AI to make changes</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* PREVIEW PANEL */}
            {showPreview && (
              <div className="w-[45%] flex-shrink-0 border-l border-white/10 flex flex-col">
                <div className="flex items-center justify-between px-3 py-2 bg-[#0d1321] border-b border-white/10">
                  <span className="text-xs text-white/40 uppercase tracking-wider">Live Preview</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={startPreview}
                      className="text-white/40 hover:text-emerald-400 transition-colors"
                      title="Refresh preview"
                    >
                      <RefreshCw size={12} />
                    </button>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
                {previewUrl ? (
                  <iframe
                    src={previewUrl}
                    className="flex-1 bg-white"
                    title="Preview"
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-white/20 text-sm">
                    <div className="text-center">
                      <Play size={24} className="mx-auto mb-2 opacity-50" />
                      <p>Click Preview to start</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* AI PANEL */}
        {showAI && (
          <div className="w-72 flex-shrink-0 bg-[#0d1321] border-l border-white/10">
            <AIChatPanel
              projectId={id}
              selectedFile={selectedFile}
              onFileUpdated={handleAIFileUpdated}
            />
          </div>
        )}
      </div>
    </div>
  )
}
