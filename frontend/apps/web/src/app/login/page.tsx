'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { login, error: authError } = useAuth();
  const [email, setEmail] = useState('viewer@finbytes.dev');
  const [password, setPassword] = useState('DevViewer2024!');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 border border-gray-200 rounded">
        <h1 className="font-serif text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="text-gray-600 mb-6">Sign in to your Finbytes account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
              {authError}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:border-accent focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:border-accent focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-accent text-black font-semibold rounded hover:bg-accent-dark disabled:opacity-50 transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="#" className="text-accent hover:text-accent-dark font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}