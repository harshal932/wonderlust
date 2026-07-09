import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  BrainCircuit, 
  ArrowLeft, 
  CalendarCheck, 
  FileSpreadsheet, 
  StickyNote, 
  GraduationCap, 
  Layers, 
  Briefcase, 
  Milestone, 
  LineChart, 
  Activity, 
  Clock 
} from 'lucide-react'

export default function FeaturesPage() {
  const router = useRouter()

  const modules = [
    {
      icon: CalendarCheck,
      title: "Attendance Tracker",
      desc: "Log daily lecture attendance. The Attendance Agent calculates skipping margins and alerts you if you drop near the 75% critical cutoff."
    },
    {
      icon: FileSpreadsheet,
      title: "Assignment Manager",
      desc: "Add homework tasks and priority status. The Assignment Agent ranks priorities and recommends study schedules for approaching due dates."
    },
    {
      icon: StickyNote,
      title: "Markdown Notebook",
      desc: "Take classroom notes in a rich layout, group by folders, bookmark formulas, and search through entries with local index queries."
    },
    {
      icon: GraduationCap,
      title: "Exam Planner",
      desc: "Build subject exam schedules, maintain syllabus checklists, and inspect readiness predictions generated based on your past study logs."
    },
    {
      icon: Layers,
      title: "Project Kanban Board",
      desc: "Create software projects, coordinate checklists, and inspect task bottlenecks. The Project Agent raises flags for lagging milestones."
    },
    {
      icon: Briefcase,
      title: "Placement Tracker",
      desc: "Track solved LeetCode challenges, application funnels (applied, interviewing, offered), and get resume ratings and interview tips."
    },
    {
      icon: Milestone,
      title: "Career Architect",
      desc: "Explore roadmaps for AI Engineer, Cloud Architect, Data Scientist, or Web Dev. Evaluates current progress and lists recommended projects."
    },
    {
      icon: LineChart,
      title: "CGPA Predictor",
      desc: "Input expected semester marks. The CGPA Agent computes semester GPAs, forecasts overall CGPAs, and states grades required for targets."
    },
    {
      icon: Clock,
      title: "Pomodoro Focus Timer",
      desc: "Log study hours using standard 25-minute Pomodoro intervals. Feeds focus logs into the Productivity Agent to update focus scores."
    }
  ]

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
          <Link href="/pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</Link>
        </nav>
      </header>

      {/* Main Body */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-16 text-left">
        
        {/* Back Link */}
        <button
          onClick={() => router.push('/')}
          className="mb-8 px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>

        <div className="text-center md:text-left mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 Outfit tracking-tight">
            System Modules
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl">
            Explore the specialized academic widgets integrated directly within your student dashboard.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {modules.map((mod, idx) => {
            const Icon = mod.icon
            return (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{mod.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{mod.desc}</p>
              </div>
            )
          })}
        </div>

        {/* Bottom Banner */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-indigo-950/25 to-purple-950/20 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Ready to optimize your semester?</h3>
            <p className="text-xs text-slate-400">Get your personal local dashboard up and running in seconds.</p>
          </div>
          <button
            onClick={() => router.push('/auth/register')}
            className="px-6 py-3 rounded-lg font-semibold text-sm glass-button cursor-pointer"
          >
            Get Started Now
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-8 bg-[#040507]">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-slate-500 text-xs">
          <span>© 2026 AI-COS. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <Link href="/about" className="hover:text-slate-300">About</Link>
            <Link href="/pricing" className="hover:text-slate-300">Pricing</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
