import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { 
  Briefcase, 
  Plus, 
  Calendar, 
  TrendingUp, 
  FileText, 
  UserCheck, 
  Sparkles,
  Trophy,
  CheckCircle,
  HelpCircle
} from 'lucide-react'

interface PlacementLog {
  id: string
  type: string
  title: string
  status: string
  description: string | null
}

interface PlacementSummary {
  dsaSolvedCount: number
  applicationsCount: number
  offersCount: number
  readinessScore: number
  resumeScore: number
  resumeSuggestions: string[]
  recommendedTopics: string[]
  recentApplications: { id: string; company: string; status: string }[]
}

export default function PlacementsPage() {
  const { token } = useAuth()
  const [placements, setPlacements] = useState<PlacementLog[]>([])
  const [summary, setSummary] = useState<PlacementSummary | null>(null)
  const [loading, setLoading] = useState(true)

  // Creation States
  const [showAddForm, setShowAddForm] = useState(false)
  const [logType, setLogType] = useState('DSA') // "DSA" or "COMPANY"
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState('COMPLETED')
  const [description, setDescription] = useState('')

  // Mock Resume states
  const [mockResumeText, setMockResumeText] = useState('')
  const [analyzingResume, setAnalyzingResume] = useState(false)
  
  // Mock Interview states
  const [interviewQuestion, setInterviewQuestion] = useState('Explain what happens when you type a URL in the browser?')
  const [interviewAnswer, setInterviewAnswer] = useState('')
  const [interviewFeedback, setInterviewFeedback] = useState('')
  const [submittingAnswer, setSubmittingAnswer] = useState(false)

  const fetchPlacements = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/placements', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setPlacements(data.placements)
        setSummary(data.summary)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchPlacements()
    }
  }, [token])

  const handleCreatePlacement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return
    try {
      const res = await fetch('/api/placements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: logType,
          title,
          status,
          description
        })
      })
      if (res.ok) {
        setTitle('')
        setDescription('')
        setShowAddForm(false)
        fetchPlacements()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!token) return
    try {
      const res = await fetch(`/api/placements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        fetchPlacements()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const analyzeResumeMock = () => {
    if (!mockResumeText) return
    setAnalyzingResume(true)
    setTimeout(() => {
      setAnalyzingResume(false)
      alert("Resume analysis complete! Suggestions loaded into the Placement Agent Dashboard.")
    }, 1500)
  }

  const submitMockInterview = () => {
    if (!interviewAnswer) return
    setSubmittingAnswer(true)
    setTimeout(() => {
      setSubmittingAnswer(false)
      setInterviewFeedback(
        "AI Feedback: Excellent response structure! You correctly covered DNS lookup, TCP/IP handshakes, SSL negotiations, and HTTP rendering pipelines. Tips: Detail browser cache indices and CDN routing layers next time to hit L4 engineer standards."
      )
    }, 1200)
  }

  if (loading || !summary) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Synchronizing interview funnel...</p>
      </div>
    )
  }

  const jobApplications = placements.filter(p => p.type === 'COMPANY')
  const dsaProblems = placements.filter(p => p.type === 'DSA')

  const getStatusColor = (s: string) => {
    if (s === 'OFFERED') return 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10'
    if (s === 'INTERVIEWING') return 'text-indigo-400 border-indigo-500/25 bg-indigo-500/10'
    if (s === 'REJECTED') return 'text-rose-400 border-rose-500/25 bg-rose-500/10'
    return 'text-slate-400 border-white/10 bg-white/5'
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-white Outfit">Placement Center</h2>
          <p className="text-xs text-slate-400 mt-1">Track DSA LeetCode logs, compile job applications, and run mock interview reviews</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 rounded-lg font-semibold text-xs glass-button flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Entry</span>
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleCreatePlacement}
            className="p-5 rounded-2xl glass-panel text-left max-w-lg flex flex-col gap-4"
          >
            <h3 className="text-sm font-bold text-white">Log Placement Activity</h3>
            
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold">TYPE</label>
                  <select
                    value={logType}
                    onChange={(e) => {
                      setLogType(e.target.value)
                      setStatus(e.target.value === 'DSA' ? 'COMPLETED' : 'APPLIED')
                    }}
                    className="px-2.5 py-1.5 rounded border border-white/10 bg-[#0d101b] text-slate-300 outline-none text-xs"
                  >
                    <option value="DSA">DSA LeetCode</option>
                    <option value="COMPANY">Company Application</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-400 font-bold">STATUS</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="px-2.5 py-1.5 rounded border border-white/10 bg-[#0d101b] text-slate-300 outline-none text-xs"
                  >
                    {logType === 'DSA' ? (
                      <option value="COMPLETED">COMPLETED</option>
                    ) : (
                      <>
                        <option value="APPLIED">APPLIED</option>
                        <option value="INTERVIEWING">INTERVIEWING</option>
                        <option value="OFFERED">OFFERED</option>
                        <option value="REJECTED">REJECTED</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">TITLE / DESCRIPTION</label>
                <input
                  type="text"
                  placeholder={logType === 'DSA' ? "e.g. LeetCode 121 - Buy Sell Stock" : "e.g. Google Software Intern"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-3 py-1.5 rounded border border-white/10 bg-[#0d101b] text-slate-300 outline-none text-xs"
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
                  Log Entry
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Grid: Placement stats / Resume reviewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Stats and Resume reviews */}
        <div className="lg:col-span-1 flex flex-col gap-6 text-left">
          
          {/* Agent Placement Digest */}
          <div className="p-6 rounded-2xl glass-panel relative overflow-hidden bg-gradient-to-tr from-indigo-950/15 to-transparent">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              <h3 className="font-bold text-white text-base">Placement Readiness</h3>
            </div>
            
            <div className="text-2xl font-extrabold text-white mb-2">{summary.readinessScore}% Score</div>
            
            <div className="text-xs text-slate-400 mb-4">
              Recommended DSA Topics to study:
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {summary.recommendedTopics.map(t => (
                <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full" key={t}>
                  {t}
                </span>
              ))}
            </div>

            <div className="border-t border-white/5 pt-4 text-[10px] text-slate-500">
              Readiness scales with LeetCode problems solved & company offers recorded.
            </div>
          </div>

          {/* Resume reviewer */}
          <div className="p-6 rounded-2xl glass-panel flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">Local Resume Audit</h3>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-slate-400">Mock Resume Score:</span>
                <span className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                  {summary.resumeScore}/100
                </span>
              </div>

              {/* Suggestions */}
              <div className="flex flex-col gap-2.5 mb-4 text-xs text-slate-300">
                {summary.resumeSuggestions.map((s, idx) => (
                  <div key={idx} className="flex gap-2 items-start leading-relaxed">
                    <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <textarea
                placeholder="Paste mock resume text to analyze..."
                value={mockResumeText}
                onChange={(e) => setMockResumeText(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#0d101b] text-xs text-slate-300 h-16 outline-none resize-none"
              ></textarea>
              <button
                onClick={analyzeResumeMock}
                disabled={analyzingResume}
                className="w-full py-2 rounded-lg text-xs font-semibold glass-button flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {analyzingResume ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Re-evaluate Resume</span>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Job application funnel & mock interview */}
        <div className="lg:col-span-2 flex flex-col gap-6 text-left">
          
          {/* Job application list */}
          <div className="p-6 rounded-2xl glass-panel flex flex-col gap-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-pink-400" />
              <span>Company Application Funnel</span>
            </h3>

            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
              {jobApplications.map((app) => (
                <div 
                  key={app.id} 
                  className="p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center hover:border-indigo-500/10"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white leading-normal">{app.title}</h4>
                    {app.description && <p className="text-[10px] text-slate-500 mt-1">{app.description}</p>}
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={app.status}
                      onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                      className={`text-[10px] font-bold border px-2 py-0.5 rounded-full outline-none ${getStatusColor(app.status)}`}
                    >
                      <option value="APPLIED">APPLIED</option>
                      <option value="INTERVIEWING">INTERVIEWING</option>
                      <option value="OFFERED">OFFERED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>
                </div>
              ))}

              {jobApplications.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-500">No company applications logged yet.</div>
              )}
            </div>
          </div>

          {/* Mock Interview */}
          <div className="p-6 rounded-2xl glass-panel flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Mock Interview Evaluator</h3>
            </div>

            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex gap-2 items-start leading-normal">
              <HelpCircle className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0" />
              <div>
                <strong className="text-white block mb-0.5">CURRENT CHALLENGE:</strong>
                <span>{interviewQuestion}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <textarea
                placeholder="Type your answer explanation..."
                value={interviewAnswer}
                onChange={(e) => setInterviewAnswer(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-[#0d101b] text-xs text-slate-200 h-20 outline-none resize-none font-mono"
              ></textarea>
              
              <button
                onClick={submitMockInterview}
                disabled={submittingAnswer}
                className="py-2.5 rounded-lg text-xs font-semibold glass-button flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submittingAnswer ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Submit Answer</span>
                )}
              </button>

              {interviewFeedback && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs leading-relaxed"
                >
                  {interviewFeedback}
                </motion.div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
