import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { 
  GraduationCap, 
  Plus, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  BookmarkCheck,
  Award
} from 'lucide-react'

interface Exam {
  id: string
  subjectName: string
  date: string
  time: string | null
  daysLeft: number
  readinessScore: number
  studyPlan: string
}

export default function ExamsPage() {
  const { token } = useAuth()
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)

  const [showAddForm, setShowAddForm] = useState(false)
  const [subjectId, setSubjectId] = useState('')
  const [examDate, setExamDate] = useState('')
  const [examTime, setExamTime] = useState('')
  const [readinessScore, setReadinessScore] = useState('50')
  const [subjects, setSubjects] = useState<{ subjectId: string; name: string }[]>([])

  const fetchExams = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/exams', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setExams(data.exams)
      }
    } catch (err) {
      console.error(err)
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
        setSubjects(data.subjects)
        if (data.subjects.length > 0) {
          setSubjectId(data.subjects[0].subjectId)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (token) {
      fetchExams()
      fetchSubjects()
    }
  }, [token])

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subjectId || !examDate) return
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subjectId,
          date: examDate,
          time: examTime || '09:30 AM',
          readinessScore: parseInt(readinessScore)
        })
      })
      if (res.ok) {
        setExamDate('')
        setExamTime('')
        setShowAddForm(false)
        fetchExams()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdateReadiness = async (id: string, newScore: number) => {
    if (!token) return
    try {
      const res = await fetch(`/api/exams/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ readinessScore: newScore })
      })
      if (res.ok) {
        fetchExams()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
    if (score >= 60) return 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10'
    return 'text-rose-400 border-rose-500/20 bg-rose-500/10'
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Loading exam planner...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-white Outfit">Exam Revision Planner</h2>
          <p className="text-xs text-slate-400 mt-1">Calendar tests, calculate preparation levels and check revision guidelines</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 rounded-lg font-semibold text-xs glass-button flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Exam</span>
        </button>
      </div>

      {/* Add exam form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleCreateExam}
            className="p-5 rounded-2xl glass-panel text-left max-w-lg flex flex-col gap-4"
          >
            <h3 className="text-sm font-bold text-white">Create Exam Revision Block</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">SUBJECT</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="px-2.5 py-1.5 rounded border border-white/10 bg-[#0d101b] text-slate-300 outline-none text-xs"
                  required
                >
                  {subjects.map(sub => (
                    <option value={sub.subjectId} key={sub.subjectId}>{sub.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">INITIAL READINESS (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={readinessScore}
                  onChange={(e) => setReadinessScore(e.target.value)}
                  className="px-3 py-1.5 rounded border border-white/10 bg-[#0d101b] text-slate-300 outline-none text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">EXAM DATE</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="px-3 py-1.5 rounded border border-white/10 bg-[#0d101b] text-slate-300 outline-none text-xs text-slate-300"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">EXAM TIME</label>
                <input
                  type="text"
                  placeholder="e.g. 09:30 AM"
                  value={examTime}
                  onChange={(e) => setExamTime(e.target.value)}
                  className="px-3 py-1.5 rounded border border-white/10 bg-[#0d101b] text-slate-300 outline-none text-xs"
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
                Create Exam
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Exams view list */}
      <div className="flex flex-col gap-6 text-left">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="p-6 rounded-2xl glass-panel flex flex-col md:flex-row justify-between md:items-center gap-6"
          >
            {/* Subject details & Countdown */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{exam.subjectName}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(exam.date).toDateString().slice(4, 15)} • {exam.time}</span>
                  </p>
                </div>
              </div>

              {/* Countdown badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-400 mt-2">
                <Clock className="w-3.5 h-3.5" />
                <span>{exam.daysLeft} days remaining</span>
              </div>
            </div>

            {/* AI Agent advice */}
            <div className="md:w-96 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
              <div className="flex items-center gap-1.5 mb-1.5">
                <BookmarkCheck className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span className="text-[10px] font-bold text-indigo-300 tracking-wider uppercase">Exam Agent Revision Plan</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">{exam.studyPlan}</p>
            </div>

            {/* Preparation meter */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/5 w-36 text-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase mb-2 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-slate-500" />
                <span>Prep Score</span>
              </span>
              <div className="text-2xl font-extrabold text-white mb-2">{exam.readinessScore}%</div>
              
              {/* Controls */}
              <div className="flex gap-1.5">
                <button
                  onClick={() => handleUpdateReadiness(exam.id, Math.max(0, exam.readinessScore - 10))}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-400"
                >
                  -10%
                </button>
                <button
                  onClick={() => handleUpdateReadiness(exam.id, Math.min(100, exam.readinessScore + 10))}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-400"
                >
                  +10%
                </button>
              </div>
            </div>

          </div>
        ))}

        {exams.length === 0 && (
          <div className="py-16 text-center text-slate-500 text-sm">
            No exams registered yet. Click "New Exam" to schedules one.
          </div>
        )}
      </div>

    </div>
  )
}
