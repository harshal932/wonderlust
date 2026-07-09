import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { 
  Milestone, 
  Sparkles, 
  Award, 
  BookOpen, 
  Layers, 
  Calendar,
  CheckCircle,
  HelpCircle
} from 'lucide-react'

interface Skill {
  name: string
  completed: boolean
}

interface CareerRoadmap {
  path: string
  title: string
  skills: Skill[]
  recommendedProjects: string[]
  recommendedCourses: string[]
  timeline: string
  progressPercent: number
  agentAdvice: string
}

export default function CareerPage() {
  const { user, token, updateProfile } = useAuth()
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePathSelect, setActivePathSelect] = useState('SOFTWARE_ENGINEER')
  const [updating, setUpdating] = useState(false)

  const fetchRoadmap = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/career', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setRoadmap(data)
        setActivePathSelect(data.path)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchRoadmap()
    }
  }, [token])

  const handleUpdateCareerPath = async (newPath: string) => {
    if (!token) return
    setUpdating(true)
    // Update path string in user profile
    const nameMap: Record<string, string> = {
      SOFTWARE_ENGINEER: 'Software Engineer',
      AI_ENGINEER: 'AI Engineer',
      CLOUD_ENGINEER: 'Cloud Engineer',
      CYBERSECURITY: 'Cybersecurity',
      DATA_SCIENTIST: 'Data Scientist'
    }
    const pathText = nameMap[newPath] || 'Software Engineer'
    const success = await updateProfile({ careerGoal: pathText })
    if (success) {
      // Reload roadmap
      await fetchRoadmap()
    }
    setUpdating(false)
  }

  const handleToggleSkill = async (skillName: string, completed: boolean) => {
    if (!token) return
    try {
      const res = await fetch('/api/career/skill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ skillName, completed })
      })
      if (res.ok) {
        fetchRoadmap()
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (loading || !roadmap) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Building roadmap modules...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-white Outfit">Career Roadmap Planner</h2>
          <p className="text-xs text-slate-400 mt-1">Design learning checklists, verify course paths, and track portfolio project targets</p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-500 font-semibold uppercase">ACTIVE TRACK:</span>
          <select
            value={activePathSelect}
            onChange={(e) => handleUpdateCareerPath(e.target.value)}
            disabled={updating}
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#0d101b] text-xs font-semibold text-indigo-300 outline-none cursor-pointer appearance-none pr-8 relative"
          >
            <option value="SOFTWARE_ENGINEER">Software Engineer</option>
            <option value="AI_ENGINEER">AI Systems Engineer</option>
            <option value="CLOUD_ENGINEER">Cloud Infrastructure</option>
            <option value="CYBERSECURITY">Information Security</option>
            <option value="DATA_SCIENTIST">Data Scientist</option>
          </select>
        </div>
      </div>

      {/* Grid: Advisor panel / Skills tree checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Advisor digest */}
        <div className="lg:col-span-1 flex flex-col gap-6 text-left">
          
          {/* Agent Advisor Advice */}
          <div className="p-6 rounded-2xl glass-panel relative overflow-hidden bg-gradient-to-tr from-indigo-950/15 to-purple-950/10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              <h3 className="font-bold text-white text-base">Career Agent Digest</h3>
            </div>

            <div className="text-2xl font-extrabold text-white mb-2">{roadmap.progressPercent}% Completed</div>

            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" 
                style={{ width: `${roadmap.progressPercent}%` }}
              ></div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium bg-indigo-500/5 p-3 rounded-lg border border-indigo-500/10">
              "{roadmap.agentAdvice}"
            </p>
          </div>

          {/* Recommended details: Projects & Courses */}
          <div className="p-6 rounded-2xl glass-panel flex flex-col gap-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-white/5 pb-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Recommended Portfolio</span>
            </h3>
            
            <div className="flex flex-col gap-3">
              {roadmap.recommendedProjects.map((p, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-200">
                  <span className="block text-[8px] text-slate-500 font-bold uppercase mb-0.5">PROJECT</span>
                  <strong>{p}</strong>
                </div>
              ))}
            </div>

            <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-white/5 pb-2 mt-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Recommended Courses</span>
            </h3>

            <div className="flex flex-col gap-3">
              {roadmap.recommendedCourses.map((c, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-200">
                  <span className="block text-[8px] text-slate-500 font-bold uppercase mb-0.5">COURSE</span>
                  <strong>{c}</strong>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Skill Tree Checklist & Timeline */}
        <div className="lg:col-span-2 flex flex-col gap-6 text-left">
          
          {/* Skill Checklists */}
          <div className="p-6 rounded-2xl glass-panel flex flex-col gap-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              <span>Skills Tree Checklist</span>
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed mb-1">
              Verify your capability blocks. Toggle skill completions below to recalculate term progress parameters:
            </p>

            <div className="flex flex-col gap-2.5">
              {roadmap.skills.map((skill) => (
                <div 
                  key={skill.name}
                  className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/[0.08] hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={skill.completed}
                      onChange={(e) => handleToggleSkill(skill.name, e.target.checked)}
                      className="rounded bg-white/5 border-white/10 text-indigo-500 focus:ring-indigo-500/20 w-4 h-4 cursor-pointer"
                    />
                    <span className={`text-xs text-slate-300 ${skill.completed ? 'line-through opacity-50' : ''}`}>
                      {skill.name}
                    </span>
                  </div>
                  {skill.completed && (
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/25 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline details */}
          <div className="p-6 rounded-2xl glass-panel text-left flex flex-col gap-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span>Semester Timeline Guideline</span>
            </h3>
            
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 leading-relaxed font-semibold">
              {roadmap.timeline}
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
