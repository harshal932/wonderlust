import { prisma } from '../lib/prisma'

export interface NoteAnalysis {
  notesCount: number
  folders: string[]
  suggestedAction: string
  recentBookmarks: { id: string; title: string; folder: string }[]
}

export async function runNotesAgent(userId: string): Promise<NoteAnalysis> {
  const notes = await prisma.note.findMany({
    where: { userId }
  })

  const folders = Array.from(new Set(notes.map(n => n.folder)))
  const bookmarks = notes.filter(n => n.isBookmarked).map(n => ({
    id: n.id,
    title: n.title,
    folder: n.folder
  }))

  let suggestedAction = 'Create folders like "Class Notes" and "Reference Sheets" to organize your study files.'
  if (notes.length > 10 && folders.length <= 1) {
    suggestedAction = 'AI Alert: You have over 10 notes all in a single folder. We suggest creating separate folders for your active semester courses.'
  } else if (notes.length > 0 && bookmarks.length === 0) {
    suggestedAction = 'Tip: Bookmark critical exam revision sheets to keep them on your dashboard for fast access.'
  } else if (notes.length > 0) {
    suggestedAction = 'Notes file structure looks excellent and well distributed.'
  }

  return {
    notesCount: notes.length,
    folders,
    suggestedAction,
    recentBookmarks: bookmarks.slice(0, 5)
  }
}
