import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Sparkles, 
  ArrowRight, 
  Loader2,
  Code,
  Database,
  Layers,
  Rocket
} from 'lucide-react';
import api from '../services/api';

export default function NewProjectV2() {
  const navigate = useNavigate();
  
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');
  const [error, setError] = useState('');
  
  // Example prompts
  const examples = [
    "Create an e-commerce website for selling electronics with products, cart, and checkout",
    "Build a task management app like Notion with projects, tasks, and team collaboration",
    "Make a social media platform with user profiles, posts, comments, and likes",
    "Create a restaurant booking system with menu, reservations, and online ordering",
    "Build an AI chatbot interface similar to ChatGPT with chat history",
    "Make a real estate listing website with property search and filters",
    "Create a blog platform with articles, authors, and comments",
    "Build a fitness tracking app with workouts, progress charts, and goals"
  ];
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a project description');
      return;
    }
    
    setGenerating(true);
    setError('');
    setProgress(0);
    setCurrentPhase('Initializing...');
    
    try {
      // Call V3 API with live preview
      const response = await api.post('/api/agents/v3/generate/', {
        prompt: prompt
      });
      
      if (response.data.success) {
        // Redirect to live preview
        const projectId = response.data.project_id;
        navigate(`/preview/${projectId}`);
      } else {
        setError(response.data.error || 'Generation failed');
      }
      
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.response?.data?.error || 'Failed to generate application');
    } finally {
      setGenerating(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-6 animate-pulse">
            <Zap className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Create Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient-x">
              Dream App
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Describe your idea in plain English. AI will generate a complete, 
            production-ready application with live preview.
          </p>
        </div>
        
        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              What do you want to build?
            </label>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Create an e-commerce website for selling handmade jewelry with product catalog, shopping cart, checkout, and admin panel"
              className="w-full h-40 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition resize-none text-gray-900"
              disabled={generating}
            />
            
            <div className="mt-2 text-sm text-gray-500">
              Be specific! Include features, user roles, and any special requirements.
            </div>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {error}
            </div>
          )}
          
          {generating && (
            <div className="mb-6 p-6 bg-indigo-50 border border-indigo-200 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                  <span className="text-indigo-900 font-medium">{currentPhase}</span>
                </div>
                <span className="text-indigo-600 font-semibold">{progress}%</span>
              </div>
              
              <div className="w-full bg-indigo-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className={`flex items-center space-x-2 text-sm ${progress >= 30 ? 'text-indigo-600' : 'text-gray-400'}`}>
                  <Sparkles className="w-4 h-4" />
                  <span>Planning</span>
                </div>
                <div className={`flex items-center space-x-2 text-sm ${progress >= 70 ? 'text-indigo-600' : 'text-gray-400'}`}>
                  <Code className="w-4 h-4" />
                  <span>Generating Code</span>
                </div>
                <div className={`flex items-center space-x-2 text-sm ${progress >= 95 ? 'text-indigo-600' : 'text-gray-400'}`}>
                  <Layers className="w-4 h-4" />
                  <span>Starting Preview</span>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center space-x-3 transition ${
              generating || !prompt.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {generating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Generating Your App...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                <span>Generate App</span>
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
        
        {/* Examples */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Not sure what to build? Try these:
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {examples.map((example, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(example)}
                disabled={generating}
                className="text-left p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="text-sm text-gray-700">{example}</p>
              </button>
            ))}
          </div>
        </div>
        
        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center group hover:transform hover:scale-105 transition">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl mb-4 group-hover:shadow-lg transition">
              <Sparkles className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">AI-Powered</h3>
            <p className="text-sm text-gray-600">
              GPT-4o generates professional, production-ready code
            </p>
          </div>
          
          <div className="text-center group hover:transform hover:scale-105 transition">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl mb-4 group-hover:shadow-lg transition">
              <Rocket className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Live Preview</h3>
            <p className="text-sm text-gray-600">
              See your app running instantly with hot reload
            </p>
          </div>
          
          <div className="text-center group hover:transform hover:scale-105 transition">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl mb-4 group-hover:shadow-lg transition">
              <Database className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Full Stack</h3>
            <p className="text-sm text-gray-600">
              Frontend, backend, database - everything configured
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
