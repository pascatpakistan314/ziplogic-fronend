/*
 * DiscoveryPanel.jsx
 * 
 * Smart discovery questionnaire shown BETWEEN prompt entry and build start.
 * 
 * Flow:
 * 1. User types prompt → clicks "START BUILD"
 * 2. Instead of starting build, we call POST /api/projects/discover/
 * 3. This component renders the questions
 * 4. User answers → clicks "Build It"
 * 5. We call POST /api/projects/enrich/ to get enriched prompt
 * 6. Then POST /api/projects/ with the enriched prompt
 * 
 * Props:
 *   prompt       - Original user prompt
 *   onComplete   - Called with (enrichedPrompt) when user finishes discovery
 *   onSkip       - Called when user clicks "Skip & Build Now" (uses raw prompt)
 *   onBack       - Called when user wants to edit their prompt
 * 
 * INTEGRATION INTO NewProject.jsx:
 * Replace the direct api.post('/projects/', { prompt }) in submit() with:
 * 
 *   // Instead of starting build immediately:
 *   setDiscoveryMode(true)
 * 
 * Then render:
 *   {discoveryMode && (
 *     <DiscoveryPanel
 *       prompt={prompt}
 *       onComplete={(enriched) => startBuild(enriched)}
 *       onSkip={() => startBuild(prompt)}
 *       onBack={() => setDiscoveryMode(false)}
 *     />
 *   )}
 */

