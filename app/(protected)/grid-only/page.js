'use client';

// Updated: Fixed Claude API error handling - v2.0
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { useRouter } from 'next/navigation';
import ResponseRenderer from '../../components/ResponseRenderer';

export default function GridOnly() {
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

  // Conversation history for each AI
  const [conversations, setConversations] = useState({
    claude: [],
    chatgpt: [],
    grok: [],
    perplexity: []
  });
  const [apiKeys, setApiKeys] = useState({
    claude: process.env.NEXT_PUBLIC_CLAUDE_API_KEY || '',
    chatgpt: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    grok: process.env.NEXT_PUBLIC_GROK_API_KEY || '',
    perplexity: process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY || ''
  });
  const [queryHistory, setQueryHistory] = useState([]);

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

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (queryHistory.length > 0) {
      localStorage.setItem('gridOnlyHistory', JSON.stringify(queryHistory));
    }
  }, [queryHistory]);

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const queryText = aiInput;
    const timestamp = new Date().toLocaleString();
    const historyId = Date.now();

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

    // Create initial history entry
    const newHistoryItem = {
      id: historyId,
      query: queryText,
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
      // Build conversation history for Claude
      const claudeMessages = [
        ...conversations.claude.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: queryText }
      ];

      // Call Claude API through backend
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/claude`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: queryText,
          messages: claudeMessages,
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

          // Update conversation history
          if (!data.error) {
            setConversations(prev => ({
              ...prev,
              claude: [
                ...prev.claude,
                { role: 'user', content: queryText },
                { role: 'assistant', content: response }
              ]
            }));
          }

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

          // Update history with error
          setQueryHistory(prev => prev.map(item =>
            item.id === historyId
              ? { ...item, responses: { ...item.responses, claude: errorMsg } }
              : item
          ));
        });

      // Build conversation history for ChatGPT
      const chatgptMessages = [
        ...conversations.chatgpt.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: queryText }
      ];

      // Call OpenAI API directly
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: chatgptMessages
        })
      })
        .then(res => res.json())
        .then(data => {
          const response = data.error
            ? `Error: ${data.error.message || JSON.stringify(data.error)}`
            : data.choices?.[0]?.message?.content || 'Error: Unable to get response';
          setAiResponses(prev => ({ ...prev, chatgpt: response }));

          // Update conversation history
          if (!data.error) {
            setConversations(prev => ({
              ...prev,
              chatgpt: [
                ...prev.chatgpt,
                { role: 'user', content: queryText },
                { role: 'assistant', content: response }
              ]
            }));
          }

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

          // Update history with error
          setQueryHistory(prev => prev.map(item =>
            item.id === historyId
              ? { ...item, responses: { ...item.responses, chatgpt: errorMsg } }
              : item
          ));
        });

      // Build conversation history for Grok
      const grokMessages = [
        ...conversations.grok.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: queryText }
      ];

      // Call Grok API directly
      fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'grok-2-latest',
          messages: grokMessages
        })
      })
        .then(res => res.json())
        .then(data => {
          const response = data.error
            ? `Error: ${data.error.message || JSON.stringify(data.error)}`
            : data.choices?.[0]?.message?.content || 'Error: Unable to get response';
          setAiResponses(prev => ({ ...prev, grok: response }));

          // Update conversation history
          if (!data.error) {
            setConversations(prev => ({
              ...prev,
              grok: [
                ...prev.grok,
                { role: 'user', content: queryText },
                { role: 'assistant', content: response }
              ]
            }));
          }

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

          // Update history with error
          setQueryHistory(prev => prev.map(item =>
            item.id === historyId
              ? { ...item, responses: { ...item.responses, grok: errorMsg } }
              : item
          ));
        });

      // Build conversation history for Perplexity
      const perplexityMessages = [
        ...conversations.perplexity.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: queryText }
      ];

      // Call Perplexity API directly
      fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: perplexityMessages
        })
      })
        .then(res => res.json())
        .then(data => {
          const response = data.error
            ? `Error: ${data.error.message || JSON.stringify(data.error)}`
            : data.choices?.[0]?.message?.content || 'Error: Unable to get response';
          setAiResponses(prev => ({ ...prev, perplexity: response }));

          // Update conversation history
          if (!data.error) {
            setConversations(prev => ({
              ...prev,
              perplexity: [
                ...prev.perplexity,
                { role: 'user', content: queryText },
                { role: 'assistant', content: response }
              ]
            }));
          }

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

          // Update history with error
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

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
      setQueryHistory([]);
      localStorage.removeItem('gridOnlyHistory');
    }
  };

  const clearConversation = (aiName) => {
    if (confirm(`Clear ${aiName} conversation? This will reset the conversation history.`)) {
      setConversations(prev => ({
        ...prev,
        [aiName]: []
      }));
      setAiResponses(prev => ({
        ...prev,
        [aiName]: ''
      }));
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
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-black to-gray-950' : 'bg-gray-100'}`}>
      {/* Minimal top bar */}
      <nav className={`${darkMode ? 'bg-black border-b border-gray-900' : 'bg-white'} shadow-sm`}>
        <div className="w-full px-4">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center cursor-pointer" onClick={() => router.push('/dashboard')}>
              <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Ezarg - Grid Only</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className={`px-3 py-1 text-sm ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-700 hover:bg-gray-800'} text-white rounded transition-all`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`px-3 py-1 text-sm ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-700 hover:bg-gray-800'} text-white rounded transition-all`}
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
              ref={inputRef}
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Ask a question to all four AIs..."
              className={`flex-1 px-3 py-1 text-sm border ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900'} rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
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

        {/* 2x2 Grid Layout - Full screen */}
        <div className="grid grid-cols-2 grid-rows-2 gap-1 h-[calc(100vh-100px)]">
          {/* Claude Response - Top Left */}
          <div className={`${darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-300'} rounded-lg p-1 border flex flex-col overflow-hidden`}>
            <div className="flex items-center px-1 mb-0 flex-shrink-0">
              <h4 className={`text-xs font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'} flex items-center gap-1`}>
                <span className="text-sm">🤖</span> Claude
                {conversations.claude.length > 0 && (
                  <>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} style={{ fontSize: '6px' }}>
                      ({conversations.claude.length / 2} memories)
                    </span>
                    <button
                      onClick={() => clearConversation('claude')}
                      className={`${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-600'} transition-colors cursor-pointer`}
                      style={{ fontSize: '10px' }}
                      title="Delete memories"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </h4>
            </div>
            <div className={`ai-response ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-xs overflow-y-auto px-1 flex-1 min-h-0`}>
              <ResponseRenderer response={aiResponses.claude} darkMode={darkMode} />
            </div>
          </div>

          {/* ChatGPT Response - Top Right */}
          <div className={`${darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-300'} rounded-lg p-1 border flex flex-col overflow-hidden`}>
            <div className="flex items-center px-1 mb-0 flex-shrink-0">
              <h4 className={`text-xs font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'} flex items-center gap-1`}>
                <span className="text-sm">💬</span> ChatGPT
                {conversations.chatgpt.length > 0 && (
                  <>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} style={{ fontSize: '6px' }}>
                      ({conversations.chatgpt.length / 2} memories)
                    </span>
                    <button
                      onClick={() => clearConversation('chatgpt')}
                      className={`${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-600'} transition-colors cursor-pointer`}
                      style={{ fontSize: '10px' }}
                      title="Delete memories"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </h4>
            </div>
            <div className={`ai-response ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-xs overflow-y-auto px-1 flex-1 min-h-0`}>
              <ResponseRenderer response={aiResponses.chatgpt} darkMode={darkMode} />
            </div>
          </div>

          {/* Grok Response - Bottom Left */}
          <div className={`${darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-300'} rounded-lg p-1 border flex flex-col overflow-hidden`}>
            <div className="flex items-center px-1 mb-0 flex-shrink-0">
              <h4 className={`text-xs font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-600'} flex items-center gap-1`}>
                <span className="text-sm">⚡</span> Grok
                {conversations.grok.length > 0 && (
                  <>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} style={{ fontSize: '6px' }}>
                      ({conversations.grok.length / 2} memories)
                    </span>
                    <button
                      onClick={() => clearConversation('grok')}
                      className={`${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-600'} transition-colors cursor-pointer`}
                      style={{ fontSize: '10px' }}
                      title="Delete memories"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </h4>
            </div>
            <div className={`ai-response ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-xs overflow-y-auto px-1 flex-1 min-h-0`}>
              <ResponseRenderer response={aiResponses.grok} darkMode={darkMode} />
            </div>
          </div>

          {/* Perplexity Response - Bottom Right */}
          <div className={`${darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-300'} rounded-lg p-1 border flex flex-col overflow-hidden`}>
            <div className="flex items-center px-1 mb-0 flex-shrink-0">
              <h4 className={`text-xs font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-600'} flex items-center gap-1`}>
                <span className="text-sm">🔍</span> Perplexity
                {conversations.perplexity.length > 0 && (
                  <>
                    <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} style={{ fontSize: '6px' }}>
                      ({conversations.perplexity.length / 2} memories)
                    </span>
                    <button
                      onClick={() => clearConversation('perplexity')}
                      className={`${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-600'} transition-colors cursor-pointer`}
                      style={{ fontSize: '10px' }}
                      title="Delete memories"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </h4>
            </div>
            <div className={`ai-response ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-xs overflow-y-auto px-1 flex-1 min-h-0`}>
              <ResponseRenderer response={aiResponses.perplexity} darkMode={darkMode} />
            </div>
          </div>
        </div>

        {/* History Controls */}
        <div className="flex justify-center items-center gap-2 mt-1">
          <button
            onClick={() => router.push('/grid-with-history')}
            className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} underline transition-colors`}
            style={{ fontSize: '9px' }}
          >
            📝 View History ({queryHistory.length})
          </button>
          {queryHistory.length > 0 && (
            <button
              onClick={clearHistory}
              className={`px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-600 hover:bg-gray-700'} text-white transition-colors`}
              style={{ fontSize: '9px' }}
            >
              🗑️ Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
