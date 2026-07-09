import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { 
  StickyNote, 
  Plus, 
  Search, 
  FolderPlus, 
  Star, 
  Trash2, 
  Save, 
  Sparkles, 
  Folder,
  Check
} from 'lucide-react'

interface Note {
  id: string
  title: string
  content: string
  folder: string
  category: string
  isBookmarked: boolean
  updatedAt: string
}

interface NoteAnalysis {
  notesCount: number
  folders: string[]
  suggestedAction: string
  recentBookmarks: { id: string; title: string; folder: string }[]
}

export default function NotesPage() {
  const { token } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [analysis, setAnalysis] = useState<NoteAnalysis | null>(null)
  const [loading, setLoading] = useState(true)

  // Editor states
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [editorTitle, setEditorTitle] = useState('')
  const [editorContent, setEditorContent] = useState('')
  const [editorFolder, setEditorFolder] = useState('General')
  const [editorCategory, setEditorCategory] = useState('Uncategorized')
  const [saving, setSaving] = useState(false)

  // Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolderFilter, setSelectedFolderFilter] = useState('ALL')

  const fetchNotes = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/notes', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setNotes(data.notes)
        setAnalysis(data.analysis)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchNotes()
    }
  }, [token])

  const selectNoteForEdit = (note: Note) => {
    setSelectedNote(note)
    setEditorTitle(note.title)
    setEditorContent(note.content)
    setEditorFolder(note.folder)
    setEditorCategory(note.category)
  }

  const handleCreateNewNote = () => {
    setSelectedNote(null)
    setEditorTitle('Untitled Note')
    setEditorContent('')
    setEditorFolder('General')
    setEditorCategory('Uncategorized')
  }

  const handleSaveNote = async () => {
    if (!token || !editorTitle) return
    setSaving(true)
    try {
      let res
      if (selectedNote) {
        // Edit note
        res = await fetch(`/api/notes/${selectedNote.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: editorTitle,
            content: editorContent,
            folder: editorFolder,
            category: editorCategory
          })
        })
      } else {
        // Create note
        res = await fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: editorTitle,
            content: editorContent,
            folder: editorFolder,
            category: editorCategory
          })
        })
      }
      
      if (res.ok) {
        const data = await res.json()
        fetchNotes()
        if (!selectedNote) {
          // If created, select it
          setSelectedNote(data)
        } else {
          setSelectedNote({
            ...selectedNote,
            title: editorTitle,
            content: editorContent,
            folder: editorFolder,
            category: editorCategory
          })
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteNote = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this note?')) return
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        if (selectedNote?.id === id) {
          handleCreateNewNote()
        }
        fetchNotes()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleBookmark = async (note: Note) => {
    if (!token) return
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isBookmarked: !note.isBookmarked })
      })
      if (res.ok) {
        fetchNotes()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const filteredNotes = notes.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFolder = selectedFolderFilter === 'ALL' || n.folder === selectedFolderFilter
    return matchesSearch && matchesFolder
  })

  // Aggregate list of unique folders
  const allFoldersList = analysis?.folders || ['General']

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Synchronizing notebook files...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-10rem)]">
      
      {/* Upper header */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-white Outfit">Notebook Workspace</h2>
          <p className="text-xs text-slate-400 mt-1">Take rich notes, organize folders, bookmark formulas, and search entries</p>
        </div>
        <button
          onClick={handleCreateNewNote}
          className="px-4 py-2 rounded-lg font-semibold text-xs glass-button flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Main Grid: Left Notes Feed, Right Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 text-left">
        
        {/* Left Side: Notes list & folder controls */}
        <div className="lg:col-span-1 flex flex-col gap-4 min-h-0">
          
          {/* Notes Agent Advice */}
          {analysis && (
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex gap-2 items-start flex-shrink-0">
              <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-400 animate-pulse" />
              <span>{analysis.suggestedAction}</span>
            </div>
          )}

          {/* Search bar */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search note content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg glass-input text-xs"
            />
          </div>

          {/* Folder tabs filters */}
          <div className="flex gap-1.5 overflow-x-auto py-1 flex-shrink-0 border-b border-white/5 scrollbar-thin">
            <button
              onClick={() => setSelectedFolderFilter('ALL')}
              className={`px-3 py-1 rounded-full text-[10px] font-semibold flex-shrink-0 border ${
                selectedFolderFilter === 'ALL'
                  ? 'bg-indigo-500/20 border-indigo-500/30 text-white'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              All Notes
            </button>
            {allFoldersList.map((fold) => (
              <button
                key={fold}
                onClick={() => setSelectedFolderFilter(fold)}
                className={`px-3 py-1 rounded-full text-[10px] font-semibold flex-shrink-0 border ${
                  selectedFolderFilter === fold
                    ? 'bg-indigo-500/20 border-indigo-500/30 text-white'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {fold}
              </button>
            ))}
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
            {filteredNotes.map((note) => {
              const isSelected = selectedNote?.id === note.id
              return (
                <div
                  key={note.id}
                  onClick={() => selectNoteForEdit(note)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-500/10 border-indigo-500/30 shadow-inner'
                      : 'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] text-slate-500 font-bold uppercase flex items-center gap-1">
                      <Folder className="w-3 h-3 text-slate-500" />
                      <span>{note.folder}</span>
                    </span>
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleBookmark(note)
                        }}
                        className={`p-1 rounded hover:bg-white/10 ${note.isBookmarked ? 'text-amber-400' : 'text-slate-500'}`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteNote(note.id)
                        }}
                        className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-white mb-1 truncate">{note.title || 'Untitled Note'}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {note.content || 'Empty note content.'}
                  </p>
                </div>
              )
            })}

            {filteredNotes.length === 0 && (
              <div className="py-16 text-center text-xs text-slate-500">No notes found. Click "New Note" to create one.</div>
            )}
          </div>

        </div>

        {/* Right Side: Note Editor Workspace */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between min-h-0">
          
          <div className="flex flex-col gap-4 flex-1 min-h-0">
            {/* Header controls for editor */}
            <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3.5 flex-shrink-0">
              <input
                type="text"
                placeholder="Enter Note Title..."
                value={editorTitle}
                onChange={(e) => setEditorTitle(e.target.value)}
                className="bg-transparent border-none text-lg font-bold text-white outline-none w-full focus:ring-0"
              />
              <button
                onClick={handleSaveNote}
                disabled={saving}
                className="px-4 py-2 rounded-lg text-xs font-semibold glass-button flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Note</span>
                  </>
                )}
              </button>
            </div>

            {/* Folder and Category inputs */}
            <div className="grid grid-cols-2 gap-4 flex-shrink-0">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-500 font-bold uppercase">Folder Path</label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics, Exams"
                  value={editorFolder}
                  onChange={(e) => setEditorFolder(e.target.value)}
                  className="px-3 py-1.5 rounded border border-white/10 bg-[#0d101b] text-slate-300 outline-none text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-slate-500 font-bold uppercase">Category Tag</label>
                <input
                  type="text"
                  placeholder="e.g. Formulas, Definitions"
                  value={editorCategory}
                  onChange={(e) => setEditorCategory(e.target.value)}
                  className="px-3 py-1.5 rounded border border-white/10 bg-[#0d101b] text-slate-300 outline-none text-xs"
                />
              </div>
            </div>

            {/* Content Textarea */}
            <div className="flex-1 min-h-0 mt-2">
              <textarea
                placeholder="Start writing notes in markdown format..."
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                className="w-full h-full bg-transparent border-none text-slate-200 outline-none resize-none text-xs focus:ring-0 leading-relaxed font-mono"
              ></textarea>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 text-right mt-3 border-t border-white/5 pt-3.5 flex-shrink-0">
            Press "Save Note" to update note entries in the local SQLite db.
          </div>
        </div>

      </div>

    </div>
  )
}
