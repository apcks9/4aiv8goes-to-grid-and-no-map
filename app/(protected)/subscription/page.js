'use client';

import { useState } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function Subscription() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('Free Trial'); // Free Trial or Pro

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUpgrade = (plan) => {
    // Navigate to payment page with plan information
    router.push('/payment', { state: { plan } });
  };

  const handleCancelSubscription = () => {
    if (confirm('Are you sure you want to cancel your subscription?')) {
      setCurrentPlan('Free Trial');
      alert('Subscription cancelled. You will remain on Free Trial.');
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
                  <path
                    d="M75 25c-2-3-4-5-6-6-1-2-3-3-5-3l-2-4c-1-2-2-3-4-4-2-1-3-1-5 0-1 1-2 2-2 4l-1 3c-3 0-6 1-8 3-3 2-5 5-7 8-1 2-2 4-2 7v3c-2 1-4 2-5 4-2 2-3 5-3 8 0 2 0 4 1 6 1 2 2 3 4 4l2 1v8c0 2 1 4 2 5 2 2 4 3 6 3h4c2 0 4-1 6-2l8-6c2-1 3-2 5-2h6c3 0 5-1 7-3 2-2 3-4 3-7v-5c2-1 3-2 4-4 1-2 2-4 2-6 0-3-1-6-3-8-1-2-3-3-5-4v-2c0-3-1-5-3-8zm-8 15c-1 1-2 1-3 1s-2 0-3-1c-1-1-1-2-1-3s0-2 1-3c1-1 2-1 3-1s2 0 3 1c1 1 1 2 1 3s0 2-1 3z"
                    fill="#0a4f4c"
                  />
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

            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Subscription Plans</h1>

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

      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Current Plan Banner */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8 mb-8`}>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Your Current Plan
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-3xl font-bold ${currentPlan === 'Pro' ? 'text-green-400' : 'text-blue-400'}`}>
                  {currentPlan}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                  {currentPlan === 'Pro' ? 'Unlimited AI queries with all premium features' : 'Try all features for free'}
                </p>
              </div>
              {currentPlan === 'Pro' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push('/payment', { state: { plan: 'Pro', updatePayment: true } })}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
                  >
                    Update Payment Method
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all"
                  >
                    Cancel Subscription
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Trial Card */}
            <div className={`${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'} rounded-2xl shadow-xl border-2 p-8`}>
              <div className="text-center mb-6">
                <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Free Trial
                </h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className={`text-5xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>$0</span>
                  <span className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className={`flex items-start ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span>Access to all 4 AI models</span>
                </li>
                <li className={`flex items-start ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span>Basic query history</span>
                </li>
                <li className={`flex items-start ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span>Standard response time</span>
                </li>
                <li className={`flex items-start ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="text-gray-500 mr-3 text-xl">✗</span>
                  <span>Limited to 50 queries/day</span>
                </li>
              </ul>

              <button
                disabled={currentPlan === 'Free Trial'}
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  currentPlan === 'Free Trial'
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {currentPlan === 'Free Trial' ? 'Current Plan' : 'Downgrade to Free'}
              </button>
            </div>

            {/* Pro Card */}
            <div className={`${darkMode ? 'bg-gradient-to-br from-green-900 to-green-800 border-green-600' : 'bg-gradient-to-br from-green-600 to-green-700 border-green-800'} rounded-2xl shadow-xl border-2 p-8 relative`}>
              <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                RECOMMENDED
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Pro
                </h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-white">$15</span>
                  <span className="text-lg text-green-200">/month</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start text-white">
                  <span className="text-yellow-400 mr-3 text-xl">✓</span>
                  <span>Access to all 4 AI models</span>
                </li>
                <li className="flex items-start text-white">
                  <span className="text-yellow-400 mr-3 text-xl">✓</span>
                  <span>Unlimited query history</span>
                </li>
                <li className="flex items-start text-white">
                  <span className="text-yellow-400 mr-3 text-xl">✓</span>
                  <span>Priority response time</span>
                </li>
                <li className="flex items-start text-white">
                  <span className="text-yellow-400 mr-3 text-xl">✓</span>
                  <span><strong>Unlimited queries/day</strong></span>
                </li>
                <li className="flex items-start text-white">
                  <span className="text-yellow-400 mr-3 text-xl">✓</span>
                  <span>Priority customer support</span>
                </li>
                <li className="flex items-start text-white">
                  <span className="text-yellow-400 mr-3 text-xl">✓</span>
                  <span>Export conversations</span>
                </li>
              </ul>

              <button
                onClick={() => handleUpgrade('Pro')}
                disabled={currentPlan === 'Pro'}
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  currentPlan === 'Pro'
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-green-700 hover:bg-gray-100'
                }`}
              >
                {currentPlan === 'Pro' ? 'Current Plan' : 'Upgrade to Pro'}
              </button>
            </div>
          </div>

          {/* FAQ Section */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8 mt-8`}>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Can I cancel anytime?
                </h3>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Yes! You can cancel your Pro subscription at any time. You'll continue to have access until the end of your billing period.
                </p>
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  What payment methods do you accept?
                </h3>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  We accept all major credit cards (Visa, MasterCard, American Express) and PayPal.
                </p>
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Do you offer refunds?
                </h3>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.
                </p>
              </div>
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
