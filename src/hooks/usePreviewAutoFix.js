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
  const fixingRef = useRef(false); // avoid stale closure
  const MAX_AUTO_FIXES = 5;

  const triggerFix = useCallback(async (errorData) => {
    if (fixingRef.current || fixCount >= MAX_AUTO_FIXES || !projectId) return;

    fixingRef.current = true;
    setIsFixing(true);

    try {
      console.log(`🔧 Auto-fix attempt ${fixCount + 1}/${MAX_AUTO_FIXES}:`, errorData.message);

      const response = await axiosInstance.post(`/api/preview/fix/${projectId}/`, {
        error: errorData.message || 'Unknown error',
        component_stack: errorData.componentStack || '',
        stack: errorData.stack || '',
      });

      if (response.data.success) {
        console.log('✅ Fix applied:', response.data.message);
        setFixCount(prev => prev + 1);

        // Reload iframe after a short delay to let backend regenerate
        setTimeout(() => {
          if (iframeRef.current) {
            iframeRef.current.src = iframeRef.current.src;
          }
        }, 500);
      } else {
        console.warn('❌ Fix failed:', response.data.message);
      }
    } catch (err) {
      console.error('Fix API error:', err);
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

  return { iframeRef, isFixing, fixCount, triggerFix };
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
