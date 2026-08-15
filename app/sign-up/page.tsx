'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GlowButton } from '@/components/ui/shiny-button-1';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/app');
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-[#0c0d10] px-4 py-12">
      <div className="max-w-md w-full mx-auto p-8 rounded-2xl bg-[#14151a] border border-slate-800/80 shadow-2xl font-normal">
        <div className="text-center mb-8">
          <img src="/main-logo.png" alt="Luxera Logo" className="w-12 h-12 object-contain mx-auto mb-3" />
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="text-xl font-semibold text-white">LUXERA <span className="text-orange-400 font-normal">PROVENANCE</span></span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-normal">Multi-tenant SoW Compliance Console</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-normal">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Siti Aminah"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0d10] border border-slate-800 text-white text-sm focus:outline-none focus:border-orange-500 font-normal"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Organization Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Luxera Cognitive Resources"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0d10] border border-slate-800 text-white text-sm focus:outline-none focus:border-orange-500 font-normal"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@organization.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0d10] border border-slate-800 text-white text-sm focus:outline-none focus:border-orange-500 font-normal"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c0d10] border border-slate-800 text-white text-sm focus:outline-none focus:border-orange-500 font-normal"
              required
            />
          </div>

          <GlowButton type="submit" disabled={loading}>
            <span className="flex items-center justify-center gap-2 font-normal text-sm">
              {loading ? 'Creating Account...' : 'Register Organization'}
              <ArrowRight className="w-4 h-4" />
            </span>
          </GlowButton>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400 font-normal">
          Already registered? <Link href="/sign-in" className="text-orange-400 font-normal hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

