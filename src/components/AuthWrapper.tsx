import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface AuthWrapperProps {
  children: (user: User, logout: () => void) => React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.endsWith('@google.com')) {
      setError('Only @google.com emails are allowed.');
      return;
    }
    const newUser = { email: emailInput, name: emailInput.split('@')[0] };
    setUser(newUser);
    localStorage.setItem('mockUser', JSON.stringify(newUser));
    setError('');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mockUser');
  };

  if (user) {
    return <>{children(user, handleLogout)}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <svg className="w-12 h-12 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Google Cloud Space Munich
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to access the Agenda Builder
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Google Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="user@google.com"
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in with Google
              </button>
            </div>
          </form>
          <div className="mt-4 text-xs text-gray-500 text-center">
            (Mock Authentication: Firebase setup failed due to permission errors. This uses local storage to simulate login.)
          </div>
        </div>
      </div>
    </div>
  );
}
