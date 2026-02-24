/**
 * WebContainer Manager - Pre-Install Approach for Fast Loading
 * 
 * Features:
 * 1. Pre-loads base template with node_modules cached
 * 2. Only installs missing dependencies for new projects
 * 3. Caches WebContainer instance across projects
 * 
 * Usage:
 *   const manager = new WebContainerManager()
 *   await manager.init()
 *   await manager.loadProject(projectId, files, setupConfig)
 */

import { WebContainer } from '@webcontainer/api'

// Base template files that are pre-installed
const BASE_DEPENDENCIES = {
  "dependencies": {
    "next": "14.0.4",
    "react": "^18",
    "react-dom": "^18",
    "@prisma/client": "^5.7.0",
    "lucide-react": "^0.294.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "zod": "^3.22.4",
    "react-hook-form": "^7.49.2",
    "@hookform/resolvers": "^3.3.2"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "prisma": "^5.7.0"
  }
}

// shadcn/ui component dependencies
const SHADCN_DEPENDENCIES = {
  "@radix-ui/react-slot": "^1.0.2",
  "@radix-ui/react-dialog": "^1.0.5",
  "@radix-ui/react-dropdown-menu": "^2.0.6",
  "@radix-ui/react-label": "^2.0.2",
  "@radix-ui/react-select": "^2.0.0",
  "@radix-ui/react-tabs": "^1.0.4",
  "@radix-ui/react-checkbox": "^1.0.4",
  "@radix-ui/react-switch": "^1.0.3",
  "@radix-ui/react-avatar": "^1.0.4",
  "@radix-ui/react-toast": "^1.1.5",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.1.0"
}

class WebContainerManager {
  constructor() {
    this.container = null
    this.isBooted = false
    this.currentProjectId = null
    this.installedDeps = new Set()
    this.serverProcess = null
    this.baseInstalled = false
    
    // Event listeners
    this.onOutput = null
    this.onServerReady = null
    this.onError = null
  }
  
  /**
   * Initialize WebContainer (call once on app load)
   */
  async init() {
    if (this.container) {
      return this.container
    }
    
    try {
      console.log('ðŸš€ Booting WebContainer...')
      this.container = await WebContainer.boot()
      this.isBooted = true
      console.log('âœ… WebContainer booted')
      
      // Install base dependencies in background
      this.installBaseDependencies()
      
      return this.container
    } catch (error) {
      console.error('âŒ WebContainer boot failed:', error)
      this.onError?.(error)
      throw error
    }
  }
  
  /**
   * Pre-install base dependencies (runs in background)
   */
  async installBaseDependencies() {
    if (this.baseInstalled) return
    
    try {
      console.log('ðŸ“¦ Pre-installing base dependencies...')
      
      // Mount minimal package.json
      await this.container.mount({
        'package.json': {
          file: {
            contents: JSON.stringify({
              name: "ziplogic-base",
              version: "1.0.0",
              private: true,
              ...BASE_DEPENDENCIES
            }, null, 2)
          }
        }
      })
      
      // Install base
      const installProcess = await this.container.spawn('npm', ['install', '--prefer-offline'])
      
      installProcess.output.pipeTo(new WritableStream({
        write: (data) => {
          console.log('[npm install]', data)
        }
      }))
      
      const exitCode = await installProcess.exit
      
      if (exitCode === 0) {
        this.baseInstalled = true
        Object.keys(BASE_DEPENDENCIES.dependencies).forEach(dep => {
          this.installedDeps.add(dep)
        })
        console.log('âœ… Base dependencies installed')
      } else {
        console.warn('âš ï¸ Base install exited with code:', exitCode)
      }
      
    } catch (error) {
      console.error('âŒ Base install failed:', error)
    }
  }
  
  /**
   * Load a project into WebContainer
   * 
   * @param {string} projectId - Unique project ID
   * @param {Object} files - Project files { path: content }
   * @param {Object} setupConfig - Setup configuration from SETUP.json
   */
  async loadProject(projectId, files, setupConfig = null) {
    if (!this.isBooted) {
      await this.init()
    }
    
    // Stop existing server
    if (this.serverProcess) {
      this.serverProcess.kill()
      this.serverProcess = null
    }
    
    console.log(`ðŸ“‚ Loading project: ${projectId}`)
    this.currentProjectId = projectId
    
    try {
      // Convert files to WebContainer format
      const wcFiles = this.convertFilesToWCFormat(files)
      
      // Mount project files
      await this.container.mount(wcFiles)
      console.log(`âœ… Mounted ${Object.keys(files).length} files`)
      
      // Check what dependencies are needed
      const packageJson = files['package.json']
      if (packageJson) {
        await this.installMissingDependencies(JSON.parse(packageJson))
      }
      
      // Run database commands if needed
      if (files['prisma/schema.prisma']) {
        await this.setupPrisma()
      }
      
      // Start dev server
      await this.startDevServer()
      
      return true
      
    } catch (error) {
      console.error('âŒ Project load failed:', error)
      this.onError?.(error)
      throw error
    }
  }
  
