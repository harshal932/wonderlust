import { prisma } from '../lib/prisma'

export interface ProductivitySummary {
  dailyFocusMinutes: number
  averageFocusScore: number
  completedTasksCount: number
  habitsCompletedCount: number
  focusGrade: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT'
  advice: string
}

export async function runProductivityAgent(userId: string): Promise<ProductivitySummary> {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const logs = await prisma.productivityLog.findMany({
    where: {
      userId,
      createdAt: { gte: startOfDay }
    }
  })

  const completedTasks = await prisma.task.findMany({
    where: {
      userId,
      completed: true,
      updatedAt: { gte: startOfDay }
    }
  })

  const dailyFocusMinutes = logs.reduce((sum, log) => sum + log.duration, 0)
  const totalScore = logs.reduce((sum, log) => sum + log.focusScore, 0)
  const averageFocusScore = logs.length > 0 ? Math.round(totalScore / logs.length) : 0

  let focusGrade: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' = 'NEEDS_IMPROVEMENT'
  let advice = ''

  if (dailyFocusMinutes >= 120 && averageFocusScore >= 80) {
    focusGrade = 'EXCELLENT'
    advice = "Superb job! You achieved over 2 hours of Deep Work with high focus. Keep this rhythm going."
  } else if (dailyFocusMinutes >= 50) {
    focusGrade = 'GOOD'
    advice = "Solid effort. You hit a good study block. A 5-minute break will help maintain clarity."
  } else {
    focusGrade = 'NEEDS_IMPROVEMENT'
    advice = "Your study logs show low activity today. Start a 25-minute Pomodoro session to kickstart your focus."
  }

  // Habits completed count (mock representation linked to activity)
  const habitsCompletedCount = dailyFocusMinutes > 0 ? Math.min(3, Math.floor(dailyFocusMinutes / 40)) : 0

  return {
    dailyFocusMinutes,
    averageFocusScore,
    completedTasksCount: completedTasks.length,
    habitsCompletedCount,
    focusGrade,
    advice
  }
}
