import { runAttendanceAgent } from './attendance'
import { runAssignmentAgent } from './assignment'
import { runExamAgent } from './exam'
import { runNotesAgent } from './notes'
import { runProjectAgent } from './project'
import { runCareerAgent } from './career'
import { runPlacementAgent } from './placement'
import { runProductivityAgent } from './productivity'
import { runNotificationAgent } from './notification'
import { prisma } from '../lib/prisma'

export interface CEODigest {
  advisorSummary: string
  priorityInsights: string[]
  criticalAlertsCount: number
  stats: {
    overallAttendance: number
    attendanceStatus: 'SAFE' | 'WARNING' | 'CRITICAL'
    pendingAssignments: number
    upcomingExamsCount: number
    activeProjectsCount: number
    focusScore: number
    dsaSolvedCount: number
    careerProgress: number
  }
}

export async function runCEOAgent(userId: string): Promise<CEODigest> {
  // Check notifications state
  await runNotificationAgent(userId)

  // Run child agents
  const attendanceRes = await runAttendanceAgent(userId)
  const assignmentRes = await runAssignmentAgent(userId)
  const examRes = await runExamAgent(userId)
  const notesRes = await runNotesAgent(userId)
  const projectRes = await runProjectAgent(userId)
  const careerRes = await runCareerAgent(userId)
  const placementRes = await runPlacementAgent(userId)
  const productivityRes = await runProductivityAgent(userId)

  // Overall attendance percentages
  const totalClasses = attendanceRes.reduce((sum, item) => sum + item.totalClasses, 0)
  const totalPresent = attendanceRes.reduce((sum, item) => sum + item.presentCount, 0)
  const overallAttendance = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 100

  let attendanceStatus: 'SAFE' | 'WARNING' | 'CRITICAL' = 'SAFE'
  if (attendanceRes.some(a => a.status === 'CRITICAL')) {
    attendanceStatus = 'CRITICAL'
  } else if (attendanceRes.some(a => a.status === 'WARNING')) {
    attendanceStatus = 'WARNING'
  }

  const pendingAssignments = assignmentRes.length
  const upcomingExamsCount = examRes.length
  const activeProjectsCount = projectRes.filter(p => p.progress < 100).length

  // Build system alerts list
  const priorityInsights: string[] = []
  let criticalAlertsCount = 0

  // 1. Attendance warning alerts
  const criticalAttendance = attendanceRes.filter(a => a.status === 'CRITICAL')
  for (const item of criticalAttendance) {
    priorityInsights.push(`Attendance Alert: Your attendance in ${item.subjectName} is ${item.currentPercent}%. Attend classes immediately!`)
    criticalAlertsCount++
  }

  // 2. Assignment deadline alerts
  const urgentAssignments = assignmentRes.filter(a => a.priority === 'HIGH')
  if (urgentAssignments.length > 0) {
    priorityInsights.push(`Urgent Assignment: "${urgentAssignments[0].title}" is due soon. Action: ${urgentAssignments[0].actionPlan}`)
    criticalAlertsCount++
  }

  // 3. Project deadline warnings
  const criticalProjects = projectRes.filter(p => p.status === 'CRITICAL')
  if (criticalProjects.length > 0) {
    priorityInsights.push(`Project Delay Warning: "${criticalProjects[0].projectName}" is due soon but is only at ${criticalProjects[0].progress}% completion.`)
    criticalAlertsCount++
  }

  // 4. Closest exam alerts
  if (examRes.length > 0) {
    const nextExam = examRes[0]
    if (nextExam.daysLeft <= 3) {
      priorityInsights.push(`Exam Alert: ${nextExam.subjectName} is in ${nextExam.daysLeft} days. Current readiness: ${nextExam.readinessScore}%.`)
      if (nextExam.daysLeft <= 1) criticalAlertsCount++
    }
  }

  // Add default suggestions if no critical alerts present
  if (priorityInsights.length === 0) {
    priorityInsights.push(notesRes.suggestedAction)
    if (placementRes.recommendedTopics.length > 0) {
      priorityInsights.push(`DSA Practice: Try practicing "${placementRes.recommendedTopics[0]}" to prepare for upcoming company interviews.`)
    }
    priorityInsights.push(`Career Path: Currently advancing "${careerRes.title}". Goal skills are ${careerRes.progressPercent}% complete.`)
  }

  // Formulate overall CEO message
  let advisorSummary = ''
  if (criticalAlertsCount > 0) {
    advisorSummary = `System Alert: There are ${criticalAlertsCount} items requiring immediate action. Prioritize low attendance courses and upcoming assignments.`
  } else {
    advisorSummary = `System Healthy: Daily focus score is high. Attendance averages are steady, and project targets are currently met.`
  }

  return {
    advisorSummary,
    priorityInsights,
    criticalAlertsCount,
    stats: {
      overallAttendance,
      attendanceStatus,
      pendingAssignments,
      upcomingExamsCount,
      activeProjectsCount,
      focusScore: productivityRes.averageFocusScore || 100,
      dsaSolvedCount: placementRes.dsaSolvedCount,
      careerProgress: careerRes.progressPercent
    }
  }
}
