import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { 
  FileSpreadsheet, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Check,
  Play
} from 'lucide-react'

interface Assignment {
  id: string
  title: string
  subjectName: string
  deadline: string
  daysRemaining: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  status: string
  agentPriorityScore: number
  actionPlan: string
}

export default function AssignmentsPage() {
  const { token } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [title, setTitle] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [subjects, setSubjects] = useState<{ subjectId: string; name: string }[]>([])

  const fetchAssignments = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/assignments', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setAssignments(data.assignments)
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
      fetchAssignments()
      fetchSubjects()
    }
  }, [token])

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!token) return
    try {
      const res = await fetch(`/api/assignments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        fetchAssignments()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !subjectId || !deadline) return
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          subjectId,
          deadline,
          priority
        })
      })
      if (res.ok) {
        setTitle('')
        setShowAddForm(false)
        fetchAssignments()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getPriorityColor = (p: string) => {
    if (p === 'HIGH') return 'text-rose-400 border-rose-500/20 bg-rose-500/10'
    if (p === 'MEDIUM') return 'text-amber-400 border-amber-500/20 bg-amber-500/10'
    return 'text-slate-400 border-white/10 bg-white/5'
  }

  const activeTasks = assignments.filter(a => a.status !== 'COMPLETED')
  const completedTasks = assignments.filter(a => a.status === 'COMPLETED')

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Loading assignments manager...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-white Outfit">Assignment Manager</h2>
          <p className="text-xs text-slate-400 mt-1">Prioritize work, track course deadlines and allocate study periods</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 rounded-lg font-semibold text-xs glass-button flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleCreateAssignment}
            className="p-5 rounded-2xl glass-panel text-left max-w-lg flex flex-col gap-4"
          >
            <h3 className="text-sm font-bold text-white">Create New Homework Task</h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">TASK TITLE</label>
                <input
                  type="text"
                  placeholder="e.g. Write lab reports 3"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-3 py-1.5 rounded border border-white/10 bg-[#0d101b] text-slate-300 outline-none text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold">COURSE</label>
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
                  <label className="text-[10px] text-slate-400 font-bold">PRIORITY</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
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
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="px-3 py-1.5 rounded border border-white/10 bg-[#0d101b] text-slate-300 outline-none text-xs text-slate-300"
                  required
                />
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
                  Create Task
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Assignments list - 2 columns */}
        <div className="lg:col-span-2 flex flex-col gap-6 text-left">
          
          {/* Active assignments */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">ACTIVE TASKS ({activeTasks.length})</h3>
            <div className="flex flex-col gap-3">
              {activeTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-5 rounded-2xl glass-panel flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-indigo-500/20"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                        {task.subjectName}
                      </span>
                      <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white leading-normal">{task.title}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Due in {task.daysRemaining} days ({new Date(task.deadline).toDateString().slice(4, 15)})</span>
                    </p>
                  </div>

                  <div className="flex gap-2.5">
                    {task.status === 'PENDING' ? (
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'IN_PROGRESS')}
                        className="px-3 py-1.5 rounded text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Work</span>
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/5 px-3 py-1.5 rounded border border-indigo-500/10 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>In Progress</span>
                      </span>
                    )}

                    <button
                      onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                      className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                      title="Mark Complete"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {activeTasks.length === 0 && (
                <div className="p-8 rounded-2xl border border-white/5 bg-white/5 text-center text-xs text-slate-500">
                  No active assignments. Relax or prepare early!
                </div>
              )}
            </div>
          </div>

          {/* Completed assignments */}
          {completedTasks.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">COMPLETED ({completedTasks.length})</h3>
              <div className="flex flex-col gap-3">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 opacity-60 flex justify-between items-center"
                  >
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold">{task.subjectName}</span>
                      <h4 className="text-xs font-bold text-slate-300 line-through mt-0.5">{task.title}</h4>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Done</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Priority Scheduler Panel - 1 column */}
        <div className="glass-panel p-6 rounded-2xl text-left h-fit flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Study Session planner</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-2">
            The Assignment Agent evaluates deadlines and recommends study durations to prevent last-minute rushes:
          </p>

          <div className="flex flex-col gap-3.5">
            {activeTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white truncate max-w-[140px]">{task.title}</span>
                  <span className="text-[9px] text-indigo-300 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded">
                    Rank {task.agentPriorityScore}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-300/90 leading-relaxed bg-indigo-500/5 p-2 rounded border border-indigo-500/10">
                  {task.actionPlan}
                </p>
              </div>
            ))}

            {activeTasks.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-500">No scheduled study sessions.</div>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}
