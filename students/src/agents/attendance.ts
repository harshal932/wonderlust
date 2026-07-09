import { prisma } from '../lib/prisma'

export interface AttendanceSuggestion {
  subjectId: string
  subjectName: string
  subjectCode: string
  currentPercent: number
  totalClasses: number
  presentCount: number
  absentCount: number
  status: 'SAFE' | 'WARNING' | 'CRITICAL'
  suggestion: string
}

export async function runAttendanceAgent(userId: string): Promise<AttendanceSuggestion[]> {
  const subjects = await prisma.subject.findMany({
    where: { userId },
    include: { attendance: true }
  })

  const suggestions: AttendanceSuggestion[] = []

  for (const subject of subjects) {
    const logs = subject.attendance
    const total = logs.length
    const present = logs.filter(l => l.status === 'PRESENT').length
    const absent = logs.filter(l => l.status === 'ABSENT').length
    
    let currentPercent = 100
    if (total > 0) {
      currentPercent = Math.round((present / total) * 100)
    }

    let status: 'SAFE' | 'WARNING' | 'CRITICAL' = 'SAFE'
    let suggestion = ''

    if (currentPercent < 75) {
      status = 'CRITICAL'
      // (present + x) / (total + x) >= 0.75 => x >= 3 * total - 4 * present
      const needed = Math.max(1, Math.ceil((0.75 * total - present) / 0.25))
      suggestion = `Attendance is below 75%! You MUST attend the next ${needed} classes consecutively to recover.`
    } else {
      // present / (total + y) >= 0.75 => y <= (4 * present - 3 * total) / 3
      const skippable = Math.max(0, Math.floor((4 * present - 3 * total) / 3))
      if (currentPercent < 80) {
        status = 'WARNING'
        suggestion = `Caution: Attendance is close to threshold. Do not skip any classes.`
      } else {
        status = 'SAFE'
        suggestion = skippable > 0 
          ? `You have a healthy attendance record. You can safely skip the next ${skippable} classes.`
          : `Attendance is safe, but skipping the next class will put you at risk.`
      }
    }

    suggestions.push({
      subjectId: subject.id,
      subjectName: subject.name,
      subjectCode: subject.code,
      currentPercent,
      totalClasses: total,
      presentCount: present,
      absentCount: absent,
      status,
      suggestion
    })
  }

  return suggestions
}
