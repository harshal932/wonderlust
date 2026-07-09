import React, { useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { useAuth } from '../hooks/useAuth'
import { useRouter } from 'next/router'
import { Bell, Check, AlertTriangle, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Notification {
  id: string
  message: string
  read: boolean
  type: string
  createdAt: string
}

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)

  useEffect(() => {
    if (!loading && !user && !token && router.pathname !== '/' && !router.pathname.startsWith('/auth') && router.pathname !== '/about' && router.pathname !== '/features' && router.pathname !== '/pricing') {
      router.push('/auth/login')
    }
  }, [user, token, loading, router.pathname])

  const fetchNotifications = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications)
      }
    } catch (err) {
      console.error('Failed to load notifications:', err)
    }
  }

  useEffect(() => {
    if (token) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 15000)
      return () => clearInterval(interval)
    }
  }, [token])

  const markAsRead = async (id: string) => {
    if (!token) return
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06070a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Synchronizing Operating System...</p>
        </div>
      </div>
    )
  }

  const isStaticPage = router.pathname === '/' || router.pathname.startsWith('/auth') || router.pathname === '/about' || router.pathname === '/features' || router.pathname === '/pricing'

  if (isStaticPage) {
    return <>{children}</>
  }

  const pageTitle = router.pathname.replace('/', '').split('/')[0].replace('-', ' ') || 'Dashboard'

  return (
    <div className="min-h-screen bg-[#06070a] flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between sticky top-0 bg-[#06070a]/60 backdrop-blur-md z-30">
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide capitalize">
              {pageTitle === 'cgpa' ? 'CGPA Calculator' : pageTitle}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-indigo-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 glass-panel rounded-xl overflow-hidden shadow-2xl z-50 p-1 bg-[#0d101b]/95"
                  >
                    <div className="p-3 border-b border-white/5 font-semibold text-xs text-slate-300 flex justify-between items-center">
                      <span>SYSTEM ALERTS</span>
                      <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-indigo-300 font-bold">{unreadCount} UNREAD</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500">No active reminders.</div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id}
                            className={`p-3 border-b border-white/5 flex gap-2.5 items-start hover:bg-white/5 transition-colors ${notif.read ? 'opacity-60' : ''}`}
                          >
                            <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${notif.type === 'ATTENDANCE' ? 'text-rose-400' : 'text-indigo-400'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-white leading-normal">{notif.message}</p>
                              <span className="text-[9px] text-slate-500 block mt-1">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {!notif.read && (
                              <button
                                onClick={() => markAsRead(notif.id)}
                                className="p-1 rounded bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 flex-shrink-0"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile display */}
            <div className="flex items-center gap-2 border-l border-white/10 pl-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-indigo-400/30 flex items-center justify-center text-white font-semibold text-xs shadow-md shadow-indigo-500/25">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-white">{user?.name}</div>
                <div className="text-[9px] text-slate-400 truncate max-w-[120px]">{user?.branch}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content view */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
export default Layout;
