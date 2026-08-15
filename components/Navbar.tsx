'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { LiquidButton } from '@/components/ui/button-1';
import {
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  Layers,
  Lock,
  FileText,
  Cpu,
  Terminal,
  Database,
  GitBranch,
  CheckCircle2,
  Menu,
  X,
  ExternalLink,
  Shield,
  FileCheck2,
  Binary,
  KeyRound,
  Scale,
  Code2,
} from 'lucide-react';

interface SubItem {
  title: string;
  desc: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  id: string;
  label: string;
  href: string;
  featured: {
    tag: string;
    title: string;
    desc: string;
    cta: string;
    href: string;
  };
  items: SubItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'product',
    label: 'Product',
    href: '/product',
    featured: {
      tag: 'Core Intelligence',
      title: 'Deterministic SoW Engine',
      desc: 'Mathematical deposit-to-salary scoring with zero LLM hallucination risk.',
      cta: 'Explore Capabilities',
      href: '/product',
    },
    items: [
      {
        title: 'Rule Adjudication',
        desc: 'Deterministic evaluation against strict statutory financial thresholds.',
        href: '/product',
        icon: Binary,
      },
      {
        title: 'Evidence Ingestion & OCR',
        desc: 'High-fidelity extraction for payslips, tax filings & bank statements.',
        href: '/product',
        icon: Layers,
      },
      {
        title: 'Pre-LLM PII Masking',
        desc: 'In-memory tokenization of NRIC, passports & account numbers.',
        href: '/product',
        icon: Shield,
      },
      {
        title: 'Composite Risk Scoring',
        desc: '0–100 risk bands mapped to automated or manual compliance queues.',
        href: '/product',
        icon: FileCheck2,
      },
    ],
  },
  {
    id: 'security',
    label: 'Security',
    href: '/security',
    featured: {
      tag: 'Zero-Trust Spec',
      title: 'Cryptographic Ledger',
      desc: 'Field-level envelope encryption with SHA-256 cryptographic audit chaining.',
      cta: 'Security Architecture',
      href: '/security',
    },
    items: [
      {
        title: 'Cryptographic Hash Chaining',
        desc: 'Immutable SHA-256 block ledger for every decision and officer override.',
        href: '/security',
        icon: GitBranch,
      },
      {
        title: 'Row-Level Multi-Tenancy',
        desc: 'Strict organization boundary enforcement preventing cross-tenant leaks.',
        href: '/security',
        icon: Database,
      },
      {
        title: 'Envelope Encryption',
        desc: 'Per-tenant AES-256-GCM data encryption keys wrapped with KMS.',
        href: '/security',
        icon: KeyRound,
      },
      {
        title: 'Audit Chain Verifier',
        desc: 'Automated cryptographic signature re-computation & tamper detection.',
        href: '/security',
        icon: Lock,
      },
    ],
  },
  {
    id: 'compliance',
    label: 'Compliance',
    href: '/compliance',
    featured: {
      tag: 'Statutory Mapping',
      title: 'Regulatory Registry',
      desc: 'Direct statutory control traceability for PDPA Act 709, AMLA 2001, and BNM.',
      cta: 'View Legal Matrix',
      href: '/compliance',
    },
    items: [
      {
        title: 'Statutory Source Inventory',
        desc: 'Comprehensive register for PDPA 2010, AMLA 2001, and ISO 42001.',
        href: '/compliance',
        icon: Scale,
      },
      {
        title: 'Human-in-the-Loop Queue',
        desc: 'Mandatory compliance officer review with cryptographic audit notes.',
        href: '/compliance',
        icon: ShieldCheck,
      },
      {
        title: '7-Year WORM Retention',
        desc: 'Stateful lifecycle manager ensuring statutory evidence preservation.',
        href: '/compliance',
        icon: FileText,
      },
      {
        title: 'Line-Item Explainability',
        desc: 'Exact document citations and ratio comparisons for regulatory audit.',
        href: '/compliance',
        icon: CheckCircle2,
      },
    ],
  },
  {
    id: 'open-source',
    label: 'Open Source',
    href: '/open-source',
    featured: {
      tag: 'Apache 2.0',
      title: 'Self-Hostable Core',
      desc: 'Deploy locally with Docker Compose or integrate directly into enterprise pipelines.',
      cta: 'View Specifications',
      href: '/open-source',
    },
    items: [
      {
        title: 'GitHub Repository',
        desc: 'Explore open source codebase, architecture RFCs, and API schemas.',
        href: '/open-source',
        icon: Code2,
      },
      {
        title: 'Docker Container Stack',
        desc: 'Single-command deployment with isolated local persistent store.',
        href: '/open-source',
        icon: Terminal,
      },
      {
        title: '76-Test Regression Suite',
        desc: 'Deterministic test harness verifying all scoring and compliance rules.',
        href: '/open-source',
        icon: Cpu,
      },
      {
        title: 'Native Node.js Pipeline',
        desc: 'Zero external pipeline dependencies for production survivability.',
        href: '/open-source',
        icon: Layers,
      },
    ],
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (id: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveDropdown(id);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  useEffect(() => {
    // Close mobile menu on route change
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#08090c]/85 backdrop-blur-xl border-b border-white/[0.08] transition-colors">
      {/* Top subtle light accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Identifier */}
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/main-logo.png"
            alt="Luxera"
            className="w-6 h-6 object-contain"
          />
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold text-sm tracking-wider text-white">LUXERA</span>
              <span className="text-sm text-zinc-400 font-light tracking-widest">PROVENANCE</span>
            </div>
            <div className="text-[9px] text-zinc-500 font-mono tracking-wider mt-0.5">
              SOW COMPLIANCE ENGINE
            </div>
          </div>
        </Link>

        {/* Desktop Enterprise Navigation Bar */}
        <nav
          className="hidden md:flex items-center gap-1 relative"
          onMouseLeave={() => {
            handleMouseLeave();
            setHoveredNav(null);
          }}
        >
          {NAV_SECTIONS.map((section) => {
            const isCurrent = pathname === section.href;
            const isOpen = activeDropdown === section.id;

            return (
              <div
                key={section.id}
                className="relative"
                onMouseEnter={() => {
                  handleMouseEnter(section.id);
                  setHoveredNav(section.id);
                }}
              >
                <Link
                  href={section.href}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isCurrent || isOpen
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {/* Sliding Hover Pill Background */}
                  {hoveredNav === section.id && (
                    <motion.div
                      layoutId="navbar-hover-pill"
                      className="absolute inset-0 rounded-lg bg-white/[0.06] border border-white/[0.08]"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
                    />
                  )}

                  <span className="relative z-10">{section.label}</span>
                  <ChevronDown
                    className={`relative z-10 w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-zinc-200' : 'group-hover:text-zinc-300'
                    }`}
                  />

                  {/* Active Indicator Underline */}
                  {isCurrent && !hoveredNav && (
                    <span className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-white/40 rounded-full" />
                  )}
                </Link>

                {/* Mega Dropdown Menu Flyout */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                      onMouseEnter={() => handleMouseEnter(section.id)}
                      onMouseLeave={handleMouseLeave}
                      className="absolute top-full left-1/2 -translate-x-1/2 pt-2.5 w-[580px] z-50"
                    >
                      <div className="relative rounded-2xl bg-[#0c0d11]/95 border border-white/[0.1] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden">
                        {/* Subtle top edge glow */}
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

                        <div className="grid grid-cols-12 gap-5">
                          
                          {/* Left Column: Featured Highlight Card */}
                          <div className="col-span-5 flex flex-col justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                            <div>
                              <span className="inline-block text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold mb-2">
                                {section.featured.tag}
                              </span>
                              <h4 className="text-sm font-semibold text-white tracking-tight leading-snug mb-1.5">
                                {section.featured.title}
                              </h4>
                              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                                {section.featured.desc}
                              </p>
                            </div>

                            <Link
                              href={section.featured.href}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-white hover:text-zinc-200 mt-4 group/cta"
                            >
                              <span>{section.featured.cta}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover/cta:translate-x-1 group-hover/cta:text-white transition-all" />
                            </Link>
                          </div>

                          {/* Right Column: Key Architectural Modules */}
                          <div className="col-span-7 flex flex-col justify-between">
                            <div className="space-y-1">
                              {section.items.map((item, idx) => {
                                const IconComponent = item.icon;
                                return (
                                  <Link
                                    key={idx}
                                    href={item.href}
                                    className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/[0.05] transition-all"
                                  >
                                    <div className="p-1.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-300 group-hover:text-white group-hover:border-white/20 transition-colors shrink-0 mt-0.5">
                                      <IconComponent className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                      <div className="text-xs font-medium text-zinc-200 group-hover:text-white transition-colors">
                                        {item.title}
                                      </div>
                                      <p className="text-[11px] text-zinc-400 leading-normal line-clamp-1 mt-0.5">
                                        {item.desc}
                                      </p>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>

                            <div className="pt-2 mt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
                              <span>Enterprise Ready</span>
                              <span className="text-zinc-300 font-sans">
                                High-Precision Verification
                              </span>
                            </div>
                          </div>

                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Right Side Actions: Sign In & Launch Console */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Sign In
          </Link>

          <LiquidButton href="/app" size="sm">
            <span className="flex items-center gap-1.5 font-medium text-xs sm:text-sm">
              Launch Console
              <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
            </span>
          </LiquidButton>
        </div>

        {/* Mobile Menu Trigger Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/sign-in"
            className="text-xs font-medium text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-white/[0.05]"
          >
            Sign In
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:text-white active:scale-[0.97] transition-all"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="md:hidden border-b border-white/[0.08] bg-[#0c0d12]/98 backdrop-blur-2xl overflow-hidden"
          >
            <div className="px-4 pt-3 pb-6 space-y-3">
              {NAV_SECTIONS.map((section) => {
                const isExpanded = mobileExpandedSection === section.id;
                const isCurrent = pathname === section.href;

                return (
                  <div
                    key={section.id}
                    className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setMobileExpandedSection(isExpanded ? null : section.id)
                      }
                      className="w-full flex items-center justify-between p-3.5 text-left text-sm font-medium text-zinc-200 hover:text-white"
                    >
                      <span className={isCurrent ? 'text-white font-semibold' : ''}>
                        {section.label}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-white' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18 }}
                          className="px-3.5 pb-3.5 space-y-2 border-t border-white/[0.04]"
                        >
                          <Link
                            href={section.href}
                            className="block p-2 rounded-lg bg-white/[0.04] text-xs font-semibold text-white flex items-center justify-between mt-2"
                          >
                            <span>Visit {section.label} Overview</span>
                            <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                          </Link>

                          <div className="space-y-1 pt-1">
                            {section.items.map((item, idx) => {
                              const IconComponent = item.icon;
                              return (
                                <Link
                                  key={idx}
                                  href={item.href}
                                  className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/[0.04] text-xs text-zinc-300 hover:text-white"
                                >
                                  <IconComponent className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
                                  <div>
                                    <div className="font-medium text-zinc-200">{item.title}</div>
                                    <div className="text-[11px] text-zinc-400 font-normal">{item.desc}</div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Mobile Actions */}
              <div className="pt-3 flex flex-col gap-2.5">
                <Link
                  href="/sign-in"
                  className="w-full py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-center text-sm font-medium text-zinc-200 hover:text-white"
                >
                  Sign In to Officer Portal
                </Link>
                <Link
                  href="/app"
                  className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-center text-sm shadow-lg flex items-center justify-center gap-2"
                >
                  Launch Console <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
