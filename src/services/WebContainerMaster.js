/**
 * ═══════════════════════════════════════════════════════════════════
 * WEBCONTAINER MASTER - Single Source of Truth
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Features:
 * ✅ Singleton Pattern (window.__webContainerInstance)
 * ✅ Pre-boot on Dashboard/Landing for instant start
 * ✅ npm install with retry (3 attempts + exponential backoff)
 * ✅ Auto-install missing modules from errors
 * ✅ Timeout handling (60 seconds)
 * ✅ Progress % tracking
 * ✅ Detailed console logging
 * ✅ Next.js commands built-in
 * ✅ AI Fixer command execution
 * 
 * Usage:
 *   import { getWebContainerMaster, preBootWebContainer } from './webcontainer'
 *   
 *   // Pre-boot on Dashboard/Landing (background)
 *   preBootWebContainer()
 *   
 *   // Use in NewProject
 *   const wc = getWebContainerMaster()
 *   await wc.runProject(files, projectId, callbacks)
 */

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const CONFIG = {
  MAX_RETRIES: 3,
  INSTALL_TIMEOUT: 60000,      // 60 seconds
  RETRY_DELAYS: [2000, 5000, 10000],  // Exponential backoff
  DEV_SERVER_TIMEOUT: 30000,   // 30 seconds for server ready
}

// Next.js base dependencies (pre-cached)
const BASE_DEPENDENCIES = {
  "next": "14.0.4",
  "react": "18.2.0",
  "react-dom": "18.2.0",
  "@prisma/client": "^5.7.0",
  "lucide-react": "^0.294.0",
  "tailwindcss": "^3.4.0",
  "autoprefixer": "^10.4.16",
  "postcss": "^8.4.32",
  "zod": "^3.22.4",
  "typescript": "^5",
}

// Common missing module patterns
const MODULE_PATTERNS = [
  /Cannot find module ['"]([^'"]+)['"]/,
  /Module not found: .*['"]([^'"]+)['"]/,
  /Error: Cannot find module ['"]([^'"]+)['"]/,
  /Module not found: Error: Can't resolve ['"]([^'"]+)['"]/,
]

// ═══════════════════════════════════════════════════════════════════
// WEBCONTAINER CLASS
// ═══════════════════════════════════════════════════════════════════

class WebContainerMaster {
  constructor() {
    this.container = null
    this.isBooted = false
    this.isBooting = false
    this.currentProcess = null
    this.serverUrl = null
    this.projectId = null
    
    // Progress tracking
    this.progress = 0
    this.status = 'idle'
    
    // Callbacks
    this.onLog = null
    this.onProgress = null
    this.onError = null
    this.onServerReady = null
    
    // Retry tracking
    this.retryCount = 0
    this.installedModules = new Set()
    
    this._log('info', '🚀 WebContainerMaster initialized')
  }

  // ─────────────────────────────────────────────────────────────────
  // LOGGING
  // ─────────────────────────────────────────────────────────────────
  
  _log(type, message, details = null) {
    const timestamp = new Date().toLocaleTimeString()
    const prefix = {
      'info': '📋',
      'success': '✅',
      'warning': '⚠️',
      'error': '❌',
      'progress': '📊',
      'command': '⚡',
    }[type] || '📋'
    
    const logMessage = `[${timestamp}] ${prefix} ${message}`
    
    // Console log with color
    const colors = {
      'info': 'color: #00ddff',
      'success': 'color: #00ff88',
      'warning': 'color: #ffaa00',
      'error': 'color: #ff4444',
      'progress': 'color: #8844ff',
      'command': 'color: #00ff88; font-weight: bold',
    }
    console.log(`%c${logMessage}`, colors[type] || '')
    if (details) console.log(details)
    
    // Callback
    if (this.onLog) {
      this.onLog({ type, message, timestamp, details })
    }
  }

