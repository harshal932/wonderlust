import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { 
  User, 
  GraduationCap, 
  Trophy, 
  Briefcase, 
  Check, 
  Save, 
  Sparkles,
  BookOpen
} from 'lucide-react'

export default function ProfilePage() {
  const { user, token, updateProfile, refreshUser } = useAuth()

  const [name, setName] = useState('')
  const [department, setDepartment] = useState('Engineering')
  const [branch, setBranch] = useState('Computer Science')
  const [semester, setSemester] = useState('1')
  const [targetCGPA, setTargetCGPA] = useState('8.5')
  const [careerGoal, setCareerGoal] = useState('Software Engineer')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setDepartment(user.department || 'Engineering')
      setBranch(user.branch || 'Computer Science')
      setSemester(String(user.semester || 1))
      setTargetCGPA(String(user.targetCGPA || 8.5))
      setCareerGoal(user.careerGoal || 'Software Engineer')
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const success = await updateProfile({
      name,
      department,
      branch,
      semester: parseInt(semester),
      targetCGPA: parseFloat(targetCGPA),
      careerGoal
    })
    setSaving(false)
    if (success) {
      alert('Profile updated successfully!')
      refreshUser()
    }
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-2xl mx-auto text-left">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white Outfit">Student Profile</h2>
        <p className="text-xs text-slate-400 mt-1">Configure your personal student details and primary academic targets</p>
      </div>

      {/* Main Profile Form Card */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl glass-panel flex flex-col gap-5">
        
        {/* Core Profile info header */}
        <div className="flex items-center gap-4 border-b border-white/5 pb-4 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 border border-indigo-400/30 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-indigo-500/25">
            {name ? name.slice(0, 2).toUpperCase() : 'ST'}
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-normal">{name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{branch} • Semester {semester}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Display Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg glass-input text-sm"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Branch / Specialization</label>
            <div className="relative">
              <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg glass-input text-sm"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-4 py-2.5 rounded-lg glass-input text-sm appearance-none bg-[#0d101b]"
            >
              <option value="Engineering">Engineering</option>
              <option value="Science">Science</option>
              <option value="Business">Business</option>
              <option value="Liberal Arts">Liberal Arts</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="px-4 py-2.5 rounded-lg glass-input text-sm appearance-none bg-[#0d101b]"
              >
                {[1,2,3,4,5,6,7,8].map((s) => (
                  <option value={s} key={s}>Sem {s}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Target CGPA</label>
              <div className="relative">
                <Trophy className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="10.0"
                  value={targetCGPA}
                  onChange={(e) => setTargetCGPA(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg glass-input text-sm"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">Active Career Roadmap Goal</label>
          <div className="relative">
            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-sm appearance-none bg-[#0d101b]"
            >
              <option value="Software Engineer">Software Engineer</option>
              <option value="AI Engineer">AI Systems Engineer</option>
              <option value="Cloud Engineer">Cloud Infrastructure Architect</option>
              <option value="Cybersecurity">Information Security</option>
              <option value="Data Scientist">Data Scientist</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-4 w-full py-2.5 rounded-lg glass-button text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Profile Config</span>
            </>
          )}
        </button>

      </form>

    </div>
  )
}
