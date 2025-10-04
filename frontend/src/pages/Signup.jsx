import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

function Signup({ onSignUp, onNavigateHome }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    if (name) {
      onSignUp(name);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
      <div className="container mx-auto px-4">
        <button onClick={onNavigateHome} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Create Account</h2>
              <p className="text-gray-600 mt-2">Join NASA Earth Observer</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <button
                onClick={handleSignUp}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Create Account
              </button>
            </div>

            <div className="mt-6">
              <button
                onClick={() => onSignUp('Demo User')}
                className="w-full px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
              >
                Continue as Demo User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;