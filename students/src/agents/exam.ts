import { prisma } from '../lib/prisma'

export interface ExamPlan {
  id: string
  subjectName: string
  date: Date
  time: string | null
  daysLeft: number
  readinessScore: number
  studyPlan: string
}

export async function runExamAgent(userId: string): Promise<ExamPlan[]> {
  const exams = await prisma.exam.findMany({
    where: { userId },
    include: { subject: true }
  })

  const now = new Date()
  const plans: ExamPlan[] = []

  for (const exam of exams) {
    const diffTime = exam.date.getTime() - now.getTime()
    const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

    // Fetch study logs for this user/subject in the last 7 days
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const logs = await prisma.productivityLog.findMany({
      where: {
        userId,
        createdAt: { gte: oneWeekAgo },
        activity: { contains: exam.subject.name }
      }
    })

    const totalMinutes = logs.reduce((sum, log) => sum + log.duration, 0)
    const totalHours = totalMinutes / 60

    let readinessScore = exam.readinessScore
    if (totalHours > 5) {
      readinessScore = Math.min(100, readinessScore + 10)
    } else if (daysLeft <= 2 && totalHours < 1) {
      readinessScore = Math.max(10, readinessScore - 15)
    }

    let studyPlan = ''
    if (daysLeft === 0) {
      studyPlan = `Exam is TODAY! Do a quick formulas review and stay calm. Good luck!`
    } else if (daysLeft === 1) {
      studyPlan = `Exam is TOMORROW. Take a mock test and sleep early. Review weak summaries.`
    } else if (daysLeft <= 3) {
      studyPlan = `Critical stage: Solve past papers. Plan for 3 hours of focused study today.`
    } else {
      studyPlan = `Steady progress: Review 1 chapter every 2 days. Focus: 1 hour/day.`
    }

    plans.push({
      id: exam.id,
      subjectName: exam.subject.name,
      date: exam.date,
      time: exam.time,
      daysLeft,
      readinessScore,
      studyPlan
    })
  }

  return plans.sort((a, b) => a.daysLeft - b.daysLeft)
}
