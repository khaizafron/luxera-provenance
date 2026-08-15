'use client';

import Link from 'next/link';
import { Mail, CheckCircle2 } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full mx-auto p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Verify Email Address</h1>
        <p className="text-xs text-slate-400 mb-6">A verification link has been dispatched to your email address.</p>
        <Link href="/sign-in" className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm">
          Return to Sign In
        </Link>
      </div>
    </div>
  );
}
