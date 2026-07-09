import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { BrainCircuit, ArrowLeft, ArrowRight, ShieldCheck, HeartHandshake, Eye } from 'lucide-react'

export default function AboutPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen text-slate-100 flex flex-col justify-between overflow-x-hidden">
      
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto h-20 px-6 flex items-center justify-between border-b border-white/5 bg-[#06070a]/65 backdrop-blur-md z-50">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center border border-indigo-400/20">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-wider text-white">AI-COS</span>
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Home</Link>
          <Link href="/features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</Link>
          <Link href="/pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</Link>
        </nav>
      </header>

      {/* Main Body */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-16 text-left">
        
        {/* Back Link */}
        <button
          onClick={() => router.push('/')}
          className="mb-8 px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 Outfit tracking-tight">
          About AI-COS
        </h1>
        <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-8">
          The AI College Operating System (AI-COS) was born out of a simple vision: to create a single, unified command center for students that automates the complex overhead of academic life. From attendance warnings to DSA milestones, AI-COS works behind the scenes so you can focus on learning.
        </p>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-5 rounded-xl bg-white/5 border border-white/5">
            <ShieldCheck className="w-8 h-8 text-indigo-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1.5">Privacy First</h3>
            <p className="text-xs text-slate-400 leading-normal">
              No cloud tracking. All attendance logs, notes, and goals are stored safely in a local SQLite file.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-white/5 border border-white/5">
            <HeartHandshake className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1.5">Zero API Keys</h3>
            <p className="text-xs text-slate-400 leading-normal">
              Fully operational out of the box. No credit cards or token billing parameters required.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-white/5 border border-white/5">
            <Eye className="w-8 h-8 text-pink-400 mb-3" />
            <h3 className="text-base font-bold text-white mb-1.5">ADK 2.0 Ready</h3>
            <p className="text-xs text-slate-400 leading-normal">
              Built on clean modular patterns, ready to plug in Google Gemini or ADK agents.
            </p>
          </div>
        </div>

        {/* Philosophy Block */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 mb-12">
          <h2 className="text-xl font-bold text-white mb-3">Multi-Agent System Architecture</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            AI-COS coordinates 11 independent AI agents. Each agent handles a distinct academic subdomain:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400 pl-2">
            <li>• <strong className="text-slate-200">CEO Agent:</strong> Aggregates daily summaries</li>
            <li>• <strong className="text-slate-200">Attendance Agent:</strong> Manages leave ratios</li>
            <li>• <strong className="text-slate-200">Assignment Agent:</strong> Calendars study hours</li>
            <li>• <strong className="text-slate-200">Exam Agent:</strong> Calculates test readiness</li>
            <li>• <strong className="text-slate-200">Notes Agent:</strong> Organizes files & bookmarks</li>
            <li>• <strong className="text-slate-200">Project Agent:</strong> Identifies lagging Kanban tasks</li>
            <li>• <strong className="text-slate-200">Career Agent:</strong> Builds learning roadmaps</li>
            <li>• <strong className="text-slate-200">Placement Agent:</strong> Tracks DSA logs & offers</li>
            <li>• <strong className="text-slate-200">CGPA Agent:</strong> Estimates target GPA points</li>
            <li>• <strong className="text-slate-200">Productivity Agent:</strong> Tabulates Pomodoro logs</li>
          </ul>
        </div>

        {/* Action Panel */}
        <div className="flex justify-between items-center border-t border-white/5 pt-8">
          <div>
            <h3 className="text-base font-bold text-white">Ready to initialize?</h3>
            <p className="text-xs text-slate-500">Takes less than 15 seconds to set up.</p>
          </div>
          <button
            onClick={() => router.push('/auth/register')}
            className="px-5 py-2.5 rounded-lg font-semibold text-sm glass-button flex items-center gap-1.5 cursor-pointer"
          >
            <span>Create Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-8 bg-[#040507]">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-slate-500 text-xs">
          <span>© 2026 AI-COS. Built locally.</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <Link href="/features" className="hover:text-slate-300">Features</Link>
            <Link href="/pricing" className="hover:text-slate-300">Pricing</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
