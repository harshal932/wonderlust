import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { 
  LineChart, 
  Sparkles, 
  TrendingUp, 
  HelpCircle,
  AlertTriangle,
  Award,
  CheckCircle,
  Info
} from 'lucide-react'

interface SubjectGradeInput {
  subjectId: string
  subjectName: string
  credits: number
  expectedGradePoints: number
}

interface CGPAPrediction {
  currentCGPA: number
  targetCGPA: number
  predictedSemesterGPA: number
  predictedOverallCGPA: number
  requiredGPAForTarget: number
  status: 'ON_TRACK' | 'WARNING' | 'CRITICAL'
  advice: string
}

export default function CGPAPage() {
  const { user, token } = useAuth()
  
  const [currentGPA, setCurrentGPA] = useState('8.0')
  const [completedCredits, setCompletedCredits] = useState('20')
  const [subjectGrades, setSubjectGrades] = useState<SubjectGradeInput[]>([])
  const [prediction, setPrediction] = useState<CGPAPrediction | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchSubjects = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/attendance', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        // Map active subjects to default expected grades (9 = A)
        const mapped = (data.subjects || []).map((sub: any) => ({
          subjectId: sub.subjectId,
          subjectName: sub.subjectName,
          credits: sub.totalClasses > 0 ? 4 : 3, // Fallback credits estimate
          expectedGradePoints: 9
        }))
        setSubjectGrades(mapped)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchSubjects()
    }
  }, [token])

  const handleGradeChange = (subjectId: string, value: string) => {
    setSubjectGrades(subjectGrades.map(sg => 
      sg.subjectId === subjectId ? { ...sg, expectedGradePoints: parseInt(value) } : sg
    ))
  }

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || subjectGrades.length === 0) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/cgpa/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentGPA: parseFloat(currentGPA),
          completedCredits: parseInt(completedCredits),
          expectedGrades: subjectGrades.map(sg => ({
            subjectId: sg.subjectId,
            expectedGradePoints: sg.expectedGradePoints
          }))
        })
      })
      if (res.ok) {
        const data = await res.json()
        setPrediction(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    if (status === 'ON_TRACK') return 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10'
    if (status === 'WARNING') return 'text-amber-400 border-amber-500/25 bg-amber-500/10'
    return 'text-rose-400 border-rose-500/25 bg-rose-500/10'
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Loading calculator models...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      
      {/* Header */}
      <div className="text-left">
        <h2 className="text-2xl font-bold text-white Outfit">CGPA Predictor & Calculator</h2>
        <p className="text-xs text-slate-400 mt-1">Simulate expected semester grades, predict overall CGPAs, and check graduation targets</p>
      </div>

      {/* Main Grid: Form Inputs Left, Prediction Outputs Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        
        {/* Left Side: Form Inputs */}
        <form onSubmit={handlePredict} className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Completed History Panel */}
          <div className="p-6 rounded-2xl glass-panel flex flex-col gap-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-white/5 pb-2">
              <Award className="w-4.5 h-4.5 text-indigo-400" />
              <span>Prior Semesters Summary</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">COMPLETED CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.0"
                  max="10.0"
                  value={currentGPA}
                  onChange={(e) => setCurrentGPA(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#0d101b] text-slate-300 outline-none text-xs"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-bold">COMPLETED CREDITS</label>
                <input
                  type="number"
                  min="0"
                  value={completedCredits}
                  onChange={(e) => setCompletedCredits(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#0d101b] text-slate-300 outline-none text-xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* Current Semester Subjects expected grades */}
          <div className="p-6 rounded-2xl glass-panel flex flex-col gap-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-white/5 pb-2">
              <TrendingUp className="w-4.5 h-4.5 text-purple-400" />
              <span>Expected Semester Grades</span>
            </h3>

            <p className="text-xs text-slate-400 leading-normal mb-1">
              Select expected grade scale points (O=10, A+=9, A=8, B=7) for each active subject:
            </p>

            <div className="flex flex-col gap-3">
              {subjectGrades.map((sg) => (
                <div 
                  key={sg.subjectId}
                  className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between hover:border-white/10 transition-all"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white leading-normal">{sg.subjectName}</h4>
                    <span className="text-[9px] text-slate-500 font-semibold uppercase">{sg.credits} credits</span>
                  </div>

                  <select
                    value={sg.expectedGradePoints}
                    onChange={(e) => handleGradeChange(sg.subjectId, e.target.value)}
                    className="px-2.5 py-1 rounded border border-white/10 bg-[#0d101b] text-xs font-semibold text-slate-300 outline-none cursor-pointer"
                  >
                    <option value="10">Outstanding (O) - 10 GP</option>
                    <option value="9">Excellent (A+) - 9 GP</option>
                    <option value="8">Very Good (A) - 8 GP</option>
                    <option value="7">Good (B) - 7 GP</option>
                    <option value="6">Average (C) - 6 GP</option>
                  </select>
                </div>
              ))}

              {subjectGrades.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-500">
                  No subjects found. Add subjects in the "Attendance" page to simulate grades.
                </div>
              )}
            </div>

            {subjectGrades.length > 0 && (
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full py-2.5 rounded-lg glass-button text-xs font-semibold flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Calculate GPA Forecasts</span>
                )}
              </button>
            )}
          </div>

        </form>

        {/* Right Side: Prediction results */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {prediction ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6"
            >
              {/* Main Score panel */}
              <div className="p-6 rounded-2xl glass-panel text-left flex flex-col gap-4 bg-gradient-to-tr from-indigo-950/15 to-transparent border-indigo-500/10">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="font-bold text-white text-base">Forecast Summary</h3>
                  <span className={`text-[9px] font-bold border px-2.5 py-0.5 rounded-full ${getStatusColor(prediction.status)}`}>
                    {prediction.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="block text-[8px] text-slate-500 font-bold uppercase mb-0.5">SEMESTER GPA</span>
                    <span className="text-xl font-extrabold text-white">{prediction.predictedSemesterGPA}</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="block text-[8px] text-slate-500 font-bold uppercase mb-0.5">OVERALL CGPA</span>
                    <span className="text-xl font-extrabold text-white">{prediction.predictedOverallCGPA}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex gap-2 items-start text-xs text-slate-300 leading-relaxed font-semibold">
                  <Info className="w-4.5 h-4.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <span>{prediction.advice}</span>
                </div>
              </div>

              {/* Requirement target panel */}
              <div className="p-6 rounded-2xl glass-panel text-left flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <h3 className="font-bold text-white text-base">Target Pull GPA</h3>
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your graduation target CGPA is <strong className="text-white">{user?.targetCGPA || 8.5}</strong>. To achieve this, you need an average GPA of:
                </p>

                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                  <span className="text-[9px] text-indigo-300 font-bold block uppercase mb-1">REQUIRED TERM GPA</span>
                  <span className="text-3xl font-extrabold text-white">{prediction.requiredGPAForTarget}</span>
                </div>
              </div>

            </motion.div>
          ) : (
            <div className="p-6 rounded-2xl border border-white/5 bg-white/5 text-center text-xs text-slate-500 h-64 flex items-center justify-center">
              Complete details and calculate to see GPA results.
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
