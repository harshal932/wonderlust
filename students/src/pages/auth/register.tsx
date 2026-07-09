import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../../hooks/useAuth'
import {
  BrainCircuit, Lock, User, Mail, ArrowRight, ArrowLeft,
  BookOpen, GraduationCap, Trophy, Eye, EyeOff, CheckCircle2,
  Sparkles, Rocket
} from 'lucide-react'

const DEPARTMENTS = ['Engineering', 'Science', 'Business', 'Liberal Arts']
const BRANCHES: Record<string, string[]> = {
  Engineering: ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical'],
  Science: ['Physics', 'Chemistry', 'Biology', 'Mathematics'],
  Business: ['Finance', 'Marketing', 'HR Management', 'Operations'],
  'Liberal Arts': ['English', 'History', 'Philosophy', 'Psychology'],
}
const CAREER_GOALS = [
  { value: 'SOFTWARE_ENGINEER', label: 'Software Engineer' },
  { value: 'AI_ENGINEER', label: 'AI Systems Engineer' },
  { value: 'CLOUD_ENGINEER', label: 'Cloud Infrastructure Architect' },
  { value: 'CYBERSECURITY', label: 'Information Security' },
  { value: 'DATA_SCIENTIST', label: 'Data Scientist' },
]

function getPasswordStrength(p: string) {
  if (!p) return 0
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
}
const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981']

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const totalSteps = 3

  // Step 1 – Identity
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')

  // Step 2 – Security
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Step 3 – Academics
  const [department, setDepartment] = useState('Engineering')
  const [branch, setBranch] = useState('Computer Science')
  const [semester, setSemester] = useState('1')
  const [targetCGPA, setTargetCGPA] = useState('8.5')
  const [careerGoal, setCareerGoal] = useState('SOFTWARE_ENGINEER')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  const { register } = useAuth()
  const router = useRouter()
  const pwStrength = getPasswordStrength(password)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (department && BRANCHES[department]) {
      setBranch(BRANCHES[department][0])
    }
  }, [department])

  const validateStep = () => {
    setError('')
    if (step === 1) {
      if (!name.trim()) { setError('Full name is required.'); return false }
      if (!username.trim()) { setError('Username is required.'); return false }
      if (username.length < 3) { setError('Username must be at least 3 characters.'); return false }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) { setError('Username can only contain letters, numbers, and underscores.'); return false }
    }
    if (step === 2) {
      if (!email.trim()) { setError('Email is required.'); return false }
      if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email address.'); return false }
      if (!password) { setError('Password is required.'); return false }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return false }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return false }
    }
    return true
  }

  const nextStep = () => {
    if (validateStep()) setStep(s => Math.min(s + 1, totalSteps))
  }
  const prevStep = () => { setError(''); setStep(s => Math.max(s - 1, 1)) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep()) return
    setSubmitting(true)
    const success = await register({
      username,
      email,
      password,
      name,
      department,
      branch,
      semester: parseInt(semester),
      targetCGPA: parseFloat(targetCGPA),
    })
    setSubmitting(false)
    if (success) {
      router.push('/dashboard')
    } else {
      setError('Registration failed. Username or email may already be taken.')
    }
  }

  const stepLabels = ['Identity', 'Security', 'Academics']
  const stepIcons = [<User key={0} className="w-4 h-4" />, <Lock key={1} className="w-4 h-4" />, <GraduationCap key={2} className="w-4 h-4" />]

  return (
    <div className="auth-root">
      <div className="auth-bg-orb orb-1" />
      <div className="auth-bg-orb orb-2" />
      <div className="auth-bg-orb orb-3" />

      {mounted && (
        <div className="particles-container" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className={`particle particle-${(i % 4) + 1}`}
              style={{
                left: `${(i * 41 + 9) % 100}%`,
                top: `${(i * 59 + 11) % 100}%`,
                animationDelay: `${i * 0.35}s`,
                animationDuration: `${4 + (i % 3)}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className={`auth-card reg-card ${mounted ? 'auth-card-visible' : ''}`}>
        {/* Logo */}
        <div className="auth-header">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div className="auth-logo-ring">
              <div className="auth-logo">
                <BrainCircuit className="w-7 h-7 text-white" />
              </div>
            </div>
          </Link>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Configure your academic environment</p>
        </div>

        {/* Step Indicator */}
        <div className="step-indicator" role="progressbar" aria-valuenow={step} aria-valuemax={totalSteps}>
          {stepLabels.map((label, idx) => {
            const num = idx + 1
            const done = num < step
            const active = num === step
            return (
              <React.Fragment key={num}>
                <div className={`step-node ${active ? 'step-active' : done ? 'step-done' : 'step-pending'}`}>
                  <div className="step-circle">
                    {done ? <CheckCircle2 className="w-4 h-4" /> : stepIcons[idx]}
                  </div>
                  <span className="step-label">{label}</span>
                </div>
                {num < totalSteps && (
                  <div className={`step-line ${done ? 'step-line-done' : ''}`} />
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Error banner */}
        {error && (
          <div className="auth-error" role="alert">
            <span>⚠</span> {error}
          </div>
        )}

        {/* Step Panels */}
        <form onSubmit={step === totalSteps ? handleSubmit : (e) => { e.preventDefault(); nextStep() }} noValidate>

          {/* STEP 1 – Identity */}
          {step === 1 && (
            <div className="step-panel">
              <div className="step-panel-header">
                <User className="w-5 h-5" />
                <span>Your Identity</span>
              </div>
              <div className="auth-field">
                <label className="auth-label">Full Name</label>
                <div className="auth-input-wrap">
                  <User className="auth-input-icon" />
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={e => { setName(e.target.value); setError('') }}
                    className="auth-input"
                    autoFocus
                    autoComplete="name"
                  />
                </div>
              </div>
              <div className="auth-field">
                <label className="auth-label">Username</label>
                <div className="auth-input-wrap">
                  <span className="auth-at-sign">@</span>
                  <input
                    type="text"
                    placeholder="rahul_sharma"
                    value={username}
                    onChange={e => { setUsername(e.target.value.toLowerCase().replace(/\s/g, '_')); setError('') }}
                    className="auth-input auth-input-at"
                    autoComplete="username"
                  />
                </div>
                <p className="auth-hint">Letters, numbers, underscores only. Min 3 chars.</p>
              </div>
            </div>
          )}

          {/* STEP 2 – Security */}
          {step === 2 && (
            <div className="step-panel">
              <div className="step-panel-header">
                <Lock className="w-5 h-5" />
                <span>Secure Your Account</span>
              </div>
              <div className="auth-field">
                <label className="auth-label">Email Address</label>
                <div className="auth-input-wrap">
                  <Mail className="auth-input-icon" />
                  <input
                    type="email"
                    placeholder="rahul@college.edu"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    className="auth-input"
                    autoFocus
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="auth-field">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <Lock className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    className="auth-input auth-input-pad-right"
                    autoComplete="new-password"
                  />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength meter */}
                {password && (
                  <div className="pw-strength">
                    <div className="pw-bars">
                      {[1,2,3,4].map(n => (
                        <div
                          key={n}
                          className="pw-bar"
                          style={{ background: n <= pwStrength ? strengthColor[pwStrength] : 'rgba(255,255,255,0.08)' }}
                        />
                      ))}
                    </div>
                    <span className="pw-label" style={{ color: strengthColor[pwStrength] }}>
                      {strengthLabel[pwStrength]}
                    </span>
                  </div>
                )}
              </div>
              <div className="auth-field">
                <label className="auth-label">Confirm Password</label>
                <div className="auth-input-wrap">
                  <Lock className="auth-input-icon" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setError('') }}
                    className={`auth-input auth-input-pad-right ${confirmPassword && confirmPassword === password ? 'input-match' : confirmPassword ? 'input-mismatch' : ''}`}
                    autoComplete="new-password"
                  />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowConfirm(!showConfirm)} aria-label="Toggle confirm password">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <p className={`auth-hint ${confirmPassword === password ? 'hint-ok' : 'hint-err'}`}>
                    {confirmPassword === password ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3 – Academics */}
          {step === 3 && (
            <div className="step-panel">
              <div className="step-panel-header">
                <GraduationCap className="w-5 h-5" />
                <span>Academic Profile</span>
              </div>
              <div className="reg-grid">
                <div className="auth-field">
                  <label className="auth-label">Department</label>
                  <div className="auth-input-wrap">
                    <BookOpen className="auth-input-icon" />
                    <select
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      className="auth-input auth-select"
                    >
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-label">Branch / Specialization</label>
                  <div className="auth-input-wrap">
                    <BookOpen className="auth-input-icon" />
                    <select
                      value={branch}
                      onChange={e => setBranch(e.target.value)}
                      className="auth-input auth-select"
                    >
                      {(BRANCHES[department] || []).map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-label">Semester</label>
                  <div className="auth-input-wrap">
                    <GraduationCap className="auth-input-icon" />
                    <select
                      value={semester}
                      onChange={e => setSemester(e.target.value)}
                      className="auth-input auth-select"
                    >
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-label">Target CGPA</label>
                  <div className="auth-input-wrap">
                    <Trophy className="auth-input-icon" />
                    <input
                      type="number" step="0.1" min="1.0" max="10.0"
                      placeholder="8.5" value={targetCGPA}
                      onChange={e => setTargetCGPA(e.target.value)}
                      className="auth-input"
                    />
                  </div>
                </div>
              </div>
              <div className="auth-field">
                <label className="auth-label">Primary Career Goal</label>
                <div className="career-pills">
                  {CAREER_GOALS.map(g => (
                    <button
                      key={g.value}
                      type="button"
                      className={`career-pill ${careerGoal === g.value ? 'career-pill-active' : ''}`}
                      onClick={() => setCareerGoal(g.value)}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="step-nav">
            {step > 1 && (
              <button type="button" onClick={prevStep} className="nav-back-btn">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
            {step < totalSteps ? (
              <button type="submit" className={`auth-submit-btn ${step === 1 ? 'full-width' : ''}`}>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="submit" disabled={submitting} className="auth-submit-btn">
                {submitting ? (
                  <div className="auth-spinner" />
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>Launch My Account</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <span>Already have an account?</span>
          <Link href="/auth/login" className="auth-link">Sign In</Link>
        </div>
      </div>

      <style jsx>{`
        .auth-root {
          min-height: 100vh; background: #06070a;
          display: flex; align-items: center; justify-content: center;
          padding: 24px; position: relative; overflow: hidden;
        }
        .auth-bg-orb { position: absolute; border-radius: 50%; pointer-events: none; }
        .orb-1 {
          width: 550px; height: 550px;
          background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
          top: -150px; left: -150px; filter: blur(60px);
          animation: orbFloat 9s ease-in-out infinite;
        }
        .orb-2 {
          width: 450px; height: 450px;
          background: radial-gradient(circle, rgba(168,85,247,0.13) 0%, transparent 70%);
          bottom: -100px; right: -100px; filter: blur(60px);
          animation: orbFloat 12s ease-in-out infinite reverse;
        }
        .orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%);
          top: 50%; left: 50%; filter: blur(80px);
          animation: orbPulse 7s ease-in-out infinite;
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0,0); }
          50% { transform: translate(25px,25px); }
        }
        @keyframes orbPulse {
          0%, 100% { opacity: 0.4; transform: translate(-50%,-50%); }
          50% { opacity: 1; transform: translate(-50%,-50%); }
        }
        .particles-container { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .particle { position: absolute; border-radius: 50%; animation: particleDrift ease-in-out infinite alternate; }
        .particle-1 { width: 3px; height: 3px; background: rgba(99,102,241,0.7); }
        .particle-2 { width: 2px; height: 2px; background: rgba(168,85,247,0.6); }
        .particle-3 { width: 4px; height: 4px; background: rgba(236,72,153,0.4); }
        .particle-4 { width: 2px; height: 2px; background: rgba(99,102,241,0.4); }
        @keyframes particleDrift {
          from { transform: translateY(0) scale(1); opacity: 0.2; }
          to { transform: translateY(-28px) scale(1.6); opacity: 0.9; }
        }

        /* Card */
        .auth-card {
          width: 100%; max-width: 480px;
          background: rgba(13,16,27,0.62);
          backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255,255,255,0.07); border-radius: 24px;
          padding: 36px 32px;
          box-shadow: 0 0 0 1px rgba(99,102,241,0.12), 0 24px 64px rgba(0,0,0,0.55), 0 0 80px rgba(99,102,241,0.07);
          position: relative; z-index: 1;
          opacity: 0; transform: translateY(22px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .auth-card-visible { opacity: 1; transform: translateY(0); }

        /* Header */
        .auth-header {
          display: flex; flex-direction: column; align-items: center;
          margin-bottom: 24px; gap: 8px;
        }
        .auth-logo-ring {
          width: 64px; height: 64px; border-radius: 20px;
          background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2));
          border: 1px solid rgba(99,102,241,0.35);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          box-shadow: 0 0 32px rgba(99,102,241,0.22), inset 0 0 20px rgba(99,102,241,0.05);
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .auth-logo-ring:hover { transform: scale(1.06); box-shadow: 0 0 44px rgba(99,102,241,0.38); }
        .auth-logo {
          width: 46px; height: 46px; border-radius: 14px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          display: flex; align-items: center; justify-content: center;
          animation: logoPulse 3.5s ease-in-out infinite;
        }
        @keyframes logoPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.5); }
          50% { box-shadow: 0 0 0 10px rgba(99,102,241,0); }
        }
        .auth-title {
          font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;
          background: linear-gradient(135deg, #f8fafc 30%, rgba(168,85,247,0.9) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .auth-subtitle { font-size: 12px; color: #64748b; margin: 0; text-align: center; }

        /* Step indicator */
        .step-indicator {
          display: flex; align-items: center;
          margin-bottom: 24px; padding: 0 4px;
        }
        .step-node {
          display: flex; flex-direction: column; align-items: center; gap: 5px;
          flex-shrink: 0;
        }
        .step-circle {
          width: 34px; height: 34px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        .step-active .step-circle {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: white;
          box-shadow: 0 0 16px rgba(99,102,241,0.5);
        }
        .step-done .step-circle {
          background: rgba(16,185,129,0.15);
          border-color: rgba(16,185,129,0.5);
          color: #10b981;
        }
        .step-pending .step-circle {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.1);
          color: #475569;
        }
        .step-label {
          font-size: 10px; font-weight: 600; letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .step-active .step-label { color: #a5b4fc; }
        .step-done .step-label { color: #10b981; }
        .step-pending .step-label { color: #475569; }
        .step-line {
          flex: 1; height: 2px; margin: 0 8px; margin-bottom: 16px;
          background: rgba(255,255,255,0.07);
          border-radius: 2px;
          transition: background 0.4s ease;
        }
        .step-line-done { background: linear-gradient(90deg, #6366f1, #a855f7); }

        /* Error */
        .auth-error {
          background: rgba(239,68,68,0.09); border: 1px solid rgba(239,68,68,0.28);
          color: #fca5a5; border-radius: 10px; padding: 10px 14px;
          font-size: 12px; margin-bottom: 16px;
          display: flex; align-items: center; gap: 8px;
          animation: slideIn 0.3s ease;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Step panel */
        .step-panel { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; }
        .step-panel-header {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 700; color: #a5b4fc;
          padding-bottom: 12px; border-bottom: 1px solid rgba(99,102,241,0.15);
        }

        /* Fields */
        .auth-field { display: flex; flex-direction: column; gap: 6px; }
        .auth-label { font-size: 10.5px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; }
        .auth-input-wrap { position: relative; }
        .auth-input-icon {
          position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
          width: 15px; height: 15px; color: #475569; transition: color 0.2s; pointer-events: none;
        }
        .auth-at-sign {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          font-size: 14px; font-weight: 700; color: #475569; pointer-events: none;
          transition: color 0.2s;
        }
        .auth-input-wrap:focus-within .auth-input-icon,
        .auth-input-wrap:focus-within .auth-at-sign { color: #6366f1; }
        .auth-input {
          width: 100%; box-sizing: border-box;
          padding: 10px 14px 10px 42px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: #f8fafc; border-radius: 11px;
          font-size: 13px; font-family: inherit; outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .auth-input::placeholder { color: #2d3748; }
        .auth-input:focus {
          border-color: rgba(99,102,241,0.65);
          background: rgba(99,102,241,0.04);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.13);
        }
        .auth-input-at { padding-left: 36px; }
        .auth-input-pad-right { padding-right: 44px; }
        .auth-select { appearance: none; -webkit-appearance: none; cursor: pointer; }
        .input-match { border-color: rgba(16,185,129,0.5) !important; }
        .input-mismatch { border-color: rgba(239,68,68,0.5) !important; }
        .auth-hint { font-size: 11px; color: #475569; margin: 0; }
        .hint-ok { color: #10b981; }
        .hint-err { color: #f87171; }
        .auth-eye-btn {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #475569;
          display: flex; align-items: center; padding: 4px;
          transition: color 0.2s; border-radius: 6px;
        }
        .auth-eye-btn:hover { color: #94a3b8; }

        /* Password strength */
        .pw-strength { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
        .pw-bars { display: flex; gap: 4px; flex: 1; }
        .pw-bar {
          flex: 1; height: 3px; border-radius: 3px;
          transition: background 0.3s ease;
        }
        .pw-label { font-size: 11px; font-weight: 700; min-width: 40px; text-align: right; }

        /* Academic grid */
        .reg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        /* Career pills */
        .career-pills { display: flex; flex-wrap: wrap; gap: 8px; }
        .career-pill {
          padding: 6px 12px; border-radius: 20px; font-size: 11.5px; font-weight: 600;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: #94a3b8; cursor: pointer; font-family: inherit;
          transition: all 0.2s ease;
        }
        .career-pill:hover {
          background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.35);
          color: #a5b4fc;
        }
        .career-pill-active {
          background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.55);
          color: #a5b4fc;
          box-shadow: 0 0 10px rgba(99,102,241,0.2);
        }

        /* Navigation */
        .step-nav { display: flex; gap: 12px; align-items: center; }
        .nav-back-btn {
          padding: 12px 18px; border-radius: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: #94a3b8; font-size: 13px; font-weight: 600; font-family: inherit;
          cursor: pointer; display: flex; align-items: center; gap: 6px;
          transition: all 0.2s; flex-shrink: 0;
        }
        .nav-back-btn:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.15); color: #f8fafc;
        }
        .auth-submit-btn {
          flex: 1; padding: 12px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
          color: #fff; font-size: 13.5px; font-weight: 700; font-family: inherit;
          border: none; border-radius: 13px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 24px rgba(99,102,241,0.38);
          letter-spacing: 0.02em; position: relative; overflow: hidden;
        }
        .auth-submit-btn.full-width { flex: 1; }
        .auth-submit-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: translateX(-100%); transition: transform 0.45s ease;
        }
        .auth-submit-btn:hover::before { transform: translateX(100%); }
        .auth-submit-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(99,102,241,0.5); }
        .auth-submit-btn:active { transform: translateY(0); }
        .auth-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
        .auth-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Footer */
        .auth-footer {
          margin-top: 24px; text-align: center; font-size: 12px; color: #475569;
          border-top: 1px solid rgba(255,255,255,0.05); padding-top: 18px;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .auth-link { color: #6366f1; font-weight: 700; text-decoration: none; transition: color 0.2s; }
        .auth-link:hover { color: #a5b4fc; }
      `}</style>
    </div>
  )
}
