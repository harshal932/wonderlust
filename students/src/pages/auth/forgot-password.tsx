import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { BrainCircuit, Mail, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-[#06070a] flex items-center justify-center p-6 relative">
      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-2xl relative text-left">
        
        {/* Back Link */}
        <button
          onClick={() => router.push('/auth/login')}
          className="mb-6 px-3 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-slate-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Back to Sign In</span>
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center border border-indigo-400/20">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mt-4 Outfit">Password recovery</h2>
          <p className="text-xs text-slate-400 mt-1.5">Enter your email to receive a password reset token</p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-4 animate-bounce" />
            <h3 className="text-sm font-bold text-white">Reset Token Sent (Mocked)</h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-2">
              We have dispatched a mock password reset link to <strong className="text-slate-200">{email}</strong>. Check your local mailbox terminal.
            </p>
            <button
              onClick={() => router.push('/auth/login')}
              className="mt-6 w-full py-2 rounded-lg glass-button text-xs font-semibold"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">Registered Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="john@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-2.5 rounded-lg glass-button text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Dispatched Reset Token</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
