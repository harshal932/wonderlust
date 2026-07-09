import { prisma } from '../lib/prisma'

export interface ProjectWarning {
  projectId: string
  projectName: string
  progress: number
  deadline: Date
  daysRemaining: number
  uncompletedTasksCount: number
  status: 'SAFE' | 'WARNING' | 'CRITICAL'
  suggestion: string
}

export async function runProjectAgent(userId: string): Promise<ProjectWarning[]> {
  const projects = await prisma.project.findMany({
    where: { userId },
    include: { tasks: true }
  })

  const now = new Date()
  const warnings: ProjectWarning[] = []

  for (const project of projects) {
    const diffTime = project.deadline.getTime() - now.getTime()
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
    
    const uncompleted = project.tasks.filter(t => !t.completed).length

    let status: 'SAFE' | 'WARNING' | 'CRITICAL' = 'SAFE'
    let suggestion = ''

    if (project.status !== 'COMPLETED') {
      if (daysRemaining <= 3 && project.progress < 80) {
        status = 'CRITICAL'
        suggestion = `CRITICAL: Project is due in ${daysRemaining} days, but progress is only ${project.progress}%. Dedicate team/personal focus to the remaining ${uncompleted} tasks.`
      } else if (daysRemaining <= 7 && project.progress < 50) {
        status = 'WARNING'
        suggestion = `Caution: Project is due in 1 week, but progress is under 50%. Focus on the highest-priority tasks.`
      } else {
        status = 'SAFE'
        suggestion = `Project is progressing fine. Keep checking off sub-tasks.`
      }
    } else {
      status = 'SAFE'
      suggestion = `Project successfully completed! Celebrate and archive code repository.`
    }

    warnings.push({
      projectId: project.id,
      projectName: project.name,
      progress: project.progress,
      deadline: project.deadline,
      daysRemaining,
      uncompletedTasksCount: uncompleted,
      status,
      suggestion
    })
  }

  return warnings
}
