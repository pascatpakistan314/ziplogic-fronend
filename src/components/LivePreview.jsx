/**
 * LivePreview v7.0 - Local Bash Preview Integration
 * - Preview URL comes from WebSocket (generation_complete event)
 * - No manual API calls needed
 * - Local dev server (npm run dev)
 * - Faster and more reliable
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  RefreshCw,
  X,
  Loader2,
  AlertCircle,
  Monitor
} from 'lucide-react';

const LivePreview = ({
  projectId,
  files = {},
  status = 'idle',
  onStatusChange,
  autoStart = true,
  previewUrl = null  // Local preview URL from WebSocket
}) => {
  const containerRef = useRef(null);
  const vmRef = useRef(null);
  const mountedRef = useRef(true);
  const initializingRef = useRef(false);
  
  const [previewStatus, setPreviewStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState(previewUrl);

  // Clear stale preview URL on mount if not provided as prop
  useEffect(() => {
    if (!previewUrl && currentPreviewUrl) {
      console.log(`[Preview ${projectId}] Clearing stale preview URL on mount`);
      setCurrentPreviewUrl(null);
      setPreviewStatus('idle');
    }
  }, []);

  // Update preview URL when prop changes (from WebSocket)
  useEffect(() => {
    if (previewUrl && previewUrl !== currentPreviewUrl) {
      console.log(`[Preview ${projectId}] New preview URL received: ${previewUrl}`);
      setCurrentPreviewUrl(previewUrl);
      setPreviewStatus('running');
      setError(null);
    }
  }, [previewUrl, projectId]);

  // Track mounted state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Notify parent of status changes
  useEffect(() => {
    onStatusChange?.(previewStatus);
  }, [previewStatus, onStatusChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log(`[Preview ${projectId}] Unmounting, cleaning up...`);
      initializingRef.current = false;
      if (vmRef.current) {
        vmRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [projectId]);

  const startPreview = useCallback(async () => {
    // Guard: Prevent multiple simultaneous starts
    if (previewStatus === 'starting') {
      console.log(`[Preview ${projectId}] Already starting, skipping...`);
      return;
    }

    if (initializingRef.current) {
      console.log(`[Preview ${projectId}] Initialization in progress, skipping...`);
      return;
    }

    console.log(`[Preview ${projectId}] Starting preview...`);
    initializingRef.current = true;
    setError(null);
    setPreviewStatus('starting');
    
    // Add small delay to prevent race conditions
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Call API to start preview
      console.log(`[Preview ${projectId}] 🚀 Calling API to start preview...`);
      
      const API_URL = import.meta.env.VITE_API_URL || '';
      const apiEndpoint = API_URL ? `${API_URL}/agents_v5/preview/start/` : '/api/agents_v5/preview/start/';
      
      console.log(`[Preview ${projectId}] API Endpoint: ${apiEndpoint}`);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ project_id: projectId })
      });
      
      const data = await response.json();
      console.log(`[Preview ${projectId}] API Response:`, data);
      
      if (response.status === 409) {
        // Preview already starting - wait and retry
        console.log(`[Preview ${projectId}] ⏳ Preview already starting, waiting...`);
        setPreviewStatus('loading');
        
        // Wait 3 seconds and check status
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Try to get existing preview URL from database
        const statusResponse = await fetch(
          API_URL ? `${API_URL}/agents_v3/preview/status/?project_id=${projectId}` : `/api/agents_v3/preview/status/?project_id=${projectId}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const statusData = await statusResponse.json();
        
        if (statusData.success && (statusData.preview_url || statusData.url || statusData.local_url)) {
          const previewUrl = statusData.preview_url || statusData.url || statusData.local_url;
          console.log(`[Preview ${projectId}] ✅ Got existing preview: ${previewUrl}`);
          setCurrentPreviewUrl(previewUrl);
          setPreviewStatus('running');
        } else {
          throw new Error('Preview is starting, please wait...');
        }
        return;
      }
      
      if (data.success && (data.preview_url || data.url || data.local_url)) {
        const previewUrl = data.preview_url || data.url || data.local_url;
        console.log(`[Preview ${projectId}] ✅ Preview started: ${previewUrl}`);
        setCurrentPreviewUrl(previewUrl);
        setPreviewStatus('running');
      } else {
        throw new Error(data.error || 'Failed to start preview');
      }
      
    } catch (err) {
      console.error(`[Preview ${projectId}] Error:`, err);
      
      if (!mountedRef.current) return;
      
      // User-friendly error messages
      let errorMessage = 'Failed to start preview';
      
      if (err.message.includes('preview not available')) {
        errorMessage = 'Preview service is currently unavailable';
      } else if (err.message.includes('fetch')) {
        errorMessage = err.message;
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
      setPreviewStatus('error');
      
    } finally {
      if (mountedRef.current) {
        initializingRef.current = false;
      }
    }
  }, [projectId, previewStatus, currentPreviewUrl]);

  // Auto-start when conditions are met (with debounce)
  useEffect(() => {
    if (autoStart && status === 'completed' && previewStatus === 'idle' && projectId) {
      console.log(`[Preview ${projectId}] Auto-starting in 500ms...`);
      
      // Debounce to prevent multiple calls
      const timer = setTimeout(() => {
        if (previewStatus === 'idle') {
          startPreview();
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [autoStart, status, previewStatus, startPreview, projectId]);

  const stopPreview = useCallback(async () => {
    console.log(`[Preview ${projectId}] Stopping preview...`);
    
    setPreviewStatus('idle');
    initializingRef.current = false;
    
    if (vmRef.current) {
      vmRef.current = null;
    }
    
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    
    // Call API to stop preview
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const apiEndpoint = API_URL ? `${API_URL}/agents_v5/preview/stop/` : '/api/agents_v5/preview/stop/';
      
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ project_id: projectId })
        });
        console.log(`[Preview ${projectId}] ✅ Stop API called`);
      }
    } catch (err) {
      console.error(`[Preview ${projectId}] Stop API error:`, err);
    }
    
    setCurrentPreviewUrl(null);
    setError(null);
  }, [projectId]);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] rounded-lg overflow-hidden border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/10">
        <div className="flex items-center gap-2">
          {previewStatus === 'running' && (
            <>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-400 font-mono">Running</span>
            </>
          )}
          {previewStatus === 'starting' && (
            <>
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="text-xs text-cyan-400 font-mono">Starting...</span>
            </>
          )}
          {previewStatus === 'error' && (
            <>
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400 font-mono">Error</span>
            </>
          )}
          {previewStatus === 'idle' && (
            <>
              <Monitor className="w-4 h-4 text-white/40" />
              <span className="text-xs text-white/40 font-mono">Idle</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {previewStatus === 'running' && (
            <button
              onClick={startPreview}
              className="p-2 text-white/40 hover:text-cyan-400 rounded transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {previewStatus === 'idle' || previewStatus === 'error' ? (
            <button
              onClick={() => {
                console.log(`[Preview ${projectId}] 🔘 Start Preview button clicked!`);
                console.log(`[Preview ${projectId}] Current status: ${previewStatus}`);
                console.log(`[Preview ${projectId}] Current URL: ${currentPreviewUrl}`);
                startPreview();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
            >
              <Play className="w-4 h-4" />
              Start Preview
            </button>
          ) : previewStatus === 'running' ? (
            <button
              onClick={stopPreview}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
            >
              <X className="w-4 h-4" />
              Stop
            </button>
          ) : null}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Local Preview (Direct URL) */}
        {previewStatus === 'running' && currentPreviewUrl && (
          <iframe
            src={currentPreviewUrl}
            className="w-full h-full border-0"
            style={{ minHeight: '400px' }}
            title="Local Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        )}

        {/* Idle State */}
        {previewStatus === 'idle' && (
          <div className="flex flex-col items-center justify-center h-full text-white/50">
            <Monitor className="w-16 h-16 mb-4 text-white/20" />
            <p className="text-lg mb-2">No preview running</p>
            <p className="text-sm text-white/30">Click Start Preview to begin</p>
          </div>
        )}

        {/* Loading State */}
        {previewStatus === 'starting' && (
          <div className="flex flex-col items-center justify-center h-full text-white/50">
            <Loader2 className="w-16 h-16 mb-4 text-cyan-400 animate-spin" />
            <p className="text-lg mb-2">Starting preview...</p>
            <p className="text-sm text-white/30">Waiting for preview URL from server</p>
          </div>
        )}

        {/* Error State */}
        {previewStatus === 'error' && (
          <div className="flex flex-col items-center justify-center h-full text-white/50 px-6">
            <AlertCircle className="w-16 h-16 mb-4 text-red-400" />
            <p className="text-lg mb-2 text-red-400">Preview failed</p>
            <p className="text-sm text-white/50 max-w-md text-center mb-4">{error}</p>
            
            <button
              onClick={startPreview}
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LivePreview;
