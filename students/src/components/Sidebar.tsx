import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import {
  LayoutDashboard,
  CalendarCheck,
  FileSpreadsheet,
  StickyNote,
  GraduationCap,
  Layers,
  Briefcase,
  Milestone,
  LineChart,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BrainCircuit
} from 'lucide-react'

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const { user, logout } = useAuth()

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
    { label: 'Assignments', path: '/assignments', icon: FileSpreadsheet },
    { label: 'Notes', path: '/notes', icon: StickyNote },
    { label: 'Exams', path: '/exams', icon: GraduationCap },
    { label: 'Projects', path: '/projects', icon: Layers },
    { label: 'Placements', path: '/placements', icon: Briefcase },
    { label: 'Career Planner', path: '/career', icon: Milestone },
    { label: 'CGPA Predictor', path: '/cgpa', icon: LineChart },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
  ]

  return (
    <motion.div
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen sticky top-0 left-0 glass-panel flex flex-col justify-between py-6 px-4 z-40"
      style={{ borderRight: '1px solid var(--card-border)' }}
    >
      <div>
        {/* Logo Section */}
        <div className="flex items-center justify-between mb-8 px-2">
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400"
            >
              <BrainCircuit className="w-6 h-6 text-indigo-400 animate-pulse" />
              <span>AI-COS</span>
            </motion.div>
          )}
          {isCollapsed && (
            <BrainCircuit className="w-8 h-8 text-indigo-400 animate-pulse mx-auto" />
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Brief Card */}
        {!isCollapsed && user && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-3 rounded-xl bg-white/5 border border-white/5"
          >
            <div className="text-sm font-semibold text-white truncate">{user.name}</div>
            <div className="text-xs text-indigo-300 font-medium truncate mt-0.5">{user.branch}</div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] text-slate-400">
              <span>Sem {user.semester || 1}</span>
              <span>GPA: {user.productivityScore ? (user.productivityScore / 10).toFixed(1) : '8.5'} Focus</span>
            </div>
          </motion.div>
        )}

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive = router.pathname === item.path
            const Icon = item.icon
            return (
              <Link href={item.path} key={item.path} style={{ textDecoration: 'none' }}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-l-2 border-indigo-400 text-white font-medium shadow-inner'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Logout button */}
      <div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </motion.div>
  )
}
