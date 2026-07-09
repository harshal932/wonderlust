import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import {
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  BookOpen,
  Award,
  AlertCircle,
  Briefcase,
  Play,
  Pause,
  RotateCcw,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react'

interface CEODigest {
  advisorSummary: string
  priorityInsights: string[]
  criticalAlertsCount: number
  stats: {
    overallAttendance: number
    attendanceStatus: 'SAFE' | 'WARNING' | 'CRITICAL'
    pendingAssignments: number
    upcomingExamsCount: number
    activeProjectsCount: number
    focusScore: number
    dsaSolvedCount: number
    careerProgress: number
  }
}

export default function Dashboard() {
  const { user, token } = useAuth()
  const router = useRouter()

  const [digest, setDigest] = useState<CEODigest | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Pomodoro States
  const [timerMinutes, setTimerMinutes] = useState(25)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [timerType, setTimerType] = useState<'FOCUS' | 'BREAK'>('FOCUS')
  const [timerSubject, setTimerSubject] = useState('Mathematics')
  const [studySubjects, setStudySubjects] = useState<{ subjectId: string; name: string }[]>([])

  // Quick Action States
  const [showLogAttendance, setShowLogAttendance] = useState(false)
  const [logSubjectId, setLogSubjectId] = useState('')
  const [logStatus, setLogStatus] = useState('PRESENT')

  const [showAddAssignment, setShowAddAssignment] = useState(false)
  const [newAssignTitle, setNewAssignTitle] = useState('')
  const [newAssignSubject, setNewAssignSubject] = useState('')
  const [newAssignDeadline, setNewAssignDeadline] = useState('')
  const [newAssignPriority, setNewAssignPriority] = useState('MEDIUM')

  const fetchDashboard = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setDigest(data)
      }
    } catch (err) {
      console.error('Failed to load dashboard digest:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/attendance', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        // Normalize: API returns subjectName but state type expects name
        const normalized = (data.subjects || []).map((s: any) => ({
          subjectId: s.subjectId,
          name: s.subjectName || s.name || 'Unnamed Subject'
        }))
        setStudySubjects(normalized)
        if (normalized.length > 0) {
          setLogSubjectId(normalized[0].subjectId)
          setNewAssignSubject(normalized[0].subjectId)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (token) {
      fetchDashboard()
      fetchSubjects()
    }
  }, [token])

  // Pomodoro Interval Logic
  useEffect(() => {
    let interval: any = null
    if (timerActive) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds(timerSeconds - 1)
        } else if (timerSeconds === 0) {
          if (timerMinutes > 0) {
            setTimerMinutes(timerMinutes - 1)
            setTimerSeconds(59)
          } else {
            // Timer finished
            handleTimerComplete()
          }
        }
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [timerActive, timerMinutes, timerSeconds])

  const handleTimerComplete = async () => {
    setTimerActive(false)
    if (timerType === 'FOCUS') {
      alert(`Great work! Focus session for ${timerSubject} completed. Logging focus session.`)
      // Log to server
      if (token) {
        try {
          await fetch('/api/productivity/log', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              duration: 25,
              focusScore: 90,
              activity: `Pomodoro Focus Block: ${timerSubject}`
            })
          })
          fetchDashboard()
        } catch (err) {
          console.error(err)
        }
      }
      setTimerType('BREAK')
      setTimerMinutes(5)
      setTimerSeconds(0)
    } else {
      alert("Break is over! Time to get back to deep work.")
      setTimerType('FOCUS')
      setTimerMinutes(25)
      setTimerSeconds(0)
    }
  }

  const logAttendanceAction = async () => {
    if (!token || !logSubjectId) return
    try {
      const res = await fetch('/api/attendance/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subjectId: logSubjectId,
          status: logStatus,
          date: new Date().toISOString()
        })
      })
      if (res.ok) {
        alert('Attendance logged successfully!')
        setShowLogAttendance(false)
        fetchDashboard()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const addAssignmentAction = async () => {
    if (!token || !newAssignTitle || !newAssignSubject || !newAssignDeadline) {
      alert('Please fill in all assignment details.')
      return
    }
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newAssignTitle,
          deadline: newAssignDeadline,
          priority: newAssignPriority,
          subjectId: newAssignSubject
        })
      })
      if (res.ok) {
        alert('Assignment added successfully!')
        setNewAssignTitle('')
        setShowAddAssignment(false)
        fetchDashboard()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getAttendanceStatusColor = (status: string) => {
    if (status === 'SAFE') return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
    if (status === 'WARNING') return 'text-amber-400 border-amber-500/20 bg-amber-500/10'
    return 'text-rose-400 border-rose-500/20 bg-rose-500/10'
  }

  if (loading || !digest) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Compiling workspace data...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      
      {/* 1. CEO Agent Briefing Dashboard Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 rounded-2xl relative overflow-hidden bg-gradient-to-tr from-indigo-950/20 via-purple-950/15 to-transparent"
        style={{ border: '1px solid rgba(99, 102, 241, 0.2)' }}
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Brain className="w-48 h-48 text-indigo-400" />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-indigo-300 tracking-wider uppercase">CEO Agent Recommendations</span>
            <h2 className="text-sm font-semibold text-slate-400">Master Academic Advisor</h2>
          </div>
        </div>

        <p className="text-slate-200 text-sm leading-relaxed mb-6 font-medium italic border-l-2 border-indigo-500/40 pl-4">
          "{digest.advisorSummary}"
        </p>

        {/* Actionable items */}
        <div className="flex flex-col gap-2.5">
          {digest.priorityInsights.map((insight, idx) => (
            <div key={idx} className="flex gap-3 items-start text-xs text-slate-300 bg-white/5 border border-white/5 p-3 rounded-lg hover:bg-white/[0.08] hover:border-white/10 transition-colors">
              <CheckCircle className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 2. Grid Dashboard Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Attendance widget */}
        <div 
          onClick={() => router.push('/attendance')}
          className="p-5 rounded-2xl glass-panel text-left flex flex-col justify-between h-36 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Overall Attendance</span>
            <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${getAttendanceStatusColor(digest.stats.attendanceStatus)}`}>
              {digest.stats.attendanceStatus}
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-white">{digest.stats.overallAttendance}%</h3>
            <p className="text-[10px] text-slate-500 mt-1">Required: 75% for semesters</p>
          </div>
        </div>

        {/* Focus Score widget */}
        <div className="p-5 rounded-2xl glass-panel text-left flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Daily Focus Score</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-white">{digest.stats.focusScore}/100</h3>
            <p className="text-[10px] text-slate-500 mt-1">Calculated from Pomodoro logs</p>
          </div>
        </div>

        {/* Pending Assignments widget */}
        <div 
          onClick={() => router.push('/assignments')}
          className="p-5 rounded-2xl glass-panel text-left flex flex-col justify-between h-36 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pending Assignments</span>
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-white">{digest.stats.pendingAssignments}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Click to view work tasks</p>
          </div>
        </div>

        {/* LeetCode DSA tracker widget */}
        <div 
          onClick={() => router.push('/placements')}
          className="p-5 rounded-2xl glass-panel text-left flex flex-col justify-between h-36 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">LeetCode DSA Solved</span>
            <Briefcase className="w-4 h-4 text-pink-400" />
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-white">{digest.stats.dsaSolvedCount}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Goal progress: {digest.stats.careerProgress}%</p>
          </div>
        </div>

      </div>

      {/* 3. Timer & Quick Action Center */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Deep Pomodoro Study Timer Widget */}
        <div className="glass-panel p-6 rounded-2xl text-left md:col-span-2 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-44 h-44 bg-indigo-500/5 blur-[50px] rounded-full pointer-events-none"></div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Pomodoro Deep Focus</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={timerSubject}
                onChange={(e) => setTimerSubject(e.target.value)}
                className="px-2.5 py-1 text-xs rounded border border-white/10 bg-[#0d101b] text-slate-300 outline-none"
              >
                {studySubjects.map(sub => (
                  <option value={sub.name} key={sub.subjectId}>{sub.name}</option>
                ))}
                {studySubjects.length === 0 && <option value="General Study">General Study</option>}
              </select>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-6">
            <span className="text-6xl md:text-7xl font-extrabold text-white tracking-widest tabular-nums Outfit bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-300">
              {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
            </span>
            <span className="text-xs text-indigo-300 mt-2 font-bold tracking-wider uppercase">
              {timerType === 'FOCUS' ? 'DEEP WORK CYCLE' : 'BREAK PERIOD'}
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setTimerActive(!timerActive)}
              className="px-6 py-2 rounded-lg font-semibold text-xs glass-button flex items-center gap-1.5 cursor-pointer"
            >
              {timerActive ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Deep Study</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setTimerActive(false)
                setTimerMinutes(timerType === 'FOCUS' ? 25 : 5)
                setTimerSeconds(0)
              }}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="glass-panel p-6 rounded-2xl text-left flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              <span>Workspace Actions</span>
            </h3>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowLogAttendance(true)
                  setShowAddAssignment(false)
                }}
                className="w-full text-left p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 hover:bg-white/[0.08] transition-colors flex justify-between items-center"
              >
                <span>Record Daily Class Attendance</span>
                <ArrowRight className="w-4 h-4 text-indigo-400" />
              </button>

              <button
                onClick={() => {
                  setShowAddAssignment(true)
                  setShowLogAttendance(false)
                }}
                className="w-full text-left p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 hover:bg-white/[0.08] transition-colors flex justify-between items-center"
              >
                <span>Add Pending Homework Task</span>
                <ArrowRight className="w-4 h-4 text-purple-400" />
              </button>

              <button
                onClick={() => router.push('/notes')}
                className="w-full text-left p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 hover:bg-white/[0.08] transition-colors flex justify-between items-center"
              >
                <span>Create New Rich-Text Note</span>
                <ArrowRight className="w-4 h-4 text-pink-400" />
              </button>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 mt-4 border-t border-white/5 pt-4">
            AI-COS is fully operational locally. All changes sync directly to SQLite.
          </div>
        </div>

      </div>

      {/* 4. Action Modals Dropdowns (Conditional Render) */}
      <AnimatePresence>
        {showLogAttendance && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="p-5 rounded-xl glass-panel text-left max-w-md"
          >
            <h3 className="text-sm font-bold text-white mb-3">Record Lecture Attendance</h3>
            <div className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold">COURSE</label>
                  <select
                    value={logSubjectId}
                    onChange={(e) => setLogSubjectId(e.target.value)}
                    className="px-2.5 py-1.5 rounded border border-white/10 bg-[#0d101b] text-slate-300 outline-none text-xs"
                  >
                    {studySubjects.map(sub => (
                      <option value={sub.subjectId} key={sub.subjectId}>{sub.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold">STATUS</label>
                  <select
                    value={logStatus}
                    onChange={(e) => setLogStatus(e.target.value)}
                    className="px-2.5 py-1.5 rounded border border-white/10 bg-[#0d101b] text-slate-300 outline-none text-xs"
                  >
                    <option value="PRESENT">PRESENT</option>
                    <option value="ABSENT">ABSENT</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2.5 mt-2">
                <button
                  onClick={() => setShowLogAttendance(false)}
                  className="px-4 py-1.5 rounded text-xs bg-white/5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={logAttendanceAction}
                  className="px-4 py-1.5 rounded text-xs glass-button"
                >
                  Log Log
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {showAddAssignment && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="p-5 rounded-xl glass-panel text-left max-w-md"
          >
            <h3 className="text-sm font-bold text-white mb-3">Add Pending Assignment</h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">TITLE</label>
                <input
                  type="text"
                  placeholder="e.g. Solve assignment 2 sheets"
                  value={newAssignTitle}
                  onChange={(e) => setNewAssignTitle(e.target.value)}
                  className="px-3 py-1.5 rounded border border-white/10 bg-[#0d101b] text-slate-300 outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold">SUBJECT</label>
                  <select
                    value={newAssignSubject}
                    onChange={(e) => setNewAssignSubject(e.target.value)}
                    className="px-2.5 py-1.5 rounded border border-white/10 bg-[#0d101b] text-slate-300 outline-none text-xs"
                  >
                    {studySubjects.map(sub => (
                      <option value={sub.subjectId} key={sub.subjectId}>{sub.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold">PRIORITY</label>
                  <select
                    value={newAssignPriority}
                    onChange={(e) => setNewAssignPriority(e.target.value)}
                    className="px-2.5 py-1.5 rounded border border-white/10 bg-[#0d101b] text-slate-300 outline-none text-xs"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">DEADLINE</label>
                <input
                  type="date"
                  value={newAssignDeadline}
                  onChange={(e) => setNewAssignDeadline(e.target.value)}
                  className="px-3 py-1.5 rounded border border-white/10 bg-[#0d101b] text-slate-300 outline-none text-xs text-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2.5 mt-2">
                <button
                  onClick={() => setShowAddAssignment(false)}
                  className="px-4 py-1.5 rounded text-xs bg-white/5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={addAssignmentAction}
                  className="px-4 py-1.5 rounded text-xs glass-button"
                >
                  Add Assignment
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Static Timeline Agenda */}
      <div className="glass-panel p-6 rounded-2xl text-left">
        <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <span>Today's Academic Agenda</span>
        </h3>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-start pb-4 border-b border-white/5">
            <span className="text-xs text-slate-500 font-semibold w-16 flex-shrink-0">09:30 AM</span>
            <div>
              <h4 className="text-xs font-bold text-white">Mathematics Lecture</h4>
              <p className="text-[10px] text-slate-500">Room 402 • Credits: 4</p>
            </div>
          </div>

          <div className="flex gap-4 items-start pb-4 border-b border-white/5">
            <span className="text-xs text-slate-500 font-semibold w-16 flex-shrink-0">11:15 AM</span>
            <div>
              <h4 className="text-xs font-bold text-white">Computer Programming Lab</h4>
              <p className="text-[10px] text-slate-500">Lab CSE-3 • Credits: 4</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <span className="text-xs text-indigo-400 font-semibold w-16 flex-shrink-0">02:30 PM</span>
            <div>
              <h4 className="text-xs font-bold text-white">Physics Deep Focus Blocks</h4>
              <p className="text-[10px] text-indigo-300">Pomodoro Study recommendation from Assignment Agent</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
