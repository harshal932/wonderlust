import { prisma } from '../lib/prisma'

export interface AssignmentTask {
  id: string
  title: string
  subjectName: string
  deadline: Date
  daysRemaining: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  status: string
  agentPriorityScore: number
  actionPlan: string
}

export async function runAssignmentAgent(userId: string): Promise<AssignmentTask[]> {
  const pendingAssignments = await prisma.assignment.findMany({
    where: {
      userId,
      status: { in: ['PENDING', 'IN_PROGRESS'] }
    },
    include: { subject: true }
  })

  const now = new Date()
  const tasks: AssignmentTask[] = []

  for (const item of pendingAssignments) {
    const diffTime = item.deadline.getTime() - now.getTime()
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

    let baseScore = 100 - (daysRemaining * 10)
    if (item.priority === 'HIGH') baseScore += 20
    if (item.priority === 'MEDIUM') baseScore += 10
    
    const priorityScore = Math.max(0, baseScore)

    let finalPriority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW'
    if (daysRemaining <= 2 || item.priority === 'HIGH') {
      finalPriority = 'HIGH'
    } else if (daysRemaining <= 5 || item.priority === 'MEDIUM') {
      finalPriority = 'MEDIUM'
    }

    let actionPlan = ''
    if (finalPriority === 'HIGH') {
      actionPlan = `URGENT: Allocate 2 hours today to complete this before the deadline in ${daysRemaining} days.`
    } else if (finalPriority === 'MEDIUM') {
      actionPlan = `Plan to start this in the next 48 hours. Estimated study time: 1.5 hours.`
    } else {
      actionPlan = `Add this to your weekly goals. Revisit in 3 days.`
    }

    tasks.push({
      id: item.id,
      title: item.title,
      subjectName: item.subject.name,
      deadline: item.deadline,
      daysRemaining,
      priority: finalPriority,
      status: item.status,
      agentPriorityScore: priorityScore,
      actionPlan
    })
  }

  return tasks.sort((a, b) => b.agentPriorityScore - a.agentPriorityScore)
}
