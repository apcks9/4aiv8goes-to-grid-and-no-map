'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { useRouter } from 'next/navigation';
import ResponseRenderer from '../../components/ResponseRenderer';
export default function HorizontalLayout() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [subscriptionPlan, setSubscriptionPlan] = useState('Free Trial'); // Free Trial or Pro
  const [aiInput, setAiInput] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
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
  const [tempApiKeys, setTempApiKeys] = useState({
    claude: '',
    chatgpt: '',
    grok: '',
    perplexity: ''
  });
  const [queryHistory, setQueryHistory] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  const clearConversation = () => {
    setConversationHistory([]);
    setAiResponses({
      claude: '',
      chatgpt: '',
      grok: '',
      perplexity: ''
    });
  };

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const currentQuery = aiInput;
    const timestamp = new Date().toLocaleString();
    const historyId = Date.now();

    setLoading(true);

    // Clear input immediately
    const queryText = aiInput;
    setAiInput('');

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

    // Use API keys from state
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
        .then(res => res.json())
        .then(data => {
          console.log('Claude Response:', data);
          const response = data.error
            ? `Error: ${data.error.message || JSON.stringify(data.error)}`
            : data.content?.[0]?.text || 'Error: Unable to get response';

          setAiResponses(prev => ({
            ...prev,
            claude: response
          }));

          // Update history with Claude response
          setQueryHistory(prev => prev.map(item =>
            item.id === historyId
              ? { ...item, responses: { ...item.responses, claude: response } }
              : item
          ));
        })
        .catch(err => {
          console.error('Claude Error:', err);
          const errorMsg = `Error: ${err.message}`;
          setAiResponses(prev => ({
            ...prev,
            claude: errorMsg
          }));

          // Update history with Claude error
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
        .then(res => res.json())
        .then(data => {
          console.log('OpenAI Response:', data);
          const response = data.error
            ? `Error: ${data.error.message || JSON.stringify(data.error)}`
            : data.choices?.[0]?.message?.content || 'Error: Unable to get response';

          setAiResponses(prev => ({
            ...prev,
            chatgpt: response
          }));

          // Update history with ChatGPT response
          setQueryHistory(prev => prev.map(item =>
            item.id === historyId
              ? { ...item, responses: { ...item.responses, chatgpt: response } }
              : item
          ));
        })
        .catch(err => {
          console.error('OpenAI Error:', err);
          const errorMsg = `Error: ${err.message}`;
          setAiResponses(prev => ({
            ...prev,
            chatgpt: errorMsg
          }));

          // Update history with ChatGPT error
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
        .then(res => res.json())
        .then(data => {
          console.log('Grok Response:', data);
          const response = data.error
            ? `Error: ${data.error.message || JSON.stringify(data.error)}`
            : data.choices?.[0]?.message?.content || 'Error: Unable to get response';

          setAiResponses(prev => ({
            ...prev,
            grok: response
          }));

          // Update history with Grok response
          setQueryHistory(prev => prev.map(item =>
            item.id === historyId
              ? { ...item, responses: { ...item.responses, grok: response } }
              : item
          ));
        })
        .catch(err => {
          console.error('Grok Error:', err);
          const errorMsg = `Error: ${err.message}`;
          setAiResponses(prev => ({
            ...prev,
            grok: errorMsg
          }));

          // Update history with Grok error
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
        .then(res => res.json())
        .then(data => {
          console.log('Perplexity Response:', data);
          const response = data.error
            ? `Error: ${data.error.message || JSON.stringify(data.error)}`
            : data.choices?.[0]?.message?.content || 'Error: Unable to get response';

          setAiResponses(prev => ({
            ...prev,
            perplexity: response
          }));

          // Update history with Perplexity response
          setQueryHistory(prev => prev.map(item =>
            item.id === historyId
              ? { ...item, responses: { ...item.responses, perplexity: response } }
              : item
          ));
        })
        .catch(err => {
          console.error('Perplexity Error:', err);
          const errorMsg = `Error: ${err.message}`;
          setAiResponses(prev => ({
            ...prev,
            perplexity: errorMsg
          }));

          // Update history with Perplexity error
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

  const handleSaveApiKey = (aiName) => {
    setApiKeys(prev => ({
      ...prev,
      [aiName]: tempApiKeys[aiName]
    }));
    alert(`${aiName.charAt(0).toUpperCase() + aiName.slice(1)} API key saved!`);
  };

  const loadHistoryItem = (item) => {
    setSelectedHistoryItem(item);
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
      <nav className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 relative">
            <div className="flex items-center cursor-pointer" onClick={() => router.push('/dashboard')}>
              <div className="relative w-14 h-14 flex items-center justify-center -mr-2">
                <svg viewBox="0 0 100 100" className="w-14 h-14">
                  {/* Goat silhouette */}
                  <path
                    d="M75 25c-2-3-4-5-6-6-1-2-3-3-5-3l-2-4c-1-2-2-3-4-4-2-1-3-1-5 0-1 1-2 2-2 4l-1 3c-3 0-6 1-8 3-3 2-5 5-7 8-1 2-2 4-2 7v3c-2 1-4 2-5 4-2 2-3 5-3 8 0 2 0 4 1 6 1 2 2 3 4 4l2 1v8c0 2 1 4 2 5 2 2 4 3 6 3h4c2 0 4-1 6-2l8-6c2-1 3-2 5-2h6c3 0 5-1 7-3 2-2 3-4 3-7v-5c2-1 3-2 4-4 1-2 2-4 2-6 0-3-1-6-3-8-1-2-3-3-5-4v-2c0-3-1-5-3-8zm-8 15c-1 1-2 1-3 1s-2 0-3-1c-1-1-1-2-1-3s0-2 1-3c1-1 2-1 3-1s2 0 3 1c1 1 1 2 1 3s0 2-1 3z"
                    fill="#0a4f4c"
                  />
                  {/* Letter E */}
                  <text
                    x="50"
                    y="58"
                    fontSize="32"
                    fontWeight="bold"
                    fill="white"
                    textAnchor="middle"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    E
                  </text>
                </svg>
              </div>
              <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} -mt-[4px]`}>Ezarg</span>
            </div>

            <div className={`absolute left-1/4 flex items-center gap-6`}>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Horizontal Layout</h1>
              <div className="flex items-center gap-3 ml-[100px]">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-gray-600 to-red-600 rounded-full">
                  <span className="text-lg text-white font-bold">
                    {currentUser?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Welcome, {currentUser?.displayName || 'User'}!
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className={`px-4 py-2 ${darkMode ? 'bg-gray-500 hover:bg-gray-600' : 'bg-gray-700 hover:bg-gray-800'} text-white rounded-lg font-medium transition-all`}
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`px-4 py-2 ${darkMode ? 'bg-gray-500 hover:bg-gray-600' : 'bg-gray-700 hover:bg-gray-800'} text-white rounded-lg font-medium transition-all`}
              >
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="w-full px-2 py-4 pb-8">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl p-4`}>

          <div className={`p-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-xl border`}>
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 px-2`}>AI Comparison Tool - Horizontal View</h3>
            <form onSubmit={handleAiSubmit} className="mb-4 px-2">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask a question to all four AIs..."
                  className={`flex-1 px-4 py-3 border ${darkMode ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                />
                <button
                  type="submit"
                  disabled={loading || !aiInput.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Submit'}
                </button>
              </div>
            </form>

            {/* 4 Column Horizontal Layout */}
            <div className="grid gap-2 md:grid-cols-4">
              {/* Claude Response */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-xl p-4 border`}>
                <h4 className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mb-3 flex items-center gap-2`}>
                  <span>🤖</span> Claude
                </h4>
                <div className={`ai-response ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm min-h-[800px] max-h-[800px] overflow-y-auto`}>
                  <ResponseRenderer response={aiResponses.claude} darkMode={darkMode} />
                </div>
              </div>

              {/* ChatGPT Response */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-xl p-4 border`}>
                <h4 className={`text-lg font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'} mb-3 flex items-center gap-2`}>
                  <span>💬</span> ChatGPT
                </h4>
                <div className={`ai-response ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm min-h-[800px] max-h-[800px] overflow-y-auto`}>
                  <ResponseRenderer response={aiResponses.chatgpt} darkMode={darkMode} />
                </div>
              </div>

              {/* Grok Response */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-xl p-4 border`}>
                <h4 className={`text-lg font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-600'} mb-3 flex items-center gap-2`}>
                  <span>⚡</span> Grok
                </h4>
                <div className={`ai-response ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm min-h-[800px] max-h-[800px] overflow-y-auto`}>
                  <ResponseRenderer response={aiResponses.grok} darkMode={darkMode} />
                </div>
              </div>

              {/* Perplexity Response */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-xl p-4 border`}>
                <h4 className={`text-lg font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-600'} mb-3 flex items-center gap-2`}>
                  <span>🔍</span> Perplexity
                </h4>
                <div className={`ai-response ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm min-h-[800px] max-h-[800px] overflow-y-auto`}>
                  <ResponseRenderer response={aiResponses.perplexity} darkMode={darkMode} />
                </div>
              </div>
            </div>
          </div>

          {/* Query History Section */}
          {queryHistory.length > 0 && (
            <div className={`mt-8 p-6 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-xl border`}>
              <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Query History</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
                {queryHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => loadHistoryItem(item)}
                    className={`p-4 ${selectedHistoryItem?.id === item.id ? (darkMode ? 'bg-blue-900 border-blue-500' : 'bg-blue-50 border-blue-400') : (darkMode ? 'bg-gray-800 hover:bg-gray-750 border-gray-600' : 'bg-white hover:bg-gray-50 border-gray-300')} rounded-lg border cursor-pointer transition-all`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} flex-1`}>
                        {item.query}
                      </p>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} ml-4`}>
                        {item.timestamp}
                      </span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className={`px-2 py-1 rounded ${darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                        Claude: {item.responses.claude ? '✓' : '✗'}
                      </span>
                      <span className={`px-2 py-1 rounded ${darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'}`}>
                        ChatGPT: {item.responses.chatgpt ? '✓' : '✗'}
                      </span>
                      <span className={`px-2 py-1 rounded ${darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                        Grok: {item.responses.grok ? '✓' : '✗'}
                      </span>
                      <span className={`px-2 py-1 rounded ${darkMode ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-700'}`}>
                        Perplexity: {item.responses.perplexity ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected History Responses - 4 Column Layout */}
              {selectedHistoryItem && (
                <div className="pt-6 border-t border-gray-600">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Saved Responses
                    </h4>
                    <button
                      onClick={() => setSelectedHistoryItem(null)}
                      className={`text-sm px-3 py-1 rounded ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                    >
                      Close
                    </button>
                  </div>
                  <div className={`p-4 ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-lg border mb-4`}>
                    <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Query: {selectedHistoryItem.query}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {selectedHistoryItem.timestamp}
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-4">
                    {/* Claude Saved Response */}
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-xl p-6 border`}>
                      <h4 className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mb-3 flex items-center gap-2`}>
                        <span>🤖</span> Claude
                      </h4>
                      <div className={`ai-response ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm min-h-[400px] max-h-[600px] overflow-y-auto`}>
                        <ResponseRenderer response={selectedHistoryItem.responses.claude || 'No response'} darkMode={darkMode} />
                      </div>
                    </div>

                    {/* ChatGPT Saved Response */}
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-xl p-6 border`}>
                      <h4 className={`text-lg font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'} mb-3 flex items-center gap-2`}>
                        <span>💬</span> ChatGPT
                      </h4>
                      <div className={`ai-response ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm min-h-[400px] max-h-[600px] overflow-y-auto`}>
                        <ResponseRenderer response={selectedHistoryItem.responses.chatgpt || 'No response'} darkMode={darkMode} />
                      </div>
                    </div>

                    {/* Grok Saved Response */}
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-xl p-6 border`}>
                      <h4 className={`text-lg font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-600'} mb-3 flex items-center gap-2`}>
                        <span>⚡</span> Grok
                      </h4>
                      <div className={`ai-response ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm min-h-[400px] max-h-[600px] overflow-y-auto`}>
                        <ResponseRenderer response={selectedHistoryItem.responses.grok || 'No response'} darkMode={darkMode} />
                      </div>
                    </div>

                    {/* Perplexity Saved Response */}
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-xl p-6 border`}>
                      <h4 className={`text-lg font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-600'} mb-3 flex items-center gap-2`}>
                        <span>🔍</span> Perplexity
                      </h4>
                      <div className={`ai-response ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm min-h-[400px] max-h-[600px] overflow-y-auto`}>
                        <ResponseRenderer response={selectedHistoryItem.responses.perplexity || 'No response'} darkMode={darkMode} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* API Configuration Section */}
          <div className={`mt-8 p-6 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-xl border`}>
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>API Configuration</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>Configure your API keys for each AI service</p>

            <div className="grid gap-6 md:grid-cols-4">
              {/* Claude API Key */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-xl p-6 border`}>
                <h4 className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mb-3 flex items-center gap-2`}>
                  <span>🤖</span> Claude API
                </h4>
                <label className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} block mb-2`}>API Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={tempApiKeys.claude}
                    onChange={(e) => setTempApiKeys(prev => ({ ...prev, claude: e.target.value }))}
                    placeholder="Enter Claude API key"
                    className={`flex-1 px-3 py-2 text-sm border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900'} rounded focus:ring-2 focus:ring-blue-500 outline-none`}
                  />
                  <button
                    onClick={() => handleSaveApiKey('claude')}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-all"
                  >
                    Save
                  </button>
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                  {apiKeys.claude ? '✓ Key configured' : 'No key set'}
                </p>
              </div>

              {/* ChatGPT API Key */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-xl p-6 border`}>
                <h4 className={`text-lg font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'} mb-3 flex items-center gap-2`}>
                  <span>💬</span> ChatGPT API
                </h4>
                <label className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} block mb-2`}>API Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={tempApiKeys.chatgpt}
                    onChange={(e) => setTempApiKeys(prev => ({ ...prev, chatgpt: e.target.value }))}
                    placeholder="Enter OpenAI API key"
                    className={`flex-1 px-3 py-2 text-sm border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900'} rounded focus:ring-2 focus:ring-green-500 outline-none`}
                  />
                  <button
                    onClick={() => handleSaveApiKey('chatgpt')}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-all"
                  >
                    Save
                  </button>
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                  {apiKeys.chatgpt ? '✓ Key configured' : 'No key set'}
                </p>
              </div>

              {/* Grok API Key */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-xl p-6 border`}>
                <h4 className={`text-lg font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-600'} mb-3 flex items-center gap-2`}>
                  <span>⚡</span> Grok API
                </h4>
                <label className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} block mb-2`}>API Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={tempApiKeys.grok}
                    onChange={(e) => setTempApiKeys(prev => ({ ...prev, grok: e.target.value }))}
                    placeholder="Enter Grok API key"
                    className={`flex-1 px-3 py-2 text-sm border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900'} rounded focus:ring-2 focus:ring-purple-500 outline-none`}
                  />
                  <button
                    onClick={() => handleSaveApiKey('grok')}
                    className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-all"
                  >
                    Save
                  </button>
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                  {apiKeys.grok ? '✓ Key configured' : 'No key set'}
                </p>
              </div>

              {/* Perplexity API Key */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-xl p-6 border`}>
                <h4 className={`text-lg font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-600'} mb-3 flex items-center gap-2`}>
                  <span>🔍</span> Perplexity API
                </h4>
                <label className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} block mb-2`}>API Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={tempApiKeys.perplexity}
                    onChange={(e) => setTempApiKeys(prev => ({ ...prev, perplexity: e.target.value }))}
                    placeholder="Enter Perplexity API key"
                    className={`flex-1 px-3 py-2 text-sm border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900'} rounded focus:ring-2 focus:ring-orange-500 outline-none`}
                  />
                  <button
                    onClick={() => handleSaveApiKey('perplexity')}
                    className="px-4 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-all"
                  >
                    Save
                  </button>
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                  {apiKeys.perplexity ? '✓ Key configured' : 'No key set'}
                </p>
              </div>
            </div>
          </div>

          {/* Email Section */}
          <div className={`mt-8 p-6 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-xl border`}>
            <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Email</h3>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{currentUser?.email}</p>
          </div>

          {/* Account Information */}
          <div className={`mt-8 p-6 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} rounded-xl border`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Account Information</h3>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all text-sm"
              >
                Change Password
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                <span className="font-medium">Display Name:</span> {currentUser?.displayName || 'Not set'}
              </p>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                <span className="font-medium">Created:</span>{' '}
                {currentUser?.metadata?.creationTime
                  ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
                  : 'Unknown'}
              </p>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                <span className="font-medium">Last Sign In:</span>{' '}
                {currentUser?.metadata?.lastSignInTime
                  ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString()
                  : 'Unknown'}
              </p>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                <span className="font-medium">Current Plan:</span>{' '}
                <span className={`font-semibold ${subscriptionPlan === 'Pro' ? 'text-green-400' : 'text-blue-400'}`}>
                  {subscriptionPlan}
                </span>
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              {subscriptionPlan === 'Free Trial' && (
                <button
                  onClick={() => router.push('/subscription')}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all text-sm"
                >
                  Upgrade to Pro
                </button>
              )}
              <button
                onClick={() => router.push('/subscription')}
                className={`px-4 py-2 ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} text-white rounded-lg font-medium transition-all text-sm`}
              >
                View Subscription
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className={`relative bottom-0 left-0 right-0 py-4 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-8`}>
        © 2025 ezarg.com
      </footer>
    </div>
  );
}
