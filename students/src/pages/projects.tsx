import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { 
  Layers, 
  Plus, 
  Calendar, 
  CheckSquare, 
  AlertTriangle, 
  Sparkles, 
  Check, 
  ChevronRight,
  TrendingUp
} from 'lucide-react'

interface Task {
  id: string
  title: string
  completed: boolean
}

interface Project {
  id: string
  name: string
  description: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  progress: number
  deadline: string
  tasks: Task[]
}

interface ProjectWarning {
  projectId: string
  projectName: string
  progress: number
  deadline: string
  daysRemaining: number
  uncompletedTasksCount: number
  status: 'SAFE' | 'WARNING' | 'CRITICAL'
  suggestion: string
}

export default function ProjectsPage() {
  const { token } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [warnings, setWarnings] = useState<ProjectWarning[]>([])
  const [loading, setLoading] = useState(true)

  // Project Creation Inputs
  const [showAddForm, setShowAddForm] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [deadline, setDeadline] = useState('')

  // Task Inputs
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const fetchProjects = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setProjects(data.projects)
        setWarnings(data.warnings)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchProjects()
    }
  }, [token])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !deadline) return
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          description: desc,
          priority,
          deadline
        })
      })
      if (res.ok) {
        setName('')
        setDesc('')
        setShowAddForm(false)
        fetchProjects()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdateStatus = async (projectId: string, newStatus: string) => {
    if (!token) return
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        fetchProjects()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddTask = async (e: React.FormEvent, projectId: string) => {
    e.preventDefault()
    if (!token || !newTaskTitle) return
    try {
      const res = await fetch(`/api/projects/${projectId}/task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTaskTitle })
      })
      if (res.ok) {
        setNewTaskTitle('')
        fetchProjects()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleTask = async (projectId: string, taskId: string, completed: boolean) => {
    if (!token) return
    try {
      const res = await fetch(`/api/projects/${projectId}/task/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ completed })
      })
      if (res.ok) {
        fetchProjects()
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

  const columns: { label: string; key: Project['status'] }[] = [
    { label: 'TO DO', key: 'TODO' },
    { label: 'IN PROGRESS', key: 'IN_PROGRESS' },
    { label: 'IN REVIEW', key: 'REVIEW' },
    { label: 'COMPLETED', key: 'COMPLETED' }
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Building Kanban board...</p>
      </div>
    )
  }

  const activeProject = projects.find(p => p.id === activeProjectId)

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-white Outfit">Project Kanban Board</h2>
          <p className="text-xs text-slate-400 mt-1">Track semester projects, coordinate subtasks, and analyze bottleneck delays</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 rounded-lg font-semibold text-xs glass-button flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Add Project Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleCreateProject}
            className="p-5 rounded-2xl glass-panel text-left max-w-lg flex flex-col gap-4"
          >
            <h3 className="text-sm font-bold text-white">Create Kanban Project</h3>
            
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">PROJECT NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Compiler Design Lab"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-3 py-1.5 rounded border border-white/10 bg-[#0d101b] text-slate-300 outline-none text-xs"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">DESCRIPTION</label>
                <textarea
                  placeholder="Summarize scope..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="px-3 py-1.5 rounded border border-white/10 bg-[#0d101b] text-slate-300 outline-none text-xs h-16 resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  Create Project
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Project Agent Warnings */}
      {warnings.some(w => w.status !== 'SAFE') && (
        <div className="flex flex-col gap-2 text-left">
          {warnings.filter(w => w.status !== 'SAFE').map((w, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex gap-2.5 items-start">
              <AlertTriangle className="w-4.5 h-4.5 mt-0.5 text-rose-400 animate-pulse flex-shrink-0" />
              <div>
                <strong className="text-white">Agent Bottleneck Warning ({w.projectName}): </strong>
                <span>{w.suggestion}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start text-left">
        {columns.map((col) => {
          const colProjects = projects.filter(p => p.status === col.key)
          return (
            <div key={col.key} className="glass-panel p-4 rounded-xl flex flex-col gap-3 min-h-[400px]">
              {/* Column Title */}
              <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-1">
                <span className="text-xs font-bold text-slate-300 tracking-wider">{col.label}</span>
                <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-slate-400">
                  {colProjects.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex flex-col gap-3">
                {colProjects.map((proj) => {
                  const doneTasks = proj.tasks.filter(t => t.completed).length
                  const totalTasks = proj.tasks.length
                  return (
                    <motion.div
                      key={proj.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setActiveProjectId(proj.id)}
                      className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded-full ${getPriorityColor(proj.priority)}`}>
                          {proj.priority}
                        </span>
                        
                        {/* Column selector for fast state move */}
                        <select
                          value={proj.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleUpdateStatus(proj.id, e.target.value)}
                          className="text-[9px] px-1 py-0.5 rounded border border-white/10 bg-[#0d101b] text-slate-400 outline-none"
                        >
                          <option value="TODO">TO DO</option>
                          <option value="IN_PROGRESS">WORK</option>
                          <option value="REVIEW">REVIEW</option>
                          <option value="COMPLETED">DONE</option>
                        </select>
                      </div>

                      <h4 className="text-xs font-bold text-white mb-1 truncate">{proj.name}</h4>
                      {proj.description && (
                        <p className="text-[10px] text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                          {proj.description}
                        </p>
                      )}

                      {/* Checklist info */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2.5">
                        <span className="flex items-center gap-1">
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>{doneTasks}/{totalTasks} tasks</span>
                        </span>
                        <span>{proj.progress}%</span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                          style={{ width: `${proj.progress}%` }}
                        ></div>
                      </div>

                    </motion.div>
                  )
                })}
              </div>

            </div>
          )
        })}
      </div>

      {/* Subtasks Detail Modal Drawer (Side layout) */}
      <AnimatePresence>
        {activeProjectId && activeProject && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed top-0 right-0 h-screen w-full sm:w-96 glass-panel p-6 shadow-2xl z-50 text-left flex flex-col justify-between"
            style={{ borderLeft: '1px solid var(--card-border)', background: '#0d101b' }}
          >
            <div>
              {/* Back close trigger */}
              <button
                onClick={() => setActiveProjectId(null)}
                className="mb-6 px-3 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-slate-400 hover:text-white"
              >
                Close Drawer
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded-full ${getPriorityColor(activeProject.priority)}`}>
                  {activeProject.priority}
                </span>
                <span className="text-[10px] text-indigo-400 font-bold uppercase">{activeProject.status}</span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{activeProject.name}</h3>
              {activeProject.description && (
                <p className="text-xs text-slate-400 leading-relaxed mb-6 border-b border-white/5 pb-4">
                  {activeProject.description}
                </p>
              )}

              {/* Subtasks checklists */}
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Sub-Tasks Checklist</h4>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto mb-6 pr-1">
                {activeProject.tasks.map((task) => (
                  <div 
                    key={task.id}
                    className="p-3 rounded-lg bg-white/5 border border-white/5 flex gap-3 items-center hover:bg-white/[0.08] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) => handleToggleTask(activeProject.id, task.id, e.target.checked)}
                      className="rounded bg-white/5 border-white/10 text-indigo-500 focus:ring-indigo-500/20"
                    />
                    <span className={`text-xs text-slate-300 ${task.completed ? 'line-through opacity-50' : ''}`}>
                      {task.title}
                    </span>
                  </div>
                ))}

                {activeProject.tasks.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-500">No subtasks found. Add one below.</div>
                )}
              </div>

              {/* Add task form */}
              <form onSubmit={(e) => handleAddTask(e, activeProject.id)} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New sub-task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg glass-input text-xs"
                  required
                />
                <button
                  type="submit"
                  className="px-3 rounded-lg bg-indigo-500 text-white text-xs font-semibold hover:bg-indigo-600 flex items-center justify-center cursor-pointer"
                >
                  Add
                </button>
              </form>
            </div>

            <div className="text-[10px] text-slate-500 border-t border-white/5 pt-4">
              Checking sub-tasks automatically updates overall project progress metrics.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
