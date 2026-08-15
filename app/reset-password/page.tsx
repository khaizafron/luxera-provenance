'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen flex flex-col justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full mx-auto p-8 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white">Set New Password</h1>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); router.push('/sign-in'); }} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2">
            Update Password <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
