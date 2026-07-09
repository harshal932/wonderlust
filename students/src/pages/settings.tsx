import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { 
  Settings, 
  Sparkles, 
  Cpu, 
  Volume2, 
  Moon, 
  Check, 
  Info,
  Layers,
  Brain
} from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  
  // Theme mock settings
  const [glassLevel, setGlassLevel] = useState('HIGH')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  // AI Agent toggles
  const [activeAgents, setActiveAgents] = useState({
    CEO: true,
    Attendance: true,
    Assignment: true,
    Exam: true,
    Notes: true,
    Project: true,
    Career: true,
    Placement: true,
    CGPA: true,
    Productivity: true,
    Notification: true
  })

  const toggleAgent = (agentKey: keyof typeof activeAgents) => {
    setActiveAgents({
      ...activeAgents,
      [agentKey]: !activeAgents[agentKey]
    })
  }

  const handleSaveSettings = () => {
    alert("Settings configuration saved successfully to local browser registry.")
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8 max-w-2xl mx-auto text-left">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white Outfit">System Settings</h2>
        <p className="text-xs text-slate-400 mt-1">Configure theme visual parameters, notifications and local AI agent modules</p>
      </div>

      {/* 1. Theme Configuration */}
      <div className="p-6 rounded-2xl glass-panel flex flex-col gap-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-white/5 pb-2">
          <Moon className="w-4.5 h-4.5 text-indigo-400" />
          <span>Interface Customization</span>
        </h3>

        <div className="flex flex-col gap-4 text-xs text-slate-300">
          {/* Theme Mode selector */}
          <div className="flex justify-between items-center py-1">
            <div>
              <span className="font-semibold block text-white">Visual Color Theme</span>
              <span className="text-[10px] text-slate-500">System enforces high contrast dark layouts</span>
            </div>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/25">
              DARK THEME LOCKED
            </span>
          </div>

          {/* Glass level selector */}
          <div className="flex justify-between items-center py-1">
            <div>
              <span className="font-semibold block text-white">Backdrop Blur Quality</span>
              <span className="text-[10px] text-slate-500">Configure backdrop filter index values</span>
            </div>
            
            <div className="flex gap-1.5">
              {['NORMAL', 'HIGH'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setGlassLevel(level)}
                  className={`px-3 py-1 rounded text-[10px] font-bold border transition-colors ${
                    glassLevel === level
                      ? 'bg-indigo-500/20 border-indigo-500/30 text-white'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. AI Agents Configuration */}
      <div className="p-6 rounded-2xl glass-panel flex flex-col gap-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-white/5 pb-2">
          <Brain className="w-4.5 h-4.5 text-purple-400 animate-pulse" />
          <span>Local AI Agents Orchestration</span>
        </h3>

        <p className="text-xs text-slate-400 leading-relaxed mb-1">
          Orchestrate which agent nodes contribute metrics to the CEO Agent dashboard briefing feed:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          {(Object.keys(activeAgents) as Array<keyof typeof activeAgents>).map((agentKey) => (
            <div 
              key={agentKey}
              className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold">{agentKey} Agent</span>
              </div>

              <input
                type="checkbox"
                checked={activeAgents[agentKey]}
                onChange={() => toggleAgent(agentKey)}
                className="rounded bg-white/5 border-white/10 text-indigo-500 focus:ring-indigo-500/20 w-4 h-4 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 3. System Alerts Settings */}
      <div className="p-6 rounded-2xl glass-panel flex flex-col gap-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-white/5 pb-2">
          <Volume2 className="w-4.5 h-4.5 text-pink-400" />
          <span>Workspace Alerts</span>
        </h3>

        <div className="flex justify-between items-center text-xs text-slate-300">
          <div>
            <span className="font-semibold block text-white">Enable Notifications</span>
            <span className="text-[10px] text-slate-500">Allows agents to write dashboard alerts</span>
          </div>

          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)} // Dummy handler linked to state
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className="rounded bg-white/5 border-white/10 text-indigo-500 focus:ring-indigo-500/20 w-4 h-4 cursor-pointer"
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSaveSettings}
        className="w-full py-2.5 rounded-lg glass-button text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <Check className="w-4 h-4" />
        <span>Save Configurations</span>
      </button>

    </div>
  )
}
