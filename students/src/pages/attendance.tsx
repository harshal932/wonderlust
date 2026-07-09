import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { 
  Calendar, 
  Check, 
  X, 
  Plus, 
  AlertTriangle, 
  Info,
  Layers,
  Sparkles
} from 'lucide-react'

interface SubjectAttendance {
  subjectId: string
  subjectName: string
  subjectCode: string
  currentPercent: number
  totalClasses: number
  presentCount: number
  absentCount: number
  status: 'SAFE' | 'WARNING' | 'CRITICAL'
  suggestion: string
}

export default function AttendancePage() {
  const { token } = useAuth()
  const [subjects, setSubjects] = useState<SubjectAttendance[]>([])
  const [loading, setLoading] = useState(true)

  // Subject creation inputs
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCode, setNewCode] = useState('')
  const [newCredits, setNewCredits] = useState('3')

  const fetchAttendance = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/attendance', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setSubjects(data.subjects)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchAttendance()
    }
  }, [token])

  const logSession = async (subjectId: string, status: 'PRESENT' | 'ABSENT') => {
    if (!token) return
    try {
      const res = await fetch('/api/attendance/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subjectId,
          status,
          date: new Date().toISOString()
        })
      })
      if (res.ok) {
        fetchAttendance()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newCode) return
    try {
      const res = await fetch('/api/attendance/subject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newName,
          code: newCode,
          credits: parseInt(newCredits)
        })
      })
      if (res.ok) {
        setNewName('')
        setNewCode('')
        setShowAddForm(false)
        fetchAttendance()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getPercentColor = (percent: number) => {
    if (percent >= 80) return 'bg-emerald-500'
    if (percent >= 75) return 'bg-amber-500'
    return 'bg-rose-500'
  }

  const getBadgeColor = (status: string) => {
    if (status === 'SAFE') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    if (status === 'WARNING') return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Loading attendance modules...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-white Outfit">Attendance Auditor</h2>
          <p className="text-xs text-slate-400 mt-1">Audit skip margins, log attendance records and monitor status</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 rounded-lg font-semibold text-xs glass-button flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Subject</span>
        </button>
      </div>

      {/* Add subject form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleAddSubject}
            className="p-5 rounded-2xl glass-panel text-left max-w-lg flex flex-col gap-4"
          >
            <h3 className="text-sm font-bold text-white">Configure New Subject</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Software Testing"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-3 py-1.5 rounded border border-white/10 bg-[#0d101b] text-slate-300 outline-none text-xs"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">CODE</label>
                <input
                  type="text"
                  placeholder="CSE-401"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="px-3 py-1.5 rounded border border-white/10 bg-[#0d101b] text-slate-300 outline-none text-xs"
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">CREDITS</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={newCredits}
                  onChange={(e) => setNewCredits(e.target.value)}
                  className="px-3 py-1.5 rounded border border-white/10 bg-[#0d101b] text-slate-300 outline-none text-xs"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-1.5 rounded text-xs bg-white/5 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded text-xs glass-button"
              >
                Create Course
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Subject cards lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map((sub) => (
          <motion.div
            key={sub.subjectId}
            whileHover={{ y: -2 }}
            className="glass-panel p-6 rounded-2xl text-left flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] text-indigo-400 font-bold tracking-wide">{sub.subjectCode}</span>
                  <h3 className="text-lg font-bold text-white leading-normal mt-0.5">{sub.subjectName}</h3>
                </div>
                <span className={`text-[10px] font-bold border px-2.5 py-0.5 rounded-full ${getBadgeColor(sub.status)}`}>
                  {sub.status}
                </span>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getPercentColor(sub.currentPercent)} transition-all duration-500`}
                    style={{ width: `${sub.currentPercent}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-white w-10 text-right">{sub.currentPercent}%</span>
              </div>

              {/* Log counts */}
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-400 mb-6">
                <div className="bg-white/5 border border-white/5 p-2 rounded-lg text-center">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">PRESENT</span>
                  <span className="text-base font-extrabold text-slate-200">{sub.presentCount} lectures</span>
                </div>
                <div className="bg-white/5 border border-white/5 p-2 rounded-lg text-center">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">ABSENT</span>
                  <span className="text-base font-extrabold text-slate-200">{sub.absentCount} lectures</span>
                </div>
              </div>

              {/* Agent suggestion banner */}
              <div className={`p-3 rounded-xl border flex gap-2.5 items-start text-xs mb-6 ${
                sub.status === 'CRITICAL' 
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' 
                  : sub.status === 'WARNING' 
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' 
                  : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
              }`}>
                {sub.status === 'SAFE' ? (
                  <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                )}
                <span>{sub.suggestion}</span>
              </div>
            </div>

            {/* Quick check actions */}
            <div className="flex gap-2">
              <button
                onClick={() => logSession(sub.subjectId, 'PRESENT')}
                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center gap-1 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Present</span>
              </button>
              <button
                onClick={() => logSession(sub.subjectId, 'ABSENT')}
                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 flex items-center justify-center gap-1 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Mark Absent</span>
              </button>
            </div>

          </motion.div>
        ))}

        {subjects.length === 0 && (
          <div className="col-span-2 py-16 text-center text-slate-500 text-sm">
            No subjects configured yet. Click "New Subject" to get started.
          </div>
        )}
      </div>

    </div>
  )
}
