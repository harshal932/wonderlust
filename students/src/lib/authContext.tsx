import React, { createContext, useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'

interface User {
  id: string
  username: string
  name: string
  department?: string
  branch?: string
  semester?: number
  targetCGPA?: number
  careerGoal?: string
  productivityScore?: number
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (username: string, password: string) => Promise<boolean>
  register: (userData: any) => Promise<boolean>
  logout: () => void
  updateProfile: (profileData: Partial<User>) => Promise<boolean>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Load local auth session on boot
    const storedToken = localStorage.getItem('aicos_token')
    const storedUser = localStorage.getItem('aicos_user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      // Verify token is still valid with backend
      fetchProfile(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchProfile = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        localStorage.setItem('aicos_user', JSON.stringify(data.user))
      } else {
        // Token expired/invalid
        logout()
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    if (token) {
      await fetchProfile(token)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (res.ok && data.token) {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('aicos_token', data.token)
        localStorage.setItem('aicos_user', JSON.stringify(data.user))
        // Fetch full profile info right after login
        await fetchProfile(data.token)
        return true
      } else {
        throw new Error(data.error || 'Login failed')
      }
    } catch (err: any) {
      alert(err.message || 'Login error occurred')
      return false
    }
  }

  const register = async (userData: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
      const data = await res.json()
      if (res.ok && data.token) {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('aicos_token', data.token)
        localStorage.setItem('aicos_user', JSON.stringify(data.user))
        await fetchProfile(data.token)
        return true
      } else {
        throw new Error(data.error || 'Registration failed')
      }
    } catch (err: any) {
      alert(err.message || 'Registration error occurred')
      return false
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('aicos_token')
    localStorage.removeItem('aicos_user')
    router.push('/')
  }

  const updateProfile = async (profileData: Partial<User>): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data.user)
        localStorage.setItem('aicos_user', JSON.stringify(data.user))
        return true
      } else {
        throw new Error(data.error || 'Failed to update profile')
      }
    } catch (err: any) {
      alert(err.message || 'Profile update failed')
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