import React, { useState, useEffect } from 'react';
import api from '../services/api';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Question Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function QuestionCard({ question, answer, onChange, index }) {
  const { id, question: text, why, type, options, category } = question;
  
  const categoryColors = {
    users: '#00ff88',
    features: '#00ddff', 
    data: '#8844ff',
    flow: '#ff6644',
    design: '#ff44aa',
    tech: '#ffaa00',
  };
  
  const color = categoryColors[category] || '#00ff88';
  
  return (
    <div className="p-5 rounded-2xl border border-white/[0.08] backdrop-blur-sm transition-all hover:border-white/[0.15]"
         style={{ background: 'rgba(255,255,255,0.02)' }}>
      
      {/* Category badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[0.6rem] font-mono tracking-[2px] uppercase px-2 py-0.5 rounded-full border"
              style={{ color, borderColor: `${color}33`, background: `${color}0D` }}>
          {category}
        </span>
        <span className="text-white/20 text-xs font-mono">Q{index + 1}</span>
      </div>
      
      {/* Question text */}
      <h3 className="text-white text-sm font-medium mb-1.5" style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1rem' }}>
        {text}
      </h3>
      
      {/* Help text */}
      {why && (
        <p className="text-white/30 text-xs mb-4" style={{ fontFamily: 'Space Mono, monospace' }}>
          {why}
        </p>
      )}
      
      {/* Input based on type */}
      {type === 'text' ? (
        <textarea
          value={answer || ''}
          onChange={(e) => onChange(id, e.target.value)}
          placeholder="Type your answer..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/[0.1] text-white placeholder:text-white/20 focus:outline-none focus:border-white/[0.25] resize-none text-sm transition-all"
          style={{ fontFamily: 'Space Mono, monospace' }}
        />
      ) : type === 'single_select' && options ? (
        <div className="space-y-2">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => onChange(id, opt)}
              className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${
                answer === opt
                  ? 'border-white/[0.3] bg-white/[0.08] text-white'
                  : 'border-white/[0.06] bg-black/20 text-white/50 hover:border-white/[0.15] hover:text-white/70'
              }`}
              style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.8rem' }}
            >
              <span className="inline-flex items-center gap-2">
                <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  answer === opt ? 'border-white/60' : 'border-white/20'
                }`}>
                  {answer === opt && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                {opt}
              </span>
            </button>
          ))}
        </div>
      ) : type === 'multi_select' && options ? (
        <div className="space-y-2">
          {options.map((opt, i) => {
            const selected = Array.isArray(answer) && answer.includes(opt);
            return (
              <button
                key={i}
                onClick={() => {
                  const current = Array.isArray(answer) ? answer : [];
                  if (selected) {
                    onChange(id, current.filter(a => a !== opt));
                  } else {
                    onChange(id, [...current, opt]);
                  }
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${
                  selected
                    ? 'border-white/[0.3] bg-white/[0.08] text-white'
                    : 'border-white/[0.06] bg-black/20 text-white/50 hover:border-white/[0.15] hover:text-white/70'
                }`}
                style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.8rem' }}
              >
                <span className="inline-flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 border ${
                    selected ? 'border-white/60 bg-white/20' : 'border-white/20'
                  }`}>
                    {selected && <span className="text-white text-[0.6rem]">✓</span>}
                  </span>
                  {opt}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main Discovery Panel
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function DiscoveryPanel({ prompt, onComplete, onSkip, onBack }) {
  const [phase, setPhase] = useState('analyzing'); // analyzing | questions | enriching
  const [analysis, setAnalysis] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [understood, setUnderstood] = useState(null);
  
  // ── Step 1: Analyze prompt ──────────────────────────────
  useEffect(() => {
    let cancelled = false;
    
    async function discover() {
      try {
        setPhase('analyzing');
        setError(null);
        
        const res = await api.post('/projects/discover/', { prompt });
        
        if (cancelled) return;
        
        if (res.data.success) {
          const discovery = res.data.discovery;
          setAnalysis(discovery);
          setQuestions(discovery.questions || []);
          setUnderstood(discovery.understood || {});
          setPhase('questions');
        } else {
          setError(res.data.message || 'Analysis failed');
        }
      } catch (e) {
        if (!cancelled) {
          console.error('Discovery error:', e);
          setError('Failed to analyze your prompt. You can skip discovery and build directly.');
        }
      }
    }
    
    discover();
    return () => { cancelled = true; };
  }, [prompt]);
  
  // ── Step 2: Handle answer changes ──────────────────────
  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };
  
  // ── Step 3: Enrich and build ───────────────────────────
  const handleBuild = async () => {
    try {
      setPhase('enriching');
      setError(null);
      
      const res = await api.post('/projects/enrich/', {
        prompt,
        analysis,
        answers
      });
      
      if (res.data.success) {
        onComplete(res.data.enriched_prompt);
      } else {
        setError(res.data.message || 'Enrichment failed');
        setPhase('questions'); // Go back to questions
      }
    } catch (e) {
      console.error('Enrichment error:', e);
      // Fallback: just use original prompt + answers
      const fallback = prompt + '\n\nAdditional details:\n' + 
        questions.map(q => `- ${q.question}: ${answers[q.id] || 'Not specified'}`).join('\n');
      onComplete(fallback);
    }
  };
  
  // ── Count answered questions ───────────────────────────
  const answeredCount = Object.keys(answers).filter(k => {
    const v = answers[k];
    if (Array.isArray(v)) return v.length > 0;
    return v && v.toString().trim().length > 0;
  }).length;
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // Analyzing phase
  if (phase === 'analyzing') {
    return (
      <div className="p-8 rounded-[20px] border border-white/[0.08] backdrop-blur-sm text-center"
           style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="w-12 h-12 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-white text-lg font-semibold mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          Analyzing your project...
        </h2>
        <p className="text-white/40 text-sm" style={{ fontFamily: 'Space Mono, monospace' }}>
          Understanding what you need so we can build it right
        </p>
      </div>
    );
  }
  
  // Enriching phase
  if (phase === 'enriching') {
    return (
      <div className="p-8 rounded-[20px] border border-white/[0.08] backdrop-blur-sm text-center"
           style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className="w-12 h-12 border-2 border-[#00ddff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-white text-lg font-semibold mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          Building your project specification...
        </h2>
        <p className="text-white/40 text-sm" style={{ fontFamily: 'Space Mono, monospace' }}>
          Turning your answers into a detailed blueprint
        </p>
      </div>
    );
  }
  
  // Questions phase
  return (
    <div className="space-y-6">
      {/* Header: What we understood */}
      <div className="p-5 rounded-[20px] border border-[rgba(0,255,136,0.15)] backdrop-blur-sm"
           style={{ background: 'rgba(0,255,136,0.03)' }}>
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">🎯</span>
          <div>
            <h2 className="text-[#00ff88] text-sm font-semibold mb-1" style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.05rem' }}>
              Here's what we understood
            </h2>
            <p className="text-white/60 text-sm leading-relaxed" style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.78rem' }}>
              {understood?.description || prompt}
            </p>
            {understood?.obvious_features?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {understood.obvious_features.map((f, i) => (
                  <span key={i} className="text-[0.65rem] px-2 py-0.5 rounded-full border border-[rgba(0,255,136,0.2)] text-[#00ff88]/70 bg-[rgba(0,255,136,0.05)]"
                        style={{ fontFamily: 'Space Mono, monospace' }}>
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Questions header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-base font-semibold" style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.1rem' }}>
            A few quick questions to nail this
          </h2>
          <p className="text-white/30 text-xs" style={{ fontFamily: 'Space Mono, monospace' }}>
            {answeredCount}/{questions.length} answered • Answer what you can, skip the rest
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-white/30 text-xs hover:text-white/60 transition-colors px-3 py-1.5 rounded-lg border border-white/[0.06] hover:border-white/[0.15]"
          style={{ fontFamily: 'Space Mono, monospace' }}
        >
          ← Edit prompt
        </button>
      </div>
      
      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/[0.06] border border-red-500/20 text-red-400 text-xs"
             style={{ fontFamily: 'Space Mono, monospace' }}>
          {error}
        </div>
      )}
      
      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            question={q}
            answer={answers[q.id]}
            onChange={handleAnswer}
            index={i}
          />
        ))}
      </div>
      
      {/* Action buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onSkip}
          className="text-white/30 text-xs hover:text-white/50 transition-colors"
          style={{ fontFamily: 'Space Mono, monospace' }}
        >
          Skip discovery → build with original prompt
        </button>
        
        <button
          onClick={handleBuild}
          disabled={answeredCount === 0}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-[0.8rem] font-bold tracking-[1px] border-none cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            background: answeredCount > 0 ? 'linear-gradient(135deg,#00ff88,#00cc66)' : 'rgba(255,255,255,0.1)',
            color: answeredCount > 0 ? '#000' : 'rgba(255,255,255,0.3)',
            boxShadow: answeredCount > 0 ? '0 0 30px rgba(0,255,136,0.3)' : 'none'
          }}
        >
          ⚡ BUILD IT ({answeredCount}/{questions.length} answered)
        </button>
      </div>
    </div>
  );
}