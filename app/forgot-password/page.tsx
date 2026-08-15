'use client';

import { useState } from 'react';
import Link from 'next/link';
import { KeyRound, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full mx-auto p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Reset Password</h1>
        {submitted ? (
          <div className="text-xs text-slate-300">
            Password reset instructions have been dispatched. Check your inbox.
            <div className="mt-6">
              <Link href="/sign-in" className="text-blue-400 font-medium hover:underline">Return to Sign In</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2">
              Send Reset Link <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