  /**
   * Install only missing dependencies (faster than full install)
   */
  async installMissingDependencies(packageJson) {
    const allDeps = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {})
    }
    
    const missingDeps = Object.keys(allDeps).filter(
      dep => !this.installedDeps.has(dep)
    )
    
    if (missingDeps.length === 0) {
      console.log('âœ… All dependencies already installed')
      return
    }
    
    console.log(`ðŸ“¦ Installing ${missingDeps.length} missing dependencies...`)
    this.onOutput?.(`Installing ${missingDeps.length} packages...`)
    
    // Install missing deps
    const installProcess = await this.container.spawn(
      'npm',
      ['install', ...missingDeps, '--prefer-offline']
    )
    
    installProcess.output.pipeTo(new WritableStream({
      write: (data) => {
        this.onOutput?.(data)
      }
    }))
    
    const exitCode = await installProcess.exit
    
    if (exitCode === 0) {
      missingDeps.forEach(dep => this.installedDeps.add(dep))
      console.log('âœ… Missing dependencies installed')
    } else {
      console.warn('âš ï¸ Some dependencies may have failed')
    }
  }
  
  /**
   * Setup Prisma database
   */
  async setupPrisma() {
    console.log('ðŸ—„ï¸ Setting up Prisma...')
    this.onOutput?.('Setting up database...')
    
    try {
      // Generate Prisma client
      const generateProcess = await this.container.spawn('npx', ['prisma', 'generate'])
      
      generateProcess.output.pipeTo(new WritableStream({
        write: (data) => {
          this.onOutput?.(data)
        }
      }))
      
      await generateProcess.exit
      
      // Push schema to database
      const pushProcess = await this.container.spawn(
        'npx',
        ['prisma', 'db', 'push', '--skip-generate', '--accept-data-loss']
      )
      
      pushProcess.output.pipeTo(new WritableStream({
        write: (data) => {
          this.onOutput?.(data)
        }
      }))
      
      await pushProcess.exit
      
      console.log('âœ… Prisma setup complete')
      
    } catch (error) {
      console.error('âŒ Prisma setup failed:', error)
    }
  }
  
  /**
   * Start the development server
   */
  async startDevServer() {
    console.log('ðŸš€ Starting dev server...')
    this.onOutput?.('Starting development server...')
    
    this.serverProcess = await this.container.spawn('npm', ['run', 'dev'])
    
    this.serverProcess.output.pipeTo(new WritableStream({
      write: (data) => {
        this.onOutput?.(data)
        
        // Check if server is ready
        if (data.includes('Ready') || data.includes('started server') || data.includes('localhost:')) {
          this.onServerReady?.()
        }
      }
    }))
    
    // Listen for server URL
    this.container.on('server-ready', (port, url) => {
      console.log(`âœ… Server ready at ${url}`)
      this.onServerReady?.(url, port)
    })
    
    return this.serverProcess
  }
  
  /**
   * Update a single file in the container
   */
  async updateFile(path, content) {
    if (!this.container) return
    
    try {
      await this.container.fs.writeFile(path, content)
      console.log(`âœï¸ Updated: ${path}`)
    } catch (error) {
      console.error(`âŒ Failed to update ${path}:`, error)
    }
  }
  
  /**
   * Read a file from the container
   */
  async readFile(path) {
    if (!this.container) return null
    
    try {
      return await this.container.fs.readFile(path, 'utf-8')
    } catch {
      return null
    }
  }
  
  /**
   * Run a command in the container
   */
  async runCommand(command, args = []) {
    if (!this.container) return null
    
    console.log(`ðŸ”§ Running: ${command} ${args.join(' ')}`)
    
    const process = await this.container.spawn(command, args)
    
    process.output.pipeTo(new WritableStream({
      write: (data) => {
        this.onOutput?.(data)
      }
    }))
    
    const exitCode = await process.exit
    return exitCode
  }
  
  /**
   * Stop the current server
   */
  stopServer() {
    if (this.serverProcess) {
      this.serverProcess.kill()
      this.serverProcess = null
      console.log('ðŸ›‘ Server stopped')
    }
  }
  
  /**
   * Convert files object to WebContainer format
   */
  convertFilesToWCFormat(files) {
    const wcFiles = {}
    
    for (const [path, content] of Object.entries(files)) {
      const parts = path.split('/')
      let current = wcFiles
      
      for (let i = 0; i < parts.length - 1; i++) {
        const dir = parts[i]
        if (!current[dir]) {
          current[dir] = { directory: {} }
        }
        current = current[dir].directory
      }
      
      const fileName = parts[parts.length - 1]
      current[fileName] = {
        file: { contents: content }
      }
    }
    
    return wcFiles
  }
  
  /**
   * Get the current preview URL
   */
  getPreviewUrl() {
    return `http://localhost:3000`
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    this.stopServer()
    this.container = null
    this.isBooted = false
    this.currentProjectId = null
  }
}

// Singleton instance
let managerInstance = null

export function getWebContainerManager() {
  if (!managerInstance) {
    managerInstance = new WebContainerManager()
  }
  return managerInstance
}

export { WebContainerManager }
export default WebContainerManager