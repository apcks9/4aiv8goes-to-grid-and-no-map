'use client';

// Privacy Mode - No history or memories saved
import { useState, useRef } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { useRouter } from 'next/navigation';
import ResponseRenderer from '../../components/ResponseRenderer';

export default function PrivacyMode() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [aiInput, setAiInput] = useState('');
  const [aiResponses, setAiResponses] = useState({
    claude: '',
    chatgpt: '',
    grok: '',
    perplexity: ''
  });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const [apiKeys, setApiKeys] = useState({
    claude: process.env.NEXT_PUBLIC_CLAUDE_API_KEY || '',
    chatgpt: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    grok: process.env.NEXT_PUBLIC_GROK_API_KEY || '',
    perplexity: process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY || ''
  });

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const queryText = aiInput;

    setAiInput('');
    setLoading(true);

    // Focus input after submission
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    setAiResponses({
      claude: 'Loading...',
      chatgpt: 'Loading...',
      grok: 'Loading...',
      perplexity: 'Loading...'
    });

    const CLAUDE_API_KEY = apiKeys.claude;
    const OPENAI_API_KEY = apiKeys.chatgpt;
    const GROK_API_KEY = apiKeys.grok;
    const PERPLEXITY_API_KEY = apiKeys.perplexity;

    try {
      // Call Claude API (no history in privacy mode)
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/claude`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: queryText,
          apiKey: CLAUDE_API_KEY
        })
      })
        .then(async (res) => {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return res.json();
          } else {
            const text = await res.text();
            throw new Error('Backend returned HTML instead of JSON. The backend may be starting up (Render free tier cold start). Please wait 30 seconds and try again.');
          }
        })
        .then(data => {
          const response = data.error
            ? `Error: ${data.error.message || JSON.stringify(data.error)}`
            : data.content?.[0]?.text || 'Error: Unable to get response';
          setAiResponses(prev => ({ ...prev, claude: response }));
        })
        .catch(err => {
          const errorMsg = `Error: ${err.message}`;
          setAiResponses(prev => ({ ...prev, claude: errorMsg }));
        });

      // Call OpenAI API (no history in privacy mode)
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-5',
          messages: [{ role: 'user', content: queryText }]
        })
      })
        .then(res => res.json())
        .then(data => {
          const response = data.error
            ? `Error: ${data.error.message || JSON.stringify(data.error)}`
            : data.choices?.[0]?.message?.content || 'Error: Unable to get response';
          setAiResponses(prev => ({ ...prev, chatgpt: response }));
        })
        .catch(err => {
          const errorMsg = `Error: ${err.message}`;
          setAiResponses(prev => ({ ...prev, chatgpt: errorMsg }));
        });

      // Call Grok API (no history in privacy mode)
      fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'grok-4',
          messages: [{ role: 'user', content: queryText }]
        })
      })
        .then(res => res.json())
        .then(data => {
          const response = data.error
            ? `Error: ${data.error.message || JSON.stringify(data.error)}`
            : data.choices?.[0]?.message?.content || 'Error: Unable to get response';
          setAiResponses(prev => ({ ...prev, grok: response }));
        })
        .catch(err => {
          const errorMsg = `Error: ${err.message}`;
          setAiResponses(prev => ({ ...prev, grok: errorMsg }));
        });

      // Call Perplexity API (no history in privacy mode)
      fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [{ role: 'user', content: queryText }]
        })
      })
        .then(res => res.json())
        .then(data => {
          const response = data.error
            ? `Error: ${data.error.message || JSON.stringify(data.error)}`
            : data.choices?.[0]?.message?.content || 'Error: Unable to get response';
          setAiResponses(prev => ({ ...prev, perplexity: response }));
        })
        .catch(err => {
          const errorMsg = `Error: ${err.message}`;
          setAiResponses(prev => ({ ...prev, perplexity: errorMsg }));
        });

    } catch (error) {
      console.error('AI API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gray-100'}`}>
      {/* Minimal top bar */}
      <nav className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="w-full px-4">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center cursor-pointer" onClick={() => router.push('/dashboard')}>
              <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Privacy Mode 🔒</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className={`px-3 py-1 text-sm ${darkMode ? 'bg-gray-500 hover:bg-gray-600' : 'bg-gray-700 hover:bg-gray-800'} text-white rounded transition-all`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`px-3 py-1 text-sm ${darkMode ? 'bg-gray-500 hover:bg-gray-600' : 'bg-gray-700 hover:bg-gray-800'} text-white rounded transition-all`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content area */}
      <div className="w-full px-2 py-2">
        {/* Privacy Mode Notice */}
        <div className={`mb-2 px-3 py-2 rounded ${darkMode ? 'bg-purple-900/30 border border-purple-700' : 'bg-purple-100 border border-purple-300'}`}>
          <p className={`text-xs ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>
            🔒 <strong>Privacy Mode:</strong> No conversation history or memories are saved. Each query is independent.
          </p>
        </div>

        {/* Input bar */}
        <form onSubmit={handleAiSubmit} className="mb-2">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Ask a question (no history saved)..."
              className={`flex-1 px-3 py-1 text-sm border ${darkMode ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'} rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all`}
            />
            <button
              type="submit"
              disabled={loading || !aiInput.trim()}
              className="px-4 py-1 text-sm bg-purple-600 text-white rounded font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Submit'}
            </button>
          </div>
        </form>

        {/* 2x2 Grid Layout - Full screen */}
        <div className="grid grid-cols-2 grid-rows-2 gap-1 h-[calc(100vh-130px)]">
          {/* Claude Response - Top Left */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-lg p-1 border flex flex-col overflow-hidden`}>
            <h4 className={`text-xs font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mb-0 px-1 flex-shrink-0`}>
              <span className="text-sm">🤖</span> Claude
            </h4>
            <div className={`ai-response ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-xs overflow-y-auto px-1 flex-1 min-h-0`}>
              <ResponseRenderer response={aiResponses.claude} darkMode={darkMode} />
            </div>
          </div>

          {/* ChatGPT Response - Top Right */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-lg p-1 border flex flex-col overflow-hidden`}>
            <h4 className={`text-xs font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'} mb-0 px-1 flex-shrink-0`}>
              <span className="text-sm">💬</span> ChatGPT
            </h4>
            <div className={`ai-response ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-xs overflow-y-auto px-1 flex-1 min-h-0`}>
              <ResponseRenderer response={aiResponses.chatgpt} darkMode={darkMode} />
            </div>
          </div>

          {/* Grok Response - Bottom Left */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-lg p-1 border flex flex-col overflow-hidden`}>
            <h4 className={`text-xs font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-600'} mb-0 px-1 flex-shrink-0`}>
              <span className="text-sm">⚡</span> Grok
            </h4>
            <div className={`ai-response ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-xs overflow-y-auto px-1 flex-1 min-h-0`}>
              <ResponseRenderer response={aiResponses.grok} darkMode={darkMode} />
            </div>
          </div>

          {/* Perplexity Response - Bottom Right */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-lg p-1 border flex flex-col overflow-hidden`}>
            <h4 className={`text-xs font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-600'} mb-0 px-1 flex-shrink-0`}>
              <span className="text-sm">🔍</span> Perplexity
            </h4>
            <div className={`ai-response ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-xs overflow-y-auto px-1 flex-1 min-h-0`}>
              <ResponseRenderer response={aiResponses.perplexity} darkMode={darkMode} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
