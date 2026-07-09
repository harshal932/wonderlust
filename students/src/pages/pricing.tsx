import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { BrainCircuit, ArrowLeft, ShieldAlert, Sparkles, Check } from 'lucide-react'

export default function PricingPage() {
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
          <Link href="/about" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">About</Link>
          <Link href="/features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</Link>
        </nav>
      </header>

      {/* Main Body */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-16 text-center">
        
        {/* Back Link */}
        <button
          onClick={() => router.push('/')}
          className="mx-auto mb-8 px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-400/20 text-xs font-semibold text-pink-300 mb-6 tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>COMING SOON</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 Outfit tracking-tight">
          Pricing Plans
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto mb-12">
          AI-COS is open-source and free for personal, local use. We will be launching premium synchronization features and team features in future iterations.
        </p>

        {/* Pricing Cards Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto text-left mb-12">
          
          {/* Free Tier */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 relative">
            <h3 className="text-lg font-bold text-white mb-1">Local Core</h3>
            <p className="text-xs text-slate-400 mb-4">Perfect for individual study planning.</p>
            <div className="text-3xl font-extrabold text-white mb-6">
              $0 <span className="text-xs text-slate-500 font-medium">/ forever</span>
            </div>
            
            <ul className="text-xs text-slate-300 flex flex-col gap-3.5 border-t border-white/5 pt-6 mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-400" />
                <span>All 11 local AI agents active</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-400" />
                <span>Unlimited SQLite subjects & data</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-400" />
                <span>Pomodoro deep study logs</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-400" />
                <span>Private local markdown notebooks</span>
              </li>
            </ul>

            <button
              onClick={() => router.push('/auth/register')}
              className="w-full py-2 rounded-lg text-xs font-semibold glass-button-secondary cursor-pointer"
            >
              Get Started Free
            </button>
          </div>

          {/* Premium Tier */}
          <div className="p-6 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 relative overflow-hidden shadow-2xl shadow-indigo-500/5">
            <div className="absolute top-3 right-3 text-[9px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/20">PREMIUM</div>
            
            <h3 className="text-lg font-bold text-white mb-1">Cloud Sync</h3>
            <p className="text-xs text-slate-400 mb-4">Back up data across browser devices.</p>
            <div className="text-3xl font-extrabold text-white mb-6">
              $5 <span className="text-xs text-slate-500 font-medium">/ month</span>
            </div>
            
            <ul className="text-xs text-slate-300 flex flex-col gap-3.5 border-t border-white/5 pt-6 mb-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-400" />
                <span>Cross-device cloud database sync</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-400" />
                <span>Google Drive / Notion Notes Export</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-400" />
                <span>Collaborative team project Kanban</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-400" />
                <span>Advanced LLM models plug-in support</span>
              </li>
            </ul>

            <button
              disabled
              className="w-full py-2 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-8 bg-[#040507]">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-slate-500 text-xs">
          <span>© 2026 AI-COS. Built locally.</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <Link href="/about" className="hover:text-slate-300">About</Link>
            <Link href="/features" className="hover:text-slate-300">Features</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
