import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../../hooks/useAuth'
import { BrainCircuit, Lock, User, ArrowRight, Eye, EyeOff, Sparkles, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  const { login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const remembered = localStorage.getItem('aicos_remembered_username')
    if (remembered) {
      setUsername(remembered)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username.trim()) { setError('Username is required.'); return }
    if (!password) { setError('Password is required.'); return }
    setSubmitting(true)
    const success = await login(username, password)
    setSubmitting(false)
    if (success) {
      if (rememberMe) {
        localStorage.setItem('aicos_remembered_username', username)
      } else {
        localStorage.removeItem('aicos_remembered_username')
      }
      router.push('/dashboard')
    } else {
      setError('Invalid username or password. Please try again.')
    }
  }

  return (
    <div className="auth-root">
      {/* Animated background orbs */}
      <div className="auth-bg-orb orb-1" />
      <div className="auth-bg-orb orb-2" />
      <div className="auth-bg-orb orb-3" />

      {/* Floating particles */}
      {mounted && (
        <div className="particles-container" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className={`particle particle-${(i % 4) + 1}`}
              style={{
                left: `${(i * 37 + 13) % 100}%`,
                top: `${(i * 53 + 7) % 100}%`,
                animationDelay: `${(i * 0.4)}s`,
                animationDuration: `${4 + (i % 3)}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className={`auth-card ${mounted ? 'auth-card-visible' : ''}`}>
        {/* Logo + header */}
        <div className="auth-header">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div className="auth-logo-ring">
              <div className="auth-logo">
                <BrainCircuit className="w-7 h-7 text-white" />
              </div>
            </div>
          </Link>
          <div className="auth-badge">
            <ShieldCheck className="w-3 h-3" />
            <span>Secure Login</span>
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your AI College Operating System</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="auth-error" role="alert">
            <span>⚠</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-field">
            <label className="auth-label">Username</label>
            <div className="auth-input-wrap">
              <User className="auth-input-icon" />
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError('') }}
                className="auth-input"
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div className="auth-field">
            <div className="auth-label-row">
              <label className="auth-label">Password</label>
              <Link href="/auth/forgot-password" className="auth-link-small">
                Forgot password?
              </Link>
            </div>
            <div className="auth-input-wrap">
              <Lock className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                className="auth-input auth-input-pad-right"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-eye-btn"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <label className="auth-remember" htmlFor="rememberMe">
            <div
              className={`auth-checkbox ${rememberMe ? 'auth-checkbox-on' : ''}`}
              onClick={() => setRememberMe(!rememberMe)}
            >
              {rememberMe && <span>✓</span>}
            </div>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="sr-only"
            />
            <span className="auth-remember-text">Remember me on this browser</span>
          </label>

          {/* Submit */}
          <button type="submit" disabled={submitting} className="auth-submit-btn">
            {submitting ? (
              <div className="auth-spinner" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <span>New to AI-COS?</span>
          <Link href="/auth/register" className="auth-link">
            Create an Account
          </Link>
        </div>
      </div>

      <style jsx>{`
        .auth-root {
          min-height: 100vh;
          background: #06070a;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }
        .auth-bg-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .orb-1 {
          width: 550px; height: 550px;
          background: radial-gradient(circle, rgba(99,102,241,0.16) 0%, transparent 70%);
          top: -150px; left: -150px;
          filter: blur(60px);
          animation: orbFloat 9s ease-in-out infinite;
        }
        .orb-2 {
          width: 450px; height: 450px;
          background: radial-gradient(circle, rgba(168,85,247,0.13) 0%, transparent 70%);
          bottom: -100px; right: -100px;
          filter: blur(60px);
          animation: orbFloat 12s ease-in-out infinite reverse;
        }
        .orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%);
          top: 50%; left: 50%; transform: translate(-50%, -50%);
          filter: blur(80px);
          animation: orbPulse 7s ease-in-out infinite;
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(25px, 25px); }
        }
        @keyframes orbPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .particles-container {
          position: absolute; inset: 0;
          pointer-events: none; overflow: hidden;
        }
        .particle {
          position: absolute; border-radius: 50%;
          animation: particleDrift ease-in-out infinite alternate;
        }
        .particle-1 { width: 3px; height: 3px; background: rgba(99,102,241,0.7); }
        .particle-2 { width: 2px; height: 2px; background: rgba(168,85,247,0.6); }
        .particle-3 { width: 4px; height: 4px; background: rgba(236,72,153,0.45); }
        .particle-4 { width: 2px; height: 2px; background: rgba(99,102,241,0.4); }
        @keyframes particleDrift {
          from { transform: translateY(0) scale(1); opacity: 0.2; }
          to   { transform: translateY(-28px) scale(1.6); opacity: 0.9; }
        }

        /* Card */
        .auth-card {
          width: 100%; max-width: 420px;
          background: rgba(13,16,27,0.62);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          padding: 40px 36px;
          box-shadow:
            0 0 0 1px rgba(99,102,241,0.12),
            0 24px 64px rgba(0,0,0,0.55),
            0 0 80px rgba(99,102,241,0.07);
          position: relative; z-index: 1;
          opacity: 0; transform: translateY(22px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .auth-card-visible { opacity: 1; transform: translateY(0); }

        /* Header */
        .auth-header {
          display: flex; flex-direction: column; align-items: center;
          margin-bottom: 28px; gap: 10px;
        }
        .auth-logo-ring {
          width: 68px; height: 68px; border-radius: 22px;
          background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2));
          border: 1px solid rgba(99,102,241,0.35);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          box-shadow: 0 0 32px rgba(99,102,241,0.22), inset 0 0 20px rgba(99,102,241,0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .auth-logo-ring:hover {
          transform: scale(1.06);
          box-shadow: 0 0 44px rgba(99,102,241,0.38), inset 0 0 20px rgba(99,102,241,0.1);
        }
        .auth-logo {
          width: 48px; height: 48px; border-radius: 14px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          display: flex; align-items: center; justify-content: center;
          animation: logoPulse 3.5s ease-in-out infinite;
        }
        @keyframes logoPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.5); }
          50%       { box-shadow: 0 0 0 10px rgba(99,102,241,0); }
        }
        .auth-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.28);
          color: #10b981;
          font-size: 10px; font-weight: 600;
          padding: 3px 10px; border-radius: 20px;
          letter-spacing: 0.03em;
        }
        .auth-title {
          font-size: 26px; font-weight: 800;
          margin: 0; letter-spacing: -0.5px;
          background: linear-gradient(135deg, #f8fafc 30%, rgba(168,85,247,0.9) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .auth-subtitle {
          font-size: 12px; color: #64748b; margin: 0;
          text-align: center; max-width: 250px;
        }

        /* Error */
        .auth-error {
          background: rgba(239,68,68,0.09);
          border: 1px solid rgba(239,68,68,0.28);
          color: #fca5a5;
          border-radius: 10px; padding: 10px 14px;
          font-size: 12px; margin-bottom: 16px;
          display: flex; align-items: center; gap: 8px;
          animation: slideIn 0.3s ease;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Form fields */
        .auth-form { display: flex; flex-direction: column; gap: 18px; }
        .auth-field { display: flex; flex-direction: column; gap: 6px; }
        .auth-label {
          font-size: 10.5px; font-weight: 700;
          color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em;
        }
        .auth-label-row { display: flex; align-items: center; justify-content: space-between; }
        .auth-input-wrap { position: relative; }
        .auth-input-icon {
          position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
          width: 15px; height: 15px; color: #475569;
          transition: color 0.2s; pointer-events: none;
        }
        .auth-input-wrap:focus-within .auth-input-icon { color: #6366f1; }
        .auth-input {
          width: 100%; box-sizing: border-box;
          padding: 11px 14px 11px 42px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: #f8fafc; border-radius: 12px;
          font-size: 13.5px; font-family: inherit;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .auth-input::placeholder { color: #2d3748; }
        .auth-input:focus {
          border-color: rgba(99,102,241,0.65);
          background: rgba(99,102,241,0.04);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.13), 0 0 20px rgba(99,102,241,0.07);
        }
        .auth-input-pad-right { padding-right: 44px; }
        .auth-eye-btn {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #475569; display: flex; align-items: center;
          padding: 4px; transition: color 0.2s; border-radius: 6px;
        }
        .auth-eye-btn:hover { color: #94a3b8; }
        .auth-link-small {
          font-size: 11px; color: #6366f1;
          text-decoration: none; font-weight: 600;
          transition: color 0.2s;
        }
        .auth-link-small:hover { color: #a5b4fc; }

        /* Remember me */
        .auth-remember {
          display: flex; align-items: center; gap: 10px; cursor: pointer;
        }
        .auth-checkbox {
          width: 18px; height: 18px; border-radius: 5px;
          border: 1.5px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.03);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800; color: white;
          cursor: pointer; flex-shrink: 0;
          transition: all 0.2s;
        }
        .auth-checkbox-on {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-color: #6366f1;
          box-shadow: 0 0 8px rgba(99,102,241,0.4);
        }
        .auth-remember-text { font-size: 12px; color: #64748b; user-select: none; }

        /* Submit button */
        .auth-submit-btn {
          margin-top: 6px; width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
          color: #fff; font-size: 14px; font-weight: 700;
          font-family: inherit; border: none; border-radius: 14px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 24px rgba(99,102,241,0.38);
          letter-spacing: 0.02em; position: relative; overflow: hidden;
        }
        .auth-submit-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: translateX(-100%); transition: transform 0.45s ease;
        }
        .auth-submit-btn:hover::before { transform: translateX(100%); }
        .auth-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 36px rgba(99,102,241,0.55);
        }
        .auth-submit-btn:active { transform: translateY(0); }
        .auth-submit-btn:disabled {
          opacity: 0.6; cursor: not-allowed; transform: none;
          box-shadow: none;
        }
        .auth-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Footer */
        .auth-footer {
          margin-top: 28px; text-align: center;
          font-size: 12px; color: #475569;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 20px;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .auth-link {
          color: #6366f1; font-weight: 700;
          text-decoration: none; transition: color 0.2s;
        }
        .auth-link:hover { color: #a5b4fc; }

        .sr-only {
          position: absolute; width: 1px; height: 1px;
          padding: 0; margin: -1px; overflow: hidden;
          clip: rect(0,0,0,0); border: 0;
        }
      `}</style>
    </div>
  )
}
