'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GlowButton } from '@/components/ui/shiny-button-1';
import { ArrowRight } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('officer@luxera.world');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/app');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-[#0c0d10] px-4">
      <div className="max-w-md w-full mx-auto p-8 rounded-2xl bg-[#14151a] border border-slate-800/80 shadow-2xl font-normal">
        <div className="text-center mb-8">
          <img src="/main-logo.png" alt="Luxera Logo" className="w-12 h-12 object-contain mx-auto mb-3" />
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="text-xl font-semibold text-white">LUXERA <span className="text-orange-400 font-normal">PROVENANCE</span></span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-normal">Compliance Officer & Analyst Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-normal">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0d10] border border-slate-800 text-white text-sm focus:outline-none focus:border-orange-500 font-normal"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-mono uppercase text-slate-400">Password</label>
              <Link href="/forgot-password" className="text-xs text-orange-400 hover:underline">Forgot?</Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0d10] border border-slate-800 text-white text-sm focus:outline-none focus:border-orange-500 font-normal"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {error}
            </div>
          )}

          <GlowButton type="submit" disabled={loading}>
            <span className="flex items-center justify-center gap-2 font-normal text-sm">
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </span>
          </GlowButton>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400 font-normal">
          Need an account? <Link href="/sign-up" className="text-orange-400 font-normal hover:underline">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}

