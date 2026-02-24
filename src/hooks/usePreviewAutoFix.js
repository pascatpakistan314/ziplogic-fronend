// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PREVIEW SELF-HEALING HOOK
// Add this to your NewProject.jsx component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// HOW TO USE:
// 1. Import: import { usePreviewAutoFix } from './hooks/usePreviewAutoFix';
// 2. Inside your component:
//    const { iframeRef, isFixing, fixCount } = usePreviewAutoFix(project?.id, previewUrl);
// 3. Add ref to iframe:
//    <iframe ref={iframeRef} src={previewUrl} ... />
// 4. Optionally show fixing status:
//    {isFixing && <span>🔧 AI is fixing an error...</span>}

import { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance from '../services/axiosInstance'; // adjust import path

export function usePreviewAutoFix(projectId, previewUrl) {
  const iframeRef = useRef(null);
  const [isFixing, setIsFixing] = useState(false);
  const [fixCount, setFixCount] = useState(0);
  const [fixStatus, setFixStatus] = useState(''); // 'fixing', 'fixed', 'failed', ''
  const fixingRef = useRef(false);
  const MAX_AUTO_FIXES = 10;

  const triggerFix = useCallback(async (errorData) => {
    if (fixingRef.current || fixCount >= MAX_AUTO_FIXES || !projectId) return;

    fixingRef.current = true;
    setIsFixing(true);
    setFixStatus('fixing');

    try {
      console.log(`🤖 AI Fix attempt ${fixCount + 1}/${MAX_AUTO_FIXES}:`, errorData.message);

      // Use new browser-errors/fix endpoint
      const response = await axiosInstance.post('/api/agents_v3/preview/browser-errors/fix/', {
        project_id: projectId,
        error_message: errorData.message || 'Unknown error',
        error_file: errorData.file || errorData.source || '',
        error_stack: errorData.stack || errorData.componentStack || '',
        page_url: errorData.pageUrl || window.location.pathname,
      });

      if (response.data.success) {
        console.log('✅ AI Fix applied!');
        setFixCount(prev => prev + 1);
        setFixStatus('fixed');

        // Reload iframe after agent fixes files
        setTimeout(() => {
          if (iframeRef.current) {
            iframeRef.current.src = iframeRef.current.src;
          }
          setFixStatus('');
        }, 2000);
      } else {
        console.warn('❌ AI Fix failed:', response.data.message);
        setFixStatus('failed');
        setTimeout(() => setFixStatus(''), 3000);
      }
    } catch (err) {
      console.error('AI Fix API error:', err);
      setFixStatus('failed');
      setTimeout(() => setFixStatus(''), 3000);
    } finally {
      fixingRef.current = false;
      setIsFixing(false);
    }
  }, [projectId, fixCount]);

  useEffect(() => {
    const handleMessage = (event) => {
      // Handle auto-fix from "Ask AI to Fix" button in preview
      if (event.data?.type === 'ZIPLOGIC_REQUEST_FIX') {
        triggerFix(event.data.error);
      }
      // NOTE: We do NOT auto-trigger on ZIPLOGIC_PREVIEW_ERROR
      // because Level 1 (auto-stubs) handles most errors.
      // Only trigger when user clicks "Ask AI to Fix" button.
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [triggerFix]);

  // Reset fix count when project changes
  useEffect(() => {
    setFixCount(0);
    fixingRef.current = false;
  }, [projectId]);

  return { iframeRef, isFixing, fixCount, fixStatus, triggerFix };
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ALTERNATIVE: Inline version (paste directly in NewProject.jsx)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Add these state variables in your component:
//
//   const iframeRef = useRef(null);
//   const [isFixing, setIsFixing] = useState(false);
//   const fixCountRef = useRef(0);
//
// Add this useEffect:
//
//   useEffect(() => {
//     const handler = async (event) => {
//       if (event.data?.type === 'ZIPLOGIC_REQUEST_FIX' && !isFixing && fixCountRef.current < 5) {
//         setIsFixing(true);
//         fixCountRef.current += 1;
//         try {
//           const res = await axiosInstance.post(`/api/preview/fix/${project.id}/`, {
//             error: event.data.error?.message || 'Unknown',
//             component_stack: event.data.error?.componentStack || '',
//           });
//           if (res.data.success) {
//             setTimeout(() => {
//               if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
//             }, 500);
//           }
//         } catch (e) { console.error('Fix failed:', e); }
//         finally { setIsFixing(false); }
//       }
//     };
//     window.addEventListener('message', handler);
//     return () => window.removeEventListener('message', handler);
//   }, [isFixing, project?.id]);
//
// Add ref to your iframe:
//   <iframe ref={iframeRef} src={previewUrl} ... />
//
// Show status:
//   {isFixing && <div className="text-yellow-400 text-sm">🔧 AI is fixing...</div>}