import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { 
  ArrowRight, 
  BrainCircuit, 
  ShieldCheck, 
  Cpu, 
  CalendarCheck, 
  Milestone,
  BookOpen,
  TrendingUp,
  Activity
} from 'lucide-react'

export default function LandingPage() {
  const { user } = useAuth()
  const router = useRouter()

  const features = [
    {
      icon: Cpu,
      title: "11 Specialized AI Agents",
      desc: "Local intelligent agents working in parallel to optimize your study schedule, track grades, audit attendance, and guide DSA practice."
    },
    {
      icon: ShieldCheck,
      title: "100% Local & Private",
      desc: "Runs entirely on your machine. Powered by SQLite and Prisma. No external APIs, no cloud tracking, and zero API key configurations."
    },
    {
      icon: CalendarCheck,
      title: "Smart Leave Planner",
      desc: "Our Attendance Agent tracks classes and calculates exactly how many sessions you can skip or must attend to stay above the 75% bar."
    },
    {
      icon: Milestone,
      title: "Career Architect",
      desc: "Choose your path (AI, Software, DevSecOps, Cloud) and watch the Career Agent formulate dynamic skills trees, course tracks, and resume highlights."
    },
    {
      icon: BookOpen,
      title: "Deep Workspace Notes",
      desc: "A rich markdown note workspace categorized by folders, bookmarked with quick-keys, and fully indexed for local semantic searches."
    },
    {
      icon: TrendingUp,
      title: "Analytics Cockpit",
      desc: "Interactive graphs compile daily study timer logs, Pomodoro focus ratings, task completion vectors, and project velocity alerts."
    }
  ]

  return (
    <div className="min-h-screen text-slate-100 flex flex-col justify-between overflow-x-hidden selection:bg-indigo-500/30">
      
      {/* Dynamic Header */}
      <header className="w-full max-w-7xl mx-auto h-20 px-6 flex items-center justify-between border-b border-white/5 sticky top-0 bg-[#06070a]/65 backdrop-blur-md z-50">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center border border-indigo-400/20 shadow-lg shadow-indigo-500/20">
              <BrainCircuit className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="font-bold text-xl tracking-wider text-white">AI-COS</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/about" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">About</Link>
          <Link href="/features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</Link>
          <Link href="/pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</Link>
        </nav>

        <div>
          {user ? (
            <button
              onClick={() => router.push('/dashboard')}
              className="px-5 py-2 rounded-lg font-medium text-sm glass-button flex items-center gap-1.5 cursor-pointer"
            >
              <span>Go to Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/auth/login')}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/auth/register')}
                className="px-5 py-2 rounded-lg font-medium text-sm glass-button flex items-center gap-1.5 cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 md:py-24 flex flex-col items-center text-center relative">
        {/* Background glow orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-xs font-semibold text-indigo-300 mb-6 tracking-wide">
            <Activity className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
            <span>OPERATING SYSTEM READY FOR ACADEMIC TERM</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight Outfit">
            The AI-Powered <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 font-extrabold">
              Student Operating System
            </span>
          </h2>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
            Manage attendance, grade forecasts, LeetCode progress, project Kanban, and Pomodoro timers in a privacy-first local workspace coordinated by 11 system agents.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg text-base font-semibold glass-button flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Enter Personal Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push('/auth/register')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-lg text-base font-semibold glass-button flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Build Your Workspace</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => router.push('/features')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-lg text-base font-semibold glass-button-secondary flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Explore Features</span>
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Dashboard Mockup Grid Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-5xl mt-16 md:mt-24 glass-panel rounded-2xl p-4 md:p-6 relative overflow-hidden"
          style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          {/* Floating decorative elements */}
          <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-rose-500/60"></div>
          <div className="absolute top-2 left-6 w-3 h-3 rounded-full bg-amber-500/60"></div>
          <div className="absolute top-2 left-10 w-3 h-3 rounded-full bg-emerald-500/60"></div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Widget 1: Attendance */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold tracking-wide text-slate-400">ATTENDANCE AGENT</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">SAFE</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Mathematics (MTH-101)</h3>
              <p className="text-sm text-slate-400 mb-3">Present: 18 | Absent: 4 (81%)</p>
              <div className="text-[11px] p-2 rounded bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20">
                Agent: You can safely skip the next 2 classes.
              </div>
            </div>

            {/* Widget 2: CEO Digest */}
            <div className="p-4 rounded-xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-left md:scale-105 shadow-xl shadow-indigo-500/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">CEO</div>
                <span className="text-xs font-bold tracking-wide text-slate-200">DAILY OS BRIEF</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                "Daily focus score is high (88%). All project Kanban boards are active, but Attendance in Physics needs attention."
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-2">
                <span>Productivity Index: 88%</span>
                <span>Active Alerts: 1</span>
              </div>
            </div>

            {/* Widget 3: Placement */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold tracking-wide text-slate-400">PLACEMENT TRACKER</span>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">INTERVIEWING</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Amazon Application</h3>
              <p className="text-sm text-slate-400 mb-3">LeetCode DSA: 42 Solved</p>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: '42%' }}></div>
              </div>
            </div>

          </div>
        </motion.div>
      </section>

      {/* Features Grid Section */}
      <section className="w-full max-w-7xl mx-auto px-6 py-20 border-t border-white/5 relative">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 Outfit">
            Engineered for Academic Mastery
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Explore the feature modules powered by rule-based agent logic, custom-built for students aiming to maximize productivity, track achievements, and plan careers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 text-left transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Local-First Tech Section */}
      <section className="w-full max-w-5xl mx-auto px-6 py-16 mb-16 rounded-2xl bg-gradient-to-r from-indigo-950/20 via-purple-950/15 to-transparent border border-white/5 text-left flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 Outfit">
            Local-First. Zero API Keys.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            AI-COS is engineered to run entirely on your local machine using SQLite and Prisma ORM. No OpenAI keys required, no usage limits, no telemetry, and zero network calls to cloud models. All agent systems run on rule-based logical engines, perfectly modularized and ready for future Gemini or Google ADK 2.0 API integrations.
          </p>
        </div>
        
        <div className="flex-shrink-0">
          <button
            onClick={() => router.push('/auth/register')}
            className="px-6 py-3 rounded-lg font-semibold text-sm glass-button flex items-center gap-1.5 cursor-pointer"
          >
            <span>Initialize Your Local OS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-8 bg-[#040507]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-indigo-400" />
            <span>© 2026 AI College Operating System (AI-COS). Local-First System.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-slate-300 transition-colors">About</Link>
            <Link href="/features" className="hover:text-slate-300 transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-slate-300 transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
