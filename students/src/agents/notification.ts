import { prisma } from '../lib/prisma'

export async function runNotificationAgent(userId: string): Promise<number> {
  const now = new Date()
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)

  let newNotificationsCreated = 0

  const triggerNotification = async (message: string, type: string) => {
    const existing = await prisma.notification.findFirst({
      where: { userId, message, type }
    })
    if (!existing) {
      await prisma.notification.create({
        data: { userId, message, type, read: false }
      })
      newNotificationsCreated++
    }
  }

  // 1. Check upcoming assignments
  const urgentAssignments = await prisma.assignment.findMany({
    where: {
      userId,
      status: { in: ['PENDING', 'IN_PROGRESS'] },
      deadline: { lte: twoDaysFromNow, gte: now }
    },
    include: { subject: true }
  })

  for (const item of urgentAssignments) {
    const msg = `Assignment Alert: "${item.title}" for ${item.subject.name} is due within 48 hours!`
    await triggerNotification(msg, 'ASSIGNMENT')
  }

  // 2. Check low attendance
  const subjects = await prisma.subject.findMany({
    where: { userId },
    include: { attendance: true }
  })

  for (const subject of subjects) {
    const logs = subject.attendance
    const total = logs.length
    const present = logs.filter(l => l.status === 'PRESENT').length
    const percent = total > 0 ? Math.round((present / total) * 100) : 100

    if (total >= 2 && percent < 75) {
      const msg = `Attendance Shortage: ${subject.name} (${subject.code}) is at ${percent}%. You are below the 75% limit!`
      await triggerNotification(msg, 'ATTENDANCE')
    }
  }

  // 3. Check upcoming exams
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
  const closeExams = await prisma.exam.findMany({
    where: {
      userId,
      date: { lte: threeDaysFromNow, gte: now }
    },
    include: { subject: true }
  })

  for (const exam of closeExams) {
    const msg = `Exam Alert: ${exam.subject.name} is scheduled on ${exam.date.toDateString().slice(4, 15)}!`
    await triggerNotification(msg, 'EXAM')
  }

  return newNotificationsCreated
}
