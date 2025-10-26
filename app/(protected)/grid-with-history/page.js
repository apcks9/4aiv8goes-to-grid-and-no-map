'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { useRouter } from 'next/navigation';
import ResponseRenderer from '../../components/ResponseRenderer';

export default function GridWithHistory() {
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
  const [apiKeys, setApiKeys] = useState({
    claude: process.env.NEXT_PUBLIC_CLAUDE_API_KEY || '',
    chatgpt: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    grok: process.env.NEXT_PUBLIC_GROK_API_KEY || '',
    perplexity: process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY || ''
  });
  const [queryHistory, setQueryHistory] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('gridOnlyHistory');
    if (savedHistory) {
      try {
        setQueryHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }
  }, []);

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const currentQuery = aiInput;
    const timestamp = new Date().toLocaleString();
    const historyId = Date.now();
    const queryText = aiInput;

    setAiInput('');
    setLoading(true);

    setAiResponses({
      claude: 'Loading...',
      chatgpt: 'Loading...',
      grok: 'Loading...',
      perplexity: 'Loading...'
    });

    // Create initial history entry
    const newHistoryItem = {
      id: historyId,
      query: currentQuery,
      timestamp,
      responses: {
        claude: '',
        chatgpt: '',
        grok: '',
        perplexity: ''
      }
    };
    setQueryHistory(prev => [newHistoryItem, ...prev]);

    const CLAUDE_API_KEY = apiKeys.claude;
    const OPENAI_API_KEY = apiKeys.chatgpt;
    const GROK_API_KEY = apiKeys.grok;
    const PERPLEXITY_API_KEY = apiKeys.perplexity;

    try {
      // Call Claude API through backend
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

          // Update history with Claude response
          setQueryHistory(prev => prev.map(item =>
            item.id === historyId
              ? { ...item, responses: { ...item.responses, claude: response } }
              : item
          ));
        })
        .catch(err => {
          const errorMsg = `Error: ${err.message}`;
          setAiResponses(prev => ({ ...prev, claude: errorMsg }));
          setQueryHistory(prev => prev.map(item =>
            item.id === historyId
              ? { ...item, responses: { ...item.responses, claude: errorMsg } }
              : item
          ));
        });

      // Call OpenAI API directly
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
            : data.choices?.[0]?.message?.content || 'Error: Unable to get response';
          setAiResponses(prev => ({ ...prev, chatgpt: response }));

          // Update history with ChatGPT response
          setQueryHistory(prev => prev.map(item =>
            item.id === historyId
              ? { ...item, responses: { ...item.responses, chatgpt: response } }
              : item
          ));
        })
        .catch(err => {
          const errorMsg = `Error: ${err.message}`;
          setAiResponses(prev => ({ ...prev, chatgpt: errorMsg }));
          setQueryHistory(prev => prev.map(item =>
            item.id === historyId
              ? { ...item, responses: { ...item.responses, chatgpt: errorMsg } }
              : item
          ));
        });

      // Call Grok API directly
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
            : data.choices?.[0]?.message?.content || 'Error: Unable to get response';
          setAiResponses(prev => ({ ...prev, grok: response }));

          // Update history with Grok response
          setQueryHistory(prev => prev.map(item =>
            item.id === historyId
              ? { ...item, responses: { ...item.responses, grok: response } }
              : item
          ));
        })
        .catch(err => {
          const errorMsg = `Error: ${err.message}`;
          setAiResponses(prev => ({ ...prev, grok: errorMsg }));
          setQueryHistory(prev => prev.map(item =>
            item.id === historyId
              ? { ...item, responses: { ...item.responses, grok: errorMsg } }
              : item
          ));
        });

      // Call Perplexity API directly
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
            : data.choices?.[0]?.message?.content || 'Error: Unable to get response';
          setAiResponses(prev => ({ ...prev, perplexity: response }));

          // Update history with Perplexity response
          setQueryHistory(prev => prev.map(item =>
            item.id === historyId
              ? { ...item, responses: { ...item.responses, perplexity: response } }
              : item
          ));
        })
        .catch(err => {
          const errorMsg = `Error: ${err.message}`;
          setAiResponses(prev => ({ ...prev, perplexity: errorMsg }));
          setQueryHistory(prev => prev.map(item =>
            item.id === historyId
              ? { ...item, responses: { ...item.responses, perplexity: errorMsg } }
              : item
          ));
        });

    } catch (error) {
      console.error('AI API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item) => {
    setSelectedHistoryItem(item);
    setAiResponses(item.responses);
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
      setQueryHistory([]);
      localStorage.removeItem('gridOnlyHistory');
      setSelectedHistoryItem(null);
      setAiResponses({
        claude: '',
        chatgpt: '',
        grok: '',
        perplexity: ''
      });
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
              <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ezarg - Grid with History</span>
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
        {/* Input bar */}
        <form onSubmit={handleAiSubmit} className="mb-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Ask a question to all four AIs..."
              className={`flex-1 px-3 py-1 text-sm border ${darkMode ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'} rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
            />
            <button
              type="submit"
              disabled={loading || !aiInput.trim()}
              className="px-4 py-1 text-sm bg-blue-600 text-white rounded font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Submit'}
            </button>
          </div>
        </form>

        {/* 2x2 Grid Layout */}
        <div className="grid grid-cols-2 grid-rows-2 gap-1 h-[calc(100vh-400px)]">
          {/* Claude Response - Top Left */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-lg p-1 border flex flex-col overflow-hidden`}>
            <h4 className={`text-xs font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mb-1 flex items-center gap-1 px-1 flex-shrink-0`}>
              <span className="text-sm">🤖</span> Claude
            </h4>
            <div className={`ai-response ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-xs overflow-y-auto px-1 flex-1 min-h-0`}>
              <ResponseRenderer response={aiResponses.claude} darkMode={darkMode} />
            </div>
          </div>

          {/* ChatGPT Response - Top Right */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-lg p-1 border flex flex-col overflow-hidden`}>
            <h4 className={`text-xs font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'} mb-1 flex items-center gap-1 px-1 flex-shrink-0`}>
              <span className="text-sm">💬</span> ChatGPT
            </h4>
            <div className={`ai-response ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-xs overflow-y-auto px-1 flex-1 min-h-0`}>
              <ResponseRenderer response={aiResponses.chatgpt} darkMode={darkMode} />
            </div>
          </div>

          {/* Grok Response - Bottom Left */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-lg p-1 border flex flex-col overflow-hidden`}>
            <h4 className={`text-xs font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-600'} mb-1 flex items-center gap-1 px-1 flex-shrink-0`}>
              <span className="text-sm">⚡</span> Grok
            </h4>
            <div className={`ai-response ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-xs overflow-y-auto px-1 flex-1 min-h-0`}>
              <ResponseRenderer response={aiResponses.grok} darkMode={darkMode} />
            </div>
          </div>

          {/* Perplexity Response - Bottom Right */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-lg p-1 border flex flex-col overflow-hidden`}>
            <h4 className={`text-xs font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-600'} mb-1 flex items-center gap-1 px-1 flex-shrink-0`}>
              <span className="text-sm">🔍</span> Perplexity
            </h4>
            <div className={`ai-response ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-xs overflow-y-auto px-1 flex-1 min-h-0`}>
              <ResponseRenderer response={aiResponses.perplexity} darkMode={darkMode} />
            </div>
          </div>
        </div>

        {/* Query History Section */}
        {queryHistory.length > 0 && (
          <div className={`mt-4 p-3 ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-lg border`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Query History ({queryHistory.length})</h3>
              <div className="flex gap-1">
                {selectedHistoryItem && (
                  <button
                    onClick={() => setSelectedHistoryItem(null)}
                    className={`px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                    style={{ fontSize: '9px' }}
                  >
                    Clear Selection
                  </button>
                )}
                <button
                  onClick={clearHistory}
                  className={`px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-600 hover:bg-gray-700'} text-white`}
                  style={{ fontSize: '9px' }}
                >
                  🗑️ Clear All
                </button>
              </div>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {queryHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => loadHistoryItem(item)}
                  className={`p-2 ${selectedHistoryItem?.id === item.id ? (darkMode ? 'bg-blue-900 border-blue-500' : 'bg-blue-50 border-blue-400') : (darkMode ? 'bg-gray-700 hover:bg-gray-650 border-gray-600' : 'bg-gray-50 hover:bg-gray-100 border-gray-300')} rounded border cursor-pointer transition-all`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className={`font-medium text-xs ${darkMode ? 'text-white' : 'text-gray-900'} flex-1`}>
                      {item.query}
                    </p>
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} ml-2`}>
                      {item.timestamp}
                    </span>
                  </div>
                  <div className="flex gap-1 text-xs">
                    <span className={`px-1 py-0.5 rounded ${darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                      Claude: {item.responses.claude ? '✓' : '✗'}
                    </span>
                    <span className={`px-1 py-0.5 rounded ${darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'}`}>
                      ChatGPT: {item.responses.chatgpt ? '✓' : '✗'}
                    </span>
                    <span className={`px-1 py-0.5 rounded ${darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                      Grok: {item.responses.grok ? '✓' : '✗'}
                    </span>
                    <span className={`px-1 py-0.5 rounded ${darkMode ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-700'}`}>
                      Perplexity: {item.responses.perplexity ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
