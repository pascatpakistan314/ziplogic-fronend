/**
 * LivePreview v2.1 - WITH CRITICAL FIX
 * 
 * CRITICAL FIX: After server starts, we now:
 * 1. Make an HTTP request to http://localhost:port
 * 2. This forces the app to render and execute
 * 3. Runtime errors appear in logs
 * 4. AI fixer can then catch and fix them
 * 
 * This was the missing piece - compilation succeeds,
 * but runtime errors only appear when code EXECUTES.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Square,
  RefreshCw,
  ExternalLink,
  Loader2,
  Terminal,
  Zap,
  AlertCircle,
  CheckCircle,
  Monitor,
  Copy,
  Check
} from 'lucide-react';
import api from '../services/api';

const LivePreview = ({
  projectId,
  files = {},
  techStack = {},
  status = 'idle',
  onStatusChange,
  autoStart = true
}) => {
  // State
  const [previewStatus, setPreviewStatus] = useState('idle');
  const [localUrl, setLocalUrl] = useState(null);
  const [tunnelUrl, setTunnelUrl] = useState(null);
  const [port, setPort] = useState(null);
  const [error, setError] = useState(null);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [showConsole, setShowConsole] = useState(true);
  const [fixCount, setFixCount] = useState(0);
  const [isFixing, setIsFixing] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Refs
  const iframeRef = useRef(null);
  const logPollingRef = useRef(null);
  const maxFixes = 5;
  const pollIntervalMs = 1000;

  // ──────────────────────────────────────────────────────────────
  // Log Management
  // ──────────────────────────────────────────────────────────────

  const addLog = (type, text) => {
    setConsoleLogs((prev) => [...prev.slice(-200), { type, text, time: new Date().toLocaleTimeString() }]);
  };

  const clearLogs = () => {
    setConsoleLogs([]);
  };

  // ──────────────────────────────────────────────────────────────
  // CRITICAL FIX: Make Initial Request to Trigger Runtime Errors
  // ──────────────────────────────────────────────────────────────

  const makeInitialRequest = useCallback(async (url) => {
    /**
     * This is the critical missing piece!
     * 
     * Compilation errors are caught during build.
     * But runtime errors (like "useState is not defined") only appear
     * when the code actually EXECUTES and RENDERS.
     * 
     * So we must make a request to the localhost URL to force:
     * 1. The server to render the initial page
     * 2. React/Next.js to execute the component code
     * 3. Runtime errors to appear in logs
     */
    
    addLog('info', 'Making initial request to trigger runtime errors...');
    
    try {
      // Make a request with a short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        // Don't follow redirects for error capture
        redirect: 'manual'
      });
      
      clearTimeout(timeoutId);
      
      // Log the response
      addLog('info', `Response status: ${response.status}`);
      
      if (response.status >= 400) {
        // Server error
        const text = await response.text();
        addLog('error', `Server error: ${response.status}`);
        
        // Check for errors in response body
        if (text.includes('error') || text.includes('Error') || text.includes('ERROR')) {
          const lines = text.split('\n');
          for (const line of lines) {
            if (line.toLowerCase().includes('error') && line.length < 500) {
              addLog('error', line.substring(0, 200));
              break;
            }
          }
        }
      } else if (response.status === 0) {
        // Network error or timeout
        addLog('warning', 'Connection refused - server may not be responding');
      } else {
        // Success
        addLog('success', 'Server responding successfully');
      }
      
    } catch (err) {
      if (err.name === 'AbortError') {
        addLog('warning', 'Request timeout - server may still be loading');
      } else if (err.message.includes('Failed to fetch')) {
        addLog('warning', 'Connection refused - server may be loading or crashed');
      } else {
        addLog('warning', `Request error: ${err.message}`);
      }
    }
  }, []);

  // ──────────────────────────────────────────────────────────────
  // Start Preview
  // ──────────────────────────────────────────────────────────────

  const startPreview = useCallback(async () => {
    if (!projectId) return;

    // Reset state
    setError(null);
    setIframeLoaded(false);
    setLocalUrl(null);
    setTunnelUrl(null);
    setPort(null);
    clearLogs();
    setFixCount(0);
    setIsFixing(false);

    setPreviewStatus('starting');
    addLog('info', 'Starting preview...');

    try {
      // Step 1: Start dev server
      addLog('info', 'Starting dev server...');

      const startResponse = await api.post('/api/agents_v3/preview/start/', {
        project_id: projectId,
      });

      if (!startResponse.data.success) {
        throw new Error(startResponse.data.error || 'Failed to start preview');
      }

      const detectedPort = startResponse.data.port;
      const url = startResponse.data.url;

      setPort(detectedPort);
      setLocalUrl(url);

      addLog('success', `Dev server running on ${url}`);
      
      // ===== CRITICAL FIX =====
      // Make the initial request BEFORE polling logs
      // This ensures runtime errors appear in the logs we're about to monitor
      await makeInitialRequest(url);
      // ===== END CRITICAL FIX =====
      
      setPreviewStatus('running');

      // Step 2: Start monitoring logs
      startLogPolling();

    } catch (err) {
      console.error('Preview start error:', err);
      addLog('error', err.message || 'Failed to start preview');
      setError(err.message);
      setPreviewStatus('error');
    }
  }, [projectId, makeInitialRequest]);

  // ──────────────────────────────────────────────────────────────
  // Log Polling
  // ──────────────────────────────────────────────────────────────

  const startLogPolling = useCallback(() => {
    if (logPollingRef.current) {
      clearInterval(logPollingRef.current);
    }

    const poll = async () => {
      try {
        const response = await api.get('/api/agents_v3/preview/logs/', {
          params: { project_id: projectId }
        });

        if (response.data.success && response.data.logs) {
          response.data.logs.forEach((log) => {
            if (!consoleLogs.some((l) => l.text === log.message)) {
              addLog(log.type, log.message);

              // If error detected and not already fixing, trigger AI fixer
              if (
                log.type === 'error' &&
                previewStatus === 'running' &&
                !isFixing &&
                fixCount < maxFixes
              ) {
                handleErrorDetected(log.message);
              }
            }
          });

          if (response.data.status === 'error' && previewStatus === 'running') {
            setError('Dev server encountered an error');
            setPreviewStatus('error');
          }
        }

        if (!response.data.is_healthy && previewStatus !== 'idle') {
          addLog('error', 'Dev server stopped unexpectedly');
          setPreviewStatus('error');
          stopLogPolling();
        }
      } catch (err) {
        console.error('Log poll error:', err);
        if (err.response?.status === 404 || err.response?.status === 400) {
          stopLogPolling();
        }
      }
    };

    poll();
    logPollingRef.current = setInterval(poll, pollIntervalMs);
  }, [projectId, previewStatus, isFixing, fixCount, consoleLogs]);

  const stopLogPolling = () => {
    if (logPollingRef.current) {
      clearInterval(logPollingRef.current);
      logPollingRef.current = null;
    }
  };

  // ──────────────────────────────────────────────────────────────
  // Error Handling & AI Fixer
  // ──────────────────────────────────────────────────────────────

  const handleErrorDetected = async (errorMsg) => {
    if (isFixing || fixCount >= maxFixes) return;

    setIsFixing(true);
    setFixCount((prev) => prev + 1);
    setPreviewStatus('fixing');

    addLog('info', `Analyzing error (fix ${fixCount + 1}/${maxFixes})...`);

    try {
      const response = await api.post('/api/agents_v3/preview/fix/', {
        project_id: projectId,
        error: errorMsg,
      });

      if (response.data.success) {
        const fixedCount = Object.keys(response.data.fixed_files || {}).length;
        addLog('success', `Applied ${fixedCount} fix(es), waiting for recompile...`);
        
        await new Promise((r) => setTimeout(r, 2000));
        
        setPreviewStatus('running');
      } else {
        addLog('error', `Fix failed: ${response.data.error || 'Unknown error'}`);
        setPreviewStatus('running');
      }
    } catch (err) {
      console.error('Fix error:', err);
      
      if (err.response?.status === 429) {
        addLog('error', 'Fix limit reached - upgrade your plan');
      } else {
        addLog('error', `Fix error: ${err.message}`);
      }
      
      setPreviewStatus('running');
    } finally {
      setIsFixing(false);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // Expose via Tunnel
  // ──────────────────────────────────────────────────────────────

  const exposeViaTunnel = async () => {
    if (!projectId || !port) return;

    addLog('info', 'Creating Cloudflare tunnel...');

    try {
      const response = await api.get('/api/agents_v3/preview/tunnel/', {
        params: { project_id: projectId }
      });

      if (response.data.success) {
        const tunnel = response.data.tunnel_url;
        setTunnelUrl(tunnel);
        setPreviewStatus('complete');
        addLog('success', `Preview exposed: ${tunnel}`);
      } else {
        addLog('error', `Tunnel failed: ${response.data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Tunnel error:', err);
      addLog('error', `Tunnel error: ${err.message}`);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // Stop Preview
  // ──────────────────────────────────────────────────────────────

  const stopPreview = async () => {
    if (!projectId) return;

    stopLogPolling();
    setPreviewStatus('idle');

    try {
      await api.post('/api/agents_v3/preview/stop/', {
        project_id: projectId,
      });

      addLog('info', 'Preview stopped');
    } catch (err) {
      console.error('Stop error:', err);
      addLog('error', `Stop error: ${err.message}`);
    } finally {
      setLocalUrl(null);
      setTunnelUrl(null);
      setPort(null);
      setError(null);
      setFixCount(0);
      setIsFixing(false);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // Copy to Clipboard
  // ──────────────────────────────────────────────────────────────

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ──────────────────────────────────────────────────────────────
  // Effects
  // ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (autoStart && status === 'completed' && projectId && previewStatus === 'idle') {
      startPreview();
    }
  }, [status, projectId, previewStatus, autoStart, startPreview]);

  useEffect(() => {
    return () => {
      stopLogPolling();
      if (previewStatus !== 'idle') {
        stopPreview().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    onStatusChange?.(previewStatus, localUrl || tunnelUrl);
  }, [previewStatus, localUrl, tunnelUrl, onStatusChange]);

  // ──────────────────────────────────────────────────────────────
  // AI Fix Button — Send error to Universal Agent
  // ──────────────────────────────────────────────────────────────
  const [aiFixing, setAiFixing] = useState(false);
  const [aiFixStatus, setAiFixStatus] = useState(''); // 'fixing', 'fixed', 'failed'

  const handleAiFix = async () => {
    // Find the latest error from console logs
    const errorLogs = consoleLogs.filter(l => l.type === 'error');
    if (errorLogs.length === 0) return;
    
    const latestError = errorLogs[errorLogs.length - 1]?.text || 'Unknown error';
    
    setAiFixing(true);
    setAiFixStatus('fixing');
    addLog('info', '🤖 AI Fix triggered — Universal Agent is working...');
    
    try {
      const response = await api.post('/api/agents_v3/preview/browser-errors/fix/', {
        project_id: projectId,
        error_message: latestError,
        error_file: '',
        error_stack: errorLogs.map(l => l.text).join('\n'),
        page_url: displayUrl || ''
      });
      
      if (response.data.success) {
        setAiFixStatus('fixed');
        addLog('success', '✅ AI Fix applied! Reloading preview...');
        
        // Reload iframe after fix
        setTimeout(() => {
          if (iframeRef.current) {
            iframeRef.current.src = iframeRef.current.src;
          }
          setAiFixStatus('');
        }, 3000);
      } else {
        setAiFixStatus('failed');
        addLog('error', `❌ AI Fix failed: ${response.data.message || 'Unknown'}`);
        setTimeout(() => setAiFixStatus(''), 3000);
      }
    } catch (err) {
      setAiFixStatus('failed');
      addLog('error', `❌ AI Fix error: ${err.message}`);
      setTimeout(() => setAiFixStatus(''), 3000);
    } finally {
      setAiFixing(false);
    }
  };

  const hasErrors = consoleLogs.some(l => l.type === 'error');

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════

  const displayUrl = tunnelUrl || localUrl;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] rounded-lg overflow-hidden border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/10">
        <div className="flex items-center gap-4">
          {/* Status Indicator */}
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
            {previewStatus === 'fixing' && (
              <>
                <Zap className="w-4 h-4 text-purple-400 animate-pulse" />
                <span className="text-xs text-purple-400 font-mono">
                  AI Fixing ({fixCount}/{maxFixes})
                </span>
              </>
            )}
            {previewStatus === 'complete' && (
              <>
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400 font-mono">Complete</span>
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

          {/* URL Display */}
          {displayUrl && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded border border-white/10">
              <code className="text-xs text-cyan-400 font-mono">{displayUrl}</code>
              <button
                onClick={() => copyToClipboard(displayUrl)}
                className="text-white/40 hover:text-white transition-colors"
                title="Copy URL"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Console toggle */}
          <button
            onClick={() => setShowConsole(!showConsole)}
            className={`p-2 rounded transition-colors ${
              showConsole ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
            }`}
            title="Toggle console"
          >
            <Terminal className="w-4 h-4" />
          </button>

          {/* Open external */}
          {displayUrl && (
            <a
              href={displayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-white/40 hover:text-cyan-400 rounded transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {/* Start/Stop button */}
          {previewStatus === 'idle' || previewStatus === 'error' ? (
            <button
              onClick={startPreview}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
            >
              <Play className="w-4 h-4" />
              Start Preview
            </button>
          ) : (
            <button
              onClick={stopPreview}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          )}

          {/* Expose via tunnel */}
          {previewStatus === 'running' && fixCount === 0 && !tunnelUrl && (
            <button
              onClick={exposeViaTunnel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded transition-colors"
            >
              <Zap className="w-4 h-4" />
              Expose
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden gap-4 p-4">
        {/* Preview Iframe */}
        <div className={`bg-white rounded-lg overflow-hidden ${showConsole ? 'flex-1' : 'w-full'}`}>
          {displayUrl ? (
            <div className="relative w-full h-full">
              {!iframeLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={displayUrl}
                className="w-full h-full border-0"
                title="Preview"
                onLoad={() => setIframeLoaded(true)}
              />
              
              {/* AI Fix Button — shows when errors are detected */}
              {hasErrors && previewStatus === 'running' && (
                <div className="absolute bottom-4 right-4 z-20">
                  {aiFixStatus === 'fixing' ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-medium">🤖 Agent fixing...</span>
                    </div>
                  ) : aiFixStatus === 'fixed' ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">✅ Fixed! Reloading...</span>
                    </div>
                  ) : aiFixStatus === 'failed' ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">❌ Could not fix</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleAiFix}
                      disabled={aiFixing}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white rounded-lg shadow-lg transition-all hover:scale-105"
                    >
                      <Zap className="w-4 h-4" />
                      <span className="text-sm font-medium">🤖 AI Fix Error</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white/50 bg-gray-900">
              {previewStatus === 'idle' ? (
                <>
                  <Monitor className="w-16 h-16 mb-4 text-white/20" />
                  <p className="text-lg mb-2">No preview running</p>
                  <p className="text-sm text-white/30">Click Start Preview to begin</p>
                </>
              ) : previewStatus === 'starting' ? (
                <>
                  <Loader2 className="w-16 h-16 mb-4 text-cyan-400 animate-spin" />
                  <p className="text-lg mb-2">Starting preview...</p>
                  <p className="text-sm text-white/30">This may take a moment</p>
                </>
              ) : previewStatus === 'error' ? (
                <>
                  <AlertCircle className="w-16 h-16 mb-4 text-red-400" />
                  <p className="text-lg mb-2 text-red-400">Preview failed</p>
                  <p className="text-sm text-white/50 max-w-md text-center">{error}</p>
                </>
              ) : null}
            </div>
          )}
        </div>

        {/* Console Panel */}
        {showConsole && (
          <div className="w-96 flex flex-col bg-black rounded-lg border border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 text-xs font-mono text-white/60 flex items-center justify-between">
              <span>Dev Server Console</span>
              <div className="flex items-center gap-2">
                {hasErrors && (
                  <button
                    onClick={handleAiFix}
                    disabled={aiFixing}
                    className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors disabled:opacity-50"
                  >
                    {aiFixing ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Fixing...</>
                    ) : (
                      <><Zap className="w-3 h-3" /> AI Fix</>
                    )}
                  </button>
                )}
                <button
                  onClick={clearLogs}
                  className="text-white/40 hover:text-white text-xs"
                  title="Clear logs"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-3 font-mono text-xs space-y-1">
              {consoleLogs.length === 0 ? (
                <div className="text-white/20">Waiting for output...</div>
              ) : (
                consoleLogs.map((log, i) => (
                  <div
                    key={i}
                    className={`${
                      log.type === 'error'
                        ? 'text-red-400'
                        : log.type === 'success'
                        ? 'text-green-400'
                        : log.type === 'warning'
                        ? 'text-yellow-400'
                        : log.type === 'info'
                        ? 'text-cyan-400'
                        : 'text-white/60'
                    }`}
                  >
                    <span className="text-white/30">[{log.time}]</span> {log.text}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LivePreview;