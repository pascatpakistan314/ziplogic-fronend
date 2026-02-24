/**
 * WebContainer Services - Single Export Point
 * 
 * All WebContainer functionality is now in WebContainerMaster.js
 * Other files have been removed (singleton, service, manager, fixer, runner)
 */

export { 
  WebContainerMaster,
  getWebContainerMaster,
  preBootWebContainer,
  isWebContainerAvailable,
  isWebContainerReady
} from './WebContainerMaster'

// Default export
export { default } from './WebContainerMaster'