  _setProgress(percent, status) {
    this.progress = percent
    this.status = status
    this._log('progress', `${percent}% - ${status}`)
    if (this.onProgress) {
      this.onProgress(percent, status)
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // BOOT (Singleton)
  // ─────────────────────────────────────────────────────────────────
  
  async boot() {
    // Already booted - return cached instance
    if (this.isBooted && this.container) {
      this._log('info', 'WebContainer already booted (cached)')
      return this.container
    }
    
    // Already booting - wait for it
    if (this.isBooting) {
      this._log('info', 'WebContainer boot in progress, waiting...')
      return this._waitForBoot()
    }
    
    // Check global cache first
    if (window.__webContainerInstance) {
      this._log('success', 'Using globally cached WebContainer (instant!)')
      this.container = window.__webContainerInstance
      this.isBooted = true
      return this.container
    }
    
    // Boot new instance
    this.isBooting = true
    this._setProgress(5, 'Booting WebContainer...')
    
    try {
      // Load SDK
      const { WebContainer } = await import('@webcontainer/api')
      this._log('info', 'WebContainer SDK loaded')
      
      // Boot
      this._log('command', 'Booting WebContainer...')
      this.container = await WebContainer.boot()
      
      // Cache globally
      window.__webContainerInstance = this.container
      this.isBooted = true
      this.isBooting = false
      
      // Setup event listeners
      this.container.on('server-ready', (port, url) => {
        this._log('success', `Server ready at ${url}`)
        this.serverUrl = url
        if (this.onServerReady) {
          this.onServerReady(url, port)
        }
      })
      
      this.container.on('error', (error) => {
        this._log('error', `WebContainer error: ${error.message}`)
        if (this.onError) {
          this.onError(error.message)
        }
      })
      
      this._log('success', 'WebContainer booted & cached!')
      this._setProgress(10, 'WebContainer ready')
      
      return this.container
      
    } catch (error) {
      this.isBooting = false
      
      // Handle "already booted" error
      if (error.message?.includes('single') || error.message?.includes('Only one')) {
        this._log('warning', 'WebContainer already exists in tab, reusing...')
        if (window.__webContainerInstance) {
          this.container = window.__webContainerInstance
          this.isBooted = true
          return this.container
        }
      }
      
      this._log('error', `Boot failed: ${error.message}`)
      throw error
    }
  }

  async _waitForBoot(timeout = 30000) {
    const start = Date.now()
    while (this.isBooting && Date.now() - start < timeout) {
      await this._sleep(100)
    }
    if (this.container) return this.container
    throw new Error('Boot timeout')
  }

  // ─────────────────────────────────────────────────────────────────
  // MOUNT FILES
  // ─────────────────────────────────────────────────────────────────
  
  async mountFiles(files, projectId) {
    if (!this.container) {
      await this.boot()
    }
    
    this.projectId = projectId
    this._setProgress(15, 'Mounting project files...')
    
    // Convert flat files to tree structure
    const fileTree = this._convertToFileTree(files)
    
    // Mount
    await this.container.mount(fileTree)
    
    const fileCount = Object.keys(files).length
    this._log('success', `Mounted ${fileCount} files`)
    this._setProgress(20, `${fileCount} files mounted`)
    
    return true
  }

  _convertToFileTree(files) {
    const tree = {}
    
    for (const [path, content] of Object.entries(files)) {
      const parts = path.split('/')
      let current = tree
      
      for (let i = 0; i < parts.length - 1; i++) {
        const dir = parts[i]
        if (!current[dir]) {
          current[dir] = { directory: {} }
        }
        current = current[dir].directory
      }
      
      const fileName = parts[parts.length - 1]
      current[fileName] = { file: { contents: content } }
    }
    
    return tree
  }

  // ─────────────────────────────────────────────────────────────────
  // NPM INSTALL (with retry & timeout)
  // ─────────────────────────────────────────────────────────────────
  
  async npmInstall(packages = null) {
    this._setProgress(25, 'Installing dependencies...')
    
    let attempt = 0
    let lastError = null
    
    while (attempt < CONFIG.MAX_RETRIES) {
      attempt++
      this._log('command', `npm install (attempt ${attempt}/${CONFIG.MAX_RETRIES})`)
      
      try {
        const result = await this._runNpmInstall(packages, attempt)
        if (result.success) {
          this._setProgress(50, 'Dependencies installed')
          return result
        }
        lastError = result.error
        
        // Check for missing modules and auto-install
        const missingModule = this._extractMissingModule(result.output)
        if (missingModule && !this.installedModules.has(missingModule)) {
          this._log('warning', `Missing module detected: ${missingModule}`)
          this.installedModules.add(missingModule)
          
          // Try to install missing module
          const moduleResult = await this._installModule(missingModule)
          if (moduleResult.success) {
            continue // Retry main install
          }
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < CONFIG.MAX_RETRIES) {
          const delay = CONFIG.RETRY_DELAYS[attempt - 1] || 5000
          this._log('info', `Retrying in ${delay/1000}s...`)
          await this._sleep(delay)
        }
        
      } catch (error) {
        lastError = error.message
        this._log('error', `Install attempt ${attempt} failed: ${error.message}`)
      }
    }
    
    this._log('error', `npm install failed after ${CONFIG.MAX_RETRIES} attempts`)
    return { success: false, error: lastError }
  }

  async _runNpmInstall(packages = null, attempt = 1) {
    return new Promise(async (resolve) => {
      let output = ''
      let resolved = false
      
      // Timeout handler
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true
          this._log('error', `npm install timeout (${CONFIG.INSTALL_TIMEOUT/1000}s)`)
          resolve({ success: false, error: 'Install timeout', output })
        }
      }, CONFIG.INSTALL_TIMEOUT)
      
      try {
        const args = packages ? ['install', ...packages] : ['install']
        this._log('command', `> npm ${args.join(' ')}`)
        
        const process = await this.container.spawn('npm', args)
        
        // Capture output
        process.output.pipeTo(new WritableStream({
          write: (data) => {
            output += data
            this._log('info', data.trim())
            
            // Update progress based on output
            if (data.includes('added')) {
              this._setProgress(40, 'Packages downloaded...')
            }
          }
        }))
        
        const exitCode = await process.exit
        clearTimeout(timeout)
        
        if (!resolved) {
          resolved = true
          if (exitCode === 0) {
            this._log('success', 'npm install completed')
            resolve({ success: true, output })
          } else {
            this._log('error', `npm install failed (exit code: ${exitCode})`)
            resolve({ success: false, error: `Exit code: ${exitCode}`, output })
          }
        }
        
      } catch (error) {
        clearTimeout(timeout)
        if (!resolved) {
          resolved = true
          resolve({ success: false, error: error.message, output })
        }
      }
    })
  }

  async _installModule(moduleName) {
    this._log('command', `> npm install ${moduleName}`)
    
    try {
      const process = await this.container.spawn('npm', ['install', moduleName])
      
      process.output.pipeTo(new WritableStream({
        write: (data) => this._log('info', data.trim())
      }))
      
      const exitCode = await process.exit
      
      if (exitCode === 0) {
        this._log('success', `Installed: ${moduleName}`)
        return { success: true }
      }
      
      return { success: false }
      
    } catch (error) {
      this._log('error', `Failed to install ${moduleName}: ${error.message}`)
      return { success: false }
    }
  }

  _extractMissingModule(output) {
    for (const pattern of MODULE_PATTERNS) {
      const match = output.match(pattern)
      if (match && match[1]) {
        // Clean module name (handle scoped packages)
        let moduleName = match[1]
        if (moduleName.startsWith('@')) {
          // Scoped package: @scope/package
          moduleName = moduleName.split('/').slice(0, 2).join('/')
        } else {
          // Regular package: get first part
          moduleName = moduleName.split('/')[0]
        }
        return moduleName
      }
    }
    return null
  }

  // ─────────────────────────────────────────────────────────────────
  // PRISMA COMMANDS
  // ─────────────────────────────────────────────────────────────────
  
  async setupPrisma() {
    this._setProgress(55, 'Setting up Prisma...')
    
    try {
      // prisma generate
      this._log('command', '> npx prisma generate')
      const generateProcess = await this.container.spawn('npx', ['prisma', 'generate'])
      
      generateProcess.output.pipeTo(new WritableStream({
        write: (data) => this._log('info', data.trim())
      }))
      
      const genCode = await generateProcess.exit
      if (genCode !== 0) {
        this._log('warning', 'Prisma generate failed, continuing...')
      } else {
        this._log('success', 'Prisma client generated')
      }
      
      this._setProgress(60, 'Syncing database...')
      
      // prisma db push
      this._log('command', '> npx prisma db push --skip-generate')
      const pushProcess = await this.container.spawn('npx', [
        'prisma', 'db', 'push', '--skip-generate', '--accept-data-loss'
      ])
      
      pushProcess.output.pipeTo(new WritableStream({
        write: (data) => this._log('info', data.trim())
      }))
      
      const pushCode = await pushProcess.exit
      if (pushCode !== 0) {
        this._log('warning', 'Prisma db push failed, continuing...')
      } else {
        this._log('success', 'Database schema synced')
      }
      
      this._setProgress(65, 'Prisma ready')
      return true
      
    } catch (error) {
      this._log('error', `Prisma setup error: ${error.message}`)
      return false
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // DEV SERVER
  // ─────────────────────────────────────────────────────────────────
  
  async startDevServer(command = 'npm run dev') {
    this._setProgress(70, 'Starting dev server...')
    
    // Kill existing process
    if (this.currentProcess) {
      try {
        this.currentProcess.kill()
      } catch {}
    }
    
    const [cmd, ...args] = command.split(' ')
    this._log('command', `> ${command}`)
    
    this.currentProcess = await this.container.spawn(cmd, args)
    
    // Monitor output for errors
    this.currentProcess.output.pipeTo(new WritableStream({
      write: (data) => {
        this._log('info', data.trim())
        
        // Check for errors that need auto-fix
        if (this._isError(data)) {
          this._handleRuntimeError(data)
        }
      }
    }))
    
    // Wait for server ready
    this._setProgress(80, 'Waiting for server...')
    const ready = await this._waitForServer()
    
    if (ready) {
      this._setProgress(100, 'Server running!')
      return { success: true, url: this.serverUrl }
    } else {
      this._log('error', 'Server startup timeout')
      return { success: false, error: 'Server timeout' }
    }
  }

  async _waitForServer(timeout = CONFIG.DEV_SERVER_TIMEOUT) {
    const start = Date.now()
    
    while (Date.now() - start < timeout) {
      if (this.serverUrl) {
        return true
      }
      await this._sleep(500)
    }
    
    return false
  }

  _isError(data) {
    const errorPatterns = [
      /error/i,
      /failed/i,
      /cannot find module/i,
      /module not found/i,
      /syntaxerror/i,
      /referenceerror/i,
      /typeerror/i,
    ]
    return errorPatterns.some(p => p.test(data))
  }

  async _handleRuntimeError(errorText) {
    // Check for missing module
    const missingModule = this._extractMissingModule(errorText)
    
    if (missingModule && !this.installedModules.has(missingModule)) {
      this._log('warning', `Runtime missing module: ${missingModule}`)
      this.installedModules.add(missingModule)
      
      // Auto-install
      const result = await this._installModule(missingModule)
      
      if (result.success) {
        this._log('info', 'Restarting dev server after auto-install...')
        await this.restartDevServer()
      }
    }
  }

  async restartDevServer() {
    if (this.currentProcess) {
      try {
        this.currentProcess.kill()
      } catch {}
    }
    
    await this._sleep(1000)
    return await this.startDevServer()
  }

  // ─────────────────────────────────────────────────────────────────
  // FULL PROJECT RUN
  // ─────────────────────────────────────────────────────────────────
  
  async runProject(files, projectId, callbacks = {}) {
    // Set callbacks
    this.onLog = callbacks.onLog || null
    this.onProgress = callbacks.onProgress || null
    this.onError = callbacks.onError || null
    this.onServerReady = callbacks.onServerReady || null
    
    // Reset state
    this.serverUrl = null
    this.retryCount = 0
    this.installedModules = new Set()
    
    this._log('info', '═══════════════════════════════════════════')
    this._log('info', `Starting project: ${projectId}`)
    this._log('info', '═══════════════════════════════════════════')
    
    try {
      // Step 1: Boot
      this._setProgress(0, 'Starting WebContainer...')
      await this.boot()
      
      // Step 2: Patch files (add missing essentials)
      const patchedFiles = this._patchFiles(files)
      
      // Step 3: Mount files
      await this.mountFiles(patchedFiles, projectId)
      
      // Step 4: npm install (with retry)
      const installResult = await this.npmInstall()
      if (!installResult.success) {
        throw new Error(`npm install failed: ${installResult.error}`)
      }
      
      // Step 5: Prisma (if needed)
      const hasPrisma = Object.keys(patchedFiles).some(f => f.includes('prisma'))
      if (hasPrisma) {
        await this.setupPrisma()
      }
      
      // Step 6: Start dev server
      const serverResult = await this.startDevServer()
      
      this._log('info', '═══════════════════════════════════════════')
      this._log('success', 'Project running!')
      this._log('info', '═══════════════════════════════════════════')
      
      return serverResult
      
    } catch (error) {
      this._log('error', `Project failed: ${error.message}`)
      this._setProgress(0, 'Failed')
      if (this.onError) {
        this.onError(error.message)
      }
      return { success: false, error: error.message }
    }
  }

  _patchFiles(files) {
    const patched = { ...files }
    
    // Ensure package.json has correct Next.js versions
    if (patched['package.json']) {
      try {
        const pkg = JSON.parse(patched['package.json'])
        
        // Fix Next.js version for WebContainer compatibility
        if (pkg.dependencies?.next) {
          pkg.dependencies.next = '14.0.4'
          pkg.dependencies.react = '18.2.0'
          pkg.dependencies['react-dom'] = '18.2.0'
        }
        
        // Remove problematic packages
        if (pkg.devDependencies) {
          delete pkg.devDependencies['@next/font']
        }
        
        patched['package.json'] = JSON.stringify(pkg, null, 2)
        this._log('info', 'Patched package.json for WebContainer compatibility')
        
      } catch (e) {
        this._log('warning', 'Could not patch package.json')
      }
    }
    
    // Ensure next.config.js exists and is compatible
    if (!patched['next.config.js'] && !patched['next.config.mjs'] && !patched['next.config.ts']) {
      patched['next.config.js'] = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  }
}

module.exports = nextConfig`
      this._log('info', 'Created next.config.js')
    }
    
    // Delete problematic config files
    delete patched['next.config.ts']
    delete patched['next.config.mjs']
    
    return patched
  }

  // ─────────────────────────────────────────────────────────────────
  // AI FIXER - Run commands from AI
  // ─────────────────────────────────────────────────────────────────
  
  async runCommand(command) {
    if (!this.container) {
      throw new Error('WebContainer not booted')
    }
    
    this._log('command', `> ${command}`)
    
    const parts = command.split(' ')
    const process = await this.container.spawn(parts[0], parts.slice(1))
    
    let output = ''
    process.output.pipeTo(new WritableStream({
      write: (data) => {
        output += data
        this._log('info', data.trim())
      }
    }))
    
    const exitCode = await process.exit
    
    return {
      success: exitCode === 0,
      exitCode,
      output
    }
  }

  async runCommands(commands) {
    const results = []
    
    for (const cmd of commands) {
      if (cmd.startsWith('rm ')) {
        // Handle file deletion
        const filePath = cmd.replace('rm ', '').trim()
        try {
          await this.container.fs.rm(filePath)
          this._log('success', `Deleted: ${filePath}`)
          results.push({ command: cmd, success: true })
        } catch {
          results.push({ command: cmd, success: false })
        }
      } else {
        const result = await this.runCommand(cmd)
        results.push({ command: cmd, ...result })
      }
    }
    
    return results
  }

  async writeFile(path, content) {
    if (!this.container) {
      throw new Error('WebContainer not booted')
    }
    
    try {
      // Ensure directory exists
      const dir = path.split('/').slice(0, -1).join('/')
      if (dir) {
        await this.container.fs.mkdir(dir, { recursive: true }).catch(() => {})
      }
      
      await this.container.fs.writeFile(path, content)
      this._log('success', `Written: ${path}`)
      return true
      
    } catch (error) {
      this._log('error', `Failed to write ${path}: ${error.message}`)
      return false
    }
  }

  async writeFiles(files) {
    for (const [path, content] of Object.entries(files)) {
      await this.writeFile(path, content)
    }
  }

  async deleteFile(path) {
    try {
      await this.container.fs.rm(path)
      this._log('success', `Deleted: ${path}`)
      return true
    } catch {
      return false
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────────
  
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  stop() {
    if (this.currentProcess) {
      try {
        this.currentProcess.kill()
      } catch {}
      this.currentProcess = null
    }
    this.serverUrl = null
    this._log('info', 'Server stopped')
  }

  getStatus() {
    return {
      isBooted: this.isBooted,
      isBooting: this.isBooting,
      serverUrl: this.serverUrl,
      projectId: this.projectId,
      progress: this.progress,
      status: this.status,
    }
  }

  isReady() {
    return this.isBooted && this.container !== null
  }
}


// ═══════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════

let masterInstance = null

export function getWebContainerMaster() {
  if (!masterInstance) {
    masterInstance = new WebContainerMaster()
  }
  return masterInstance
}


// ═══════════════════════════════════════════════════════════════════
// PRE-BOOT FUNCTION (Call from Dashboard/Landing)
// ═══════════════════════════════════════════════════════════════════

export async function preBootWebContainer() {
  // Already booted or booting
  if (window.__webContainerInstance || window.__webContainerBooting) {
    console.log('%c[WebContainer] Already pre-booted or booting', 'color: #00ff88')
    return
  }
  
  try {
    console.log('%c[WebContainer] 🚀 Pre-booting in background...', 'color: #00ddff')
    window.__webContainerBooting = true
    
    const { WebContainer } = await import('@webcontainer/api')
    const container = await WebContainer.boot()
    
    window.__webContainerInstance = container
    window.__webContainerBooting = false
    
    console.log('%c[WebContainer] ✅ Pre-booted & cached!', 'color: #00ff88; font-weight: bold')
    
  } catch (error) {
    window.__webContainerBooting = false
    
    if (error.message?.includes('single') || error.message?.includes('Only one')) {
      console.log('%c[WebContainer] Already exists in this tab', 'color: #ffaa00')
    } else {
      console.log('%c[WebContainer] Pre-boot failed (will retry on use)', 'color: #ff4444')
    }
  }
}


// ═══════════════════════════════════════════════════════════════════
// CHECK AVAILABILITY
// ═══════════════════════════════════════════════════════════════════

export function isWebContainerAvailable() {
  return window.__webContainerInstance !== null || window.__webContainerInstance !== undefined
}

export function isWebContainerReady() {
  return window.__webContainerInstance !== null
}


// ═══════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════

export { WebContainerMaster }
export default WebContainerMaster