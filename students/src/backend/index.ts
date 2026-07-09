import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { hashPassword, generateToken, verifyToken } from '../utils/auth'
import { runCEOAgent } from '../agents/ceo'
import { runAttendanceAgent } from '../agents/attendance'
import { runAssignmentAgent } from '../agents/assignment'
import { runExamAgent } from '../agents/exam'
import { runNotesAgent } from '../agents/notes'
import { runProjectAgent } from '../agents/project'
import { runCareerAgent } from '../agents/career'
import { runPlacementAgent } from '../agents/placement'
import { runCGPAAgent } from '../agents/cgpa'
import { runProductivityAgent } from '../agents/productivity'

const router = Router()

// Middleware to authenticate user via Token
export interface AuthenticatedRequest extends Request {
  userId?: string
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized. No authorization token.' })
    return 
  }
  const token = authHeader.split(' ')[1]
  const userId = verifyToken(token)
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized. Invalid session token.' })
    return 
  }
  req.userId = userId
  next()
}

// ----------------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------------

router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password, name, department, branch, semester } = req.body
    if (!username || !email || !password) {
      res.status(400).json({ error: 'Username, Email and Password are required.' })
      return
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] }
    })
    if (existingUser) {
      res.status(400).json({ error: 'Username or Email already registered.' })
      return
    }

    const hashedPassword = hashPassword(password)
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name: name || username,
        department: department || 'Engineering',
        branch: branch || 'Computer Science',
        semester: semester ? parseInt(semester) : 1
      }
    })

    // Seed default subjects for student
    const defaultSubjects = [
      { name: 'Mathematics', code: 'MTH-101', credits: 4 },
      { name: 'Computer Programming', code: 'CSE-102', credits: 4 },
      { name: 'Physics', code: 'PHY-103', credits: 3 },
      { name: 'Technical English', code: 'ENG-104', credits: 2 }
    ]

    for (const sub of defaultSubjects) {
      await prisma.subject.create({
        data: {
          name: sub.name,
          code: sub.code,
          credits: sub.credits,
          userId: user.id
        }
      })
    }

    const token = generateToken(user.id)
    res.status(201).json({ token, user: { id: user.id, username: user.username, name: user.name } })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      res.status(400).json({ error: 'Username and Password are required.' })
      return
    }

    const user = await prisma.user.findUnique({
      where: { username }
    })
    if (!user) {
      res.status(401).json({ error: 'Invalid username or password.' })
      return
    }

    const hashed = hashPassword(password)
    if (user.password !== hashed) {
      res.status(401).json({ error: 'Invalid username or password.' })
      return
    }

    const token = generateToken(user.id)
    res.json({ token, user: { id: user.id, username: user.username, name: user.name } })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/auth/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        department: true,
        branch: true,
        semester: true,
        targetCGPA: true,
        careerGoal: true,
        productivityScore: true
      }
    })
    res.json({ user })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/auth/profile', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const { name, department, branch, semester, targetCGPA, careerGoal } = req.body
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        department,
        branch,
        semester: semester ? parseInt(semester) : undefined,
        targetCGPA: targetCGPA ? parseFloat(targetCGPA) : undefined,
        careerGoal
      }
    })
    res.json({ user: updated })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ----------------------------------------------------
// DASHBOARD & MULTI-AGENT ENDPOINTS
// ----------------------------------------------------

router.get('/dashboard', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const digest = await runCEOAgent(userId)
    res.json(digest)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ----------------------------------------------------
// ATTENDANCE MODULE
// ----------------------------------------------------

router.get('/attendance', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const suggestions = await runAttendanceAgent(userId)
    res.json({ subjects: suggestions })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/attendance/subject', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const { name, code, credits } = req.body
    if (!name || !code) {
      res.status(400).json({ error: 'Subject name and code are required.' })
      return
    }
    const subject = await prisma.subject.create({
      data: {
        name,
        code,
        credits: credits ? parseInt(credits) : 3,
        userId: userId
      }
    })
    res.status(201).json(subject)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/attendance/log', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const { subjectId, status, date } = req.body
    if (!subjectId || !status) {
      res.status(400).json({ error: 'SubjectId and status are required.' })
      return
    }
    const log = await prisma.attendance.create({
      data: {
        date: date ? new Date(date) : new Date(),
        status, // "PRESENT", "ABSENT"
        subjectId,
        userId: userId
      }
    })
    res.status(201).json(log)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ----------------------------------------------------
// ASSIGNMENT MODULE
// ----------------------------------------------------

router.get('/assignments', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const assignments = await runAssignmentAgent(userId)
    res.json({ assignments })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/assignments', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const { title, description, deadline, priority, subjectId } = req.body
    if (!title || !deadline || !subjectId) {
      res.status(400).json({ error: 'Title, deadline and subject are required.' })
      return
    }
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        deadline: new Date(deadline),
        priority: priority || 'MEDIUM',
        status: 'PENDING',
        subjectId,
        userId: userId
      }
    })
    res.status(201).json(assignment)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/assignments/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const id = req.params.id as string
    const { status, priority } = req.body
    
    const existing = await prisma.assignment.findUnique({
      where: { id }
    })
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ error: 'Assignment not found' })
      return
    }

    const assignment = await prisma.assignment.update({
      where: { id },
      data: { status, priority }
    })
    res.json(assignment)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ----------------------------------------------------
// EXAM MODULE
// ----------------------------------------------------

router.get('/exams', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const plans = await runExamAgent(userId)
    res.json({ exams: plans })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/exams', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const { subjectId, date, time, syllabus, readinessScore } = req.body
    if (!subjectId || !date) {
      res.status(400).json({ error: 'SubjectId and date are required.' })
      return
    }
    const exam = await prisma.exam.create({
      data: {
        subjectId,
        date: new Date(date),
        time,
        syllabus,
        readinessScore: readinessScore ? parseInt(readinessScore) : 50,
        userId: userId
      }
    })
    res.status(201).json(exam)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/exams/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const id = req.params.id as string
    const { readinessScore, syllabus } = req.body

    const existing = await prisma.exam.findUnique({
      where: { id }
    })
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ error: 'Exam not found' })
      return
    }

    const exam = await prisma.exam.update({
      where: { id },
      data: {
        readinessScore: readinessScore ? parseInt(readinessScore) : undefined,
        syllabus
      }
    })
    res.json(exam)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ----------------------------------------------------
// NOTES MODULE
// ----------------------------------------------------

router.get('/notes', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const notes = await prisma.note.findMany({
      where: { userId: userId },
      orderBy: { updatedAt: 'desc' }
    })
    const analysis = await runNotesAgent(userId)
    res.json({ notes, analysis })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/notes', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const { title, content, folder, category } = req.body
    if (!title || content === undefined) {
      res.status(400).json({ error: 'Title and content are required.' })
      return
    }
    const note = await prisma.note.create({
      data: {
        title,
        content,
        folder: folder || 'General',
        category: category || 'Uncategorized',
        userId: userId
      }
    })
    res.status(201).json(note)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/notes/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const id = req.params.id as string
    const { title, content, folder, category, isBookmarked } = req.body

    const existing = await prisma.note.findUnique({
      where: { id }
    })
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ error: 'Note not found' })
      return
    }

    const note = await prisma.note.update({
      where: { id },
      data: { title, content, folder, category, isBookmarked }
    })
    res.json(note)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/notes/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const id = req.params.id as string
    
    const existing = await prisma.note.findUnique({
      where: { id }
    })
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ error: 'Note not found' })
      return
    }

    await prisma.note.delete({
      where: { id }
    })
    res.json({ success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ----------------------------------------------------
// PROJECT TRACKER (KANBAN)
// ----------------------------------------------------

router.get('/projects', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const projects = await prisma.project.findMany({
      where: { userId: userId },
      include: { tasks: true },
      orderBy: { deadline: 'asc' }
    })
    const agentWarnings = await runProjectAgent(userId)
    res.json({ projects, warnings: agentWarnings })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/projects', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const { name, description, priority, deadline } = req.body
    if (!name || !deadline) {
      res.status(400).json({ error: 'Project name and deadline are required.' })
      return
    }
    const project = await prisma.project.create({
      data: {
        name,
        description,
        priority: priority || 'MEDIUM',
        status: 'TODO',
        progress: 0,
        deadline: new Date(deadline),
        userId: userId
      }
    })
    res.status(201).json(project)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/projects/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const id = req.params.id as string
    const { status, progress, name, description, priority, deadline } = req.body

    const existing = await prisma.project.findUnique({
      where: { id }
    })
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ error: 'Project not found' })
      return
    }
    
    let computedProgress = progress !== undefined ? parseInt(progress) : undefined
    
    const updated = await prisma.project.update({
      where: { id },
      data: {
        status,
        progress: computedProgress,
        name,
        description,
        priority,
        deadline: deadline ? new Date(deadline) : undefined
      }
    })
    res.json(updated)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/projects/:id/task', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const id = req.params.id as string
    const { title } = req.body
    if (!title) {
      res.status(400).json({ error: 'Task title is required.' })
      return
    }

    const existingProject = await prisma.project.findUnique({
      where: { id }
    })
    if (!existingProject || existingProject.userId !== userId) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    const task = await prisma.task.create({
      data: {
        title,
        completed: false,
        projectId: id,
        userId: userId
      }
    })

    // Recalculate progress for parent project
    const allTasks = await prisma.task.findMany({
      where: { projectId: id }
    })
    const completed = allTasks.filter(t => t.completed).length
    const progressPercent = allTasks.length > 0 ? Math.round((completed / allTasks.length) * 100) : 0

    await prisma.project.update({
      where: { id: id },
      data: { progress: progressPercent }
    })

    res.status(201).json(task)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/projects/:id/task/:taskId', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const id = req.params.id as string
    const taskId = req.params.taskId as string
    const { completed } = req.body

    const existingProject = await prisma.project.findUnique({
      where: { id }
    })
    if (!existingProject || existingProject.userId !== userId) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { completed }
    })

    // Recalculate progress for parent project
    const allTasks = await prisma.task.findMany({
      where: { projectId: id }
    })
    const completedCount = allTasks.filter(t => t.completed).length
    const progressPercent = allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0

    await prisma.project.update({
      where: { id },
      data: { 
        progress: progressPercent,
        status: progressPercent === 100 ? 'COMPLETED' : undefined
      }
    })

    res.json(task)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ----------------------------------------------------
// PLACEMENT MODULE
// ----------------------------------------------------

router.get('/placements', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const summary = await runPlacementAgent(userId)
    const placements = await prisma.placement.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ summary, placements })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/placements', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const { type, title, status, description } = req.body
    if (!type || !title || !status) {
      res.status(400).json({ error: 'Type, title and status are required.' })
      return
    }
    const log = await prisma.placement.create({
      data: {
        type, // "DSA", "COMPANY", "INTERVIEW"
        title,
        status, // "COMPLETED" (for DSA), "APPLIED", "INTERVIEWING", "OFFERED", "REJECTED" (for Company)
        description,
        userId: userId
      }
    })
    res.status(201).json(log)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/placements/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const id = req.params.id as string
    const { status } = req.body

    const existing = await prisma.placement.findUnique({
      where: { id }
    })
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ error: 'Placement log not found' })
      return
    }

    const updated = await prisma.placement.update({
      where: { id },
      data: { status }
    })
    res.json(updated)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ----------------------------------------------------
// CAREER PLANNER MODULE
// ----------------------------------------------------

router.get('/career', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const roadmap = await runCareerAgent(userId)
    res.json(roadmap)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/career/skill', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const { skillName, completed } = req.body
    if (!skillName) {
      res.status(400).json({ error: 'SkillName is required.' })
      return
    }

    let goal = await prisma.careerGoal.findFirst({
      where: { userId: userId }
    })

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    const activePath = user?.careerGoal || 'SOFTWARE_ENGINEER'

    let completedSkills: string[] = []
    if (goal) {
      try {
        completedSkills = JSON.parse(goal.completedSkills)
      } catch {
        completedSkills = goal.completedSkills.split(',').filter(Boolean)
      }
    }

    if (completed) {
      if (!completedSkills.includes(skillName)) {
        completedSkills.push(skillName)
      }
    } else {
      completedSkills = completedSkills.filter(s => s !== skillName)
    }

    const skillsJson = JSON.stringify(completedSkills)

    if (goal) {
      goal = await prisma.careerGoal.update({
        where: { id: goal.id },
        data: { completedSkills: skillsJson, path: activePath }
      })
    } else {
      goal = await prisma.careerGoal.create({
        data: {
          path: activePath,
          completedSkills: skillsJson,
          userId: userId
        }
      })
    }

    res.json(goal)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ----------------------------------------------------
// CGPA CALCULATOR & PREDICTOR
// ----------------------------------------------------

router.post('/cgpa/predict', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const { currentGPA, completedCredits, expectedGrades } = req.body
    if (currentGPA === undefined || completedCredits === undefined || !expectedGrades) {
      res.status(400).json({ error: 'Current GPA, completed credits, and expected grades list are required.' })
      return
    }
    const prediction = await runCGPAAgent(userId, parseFloat(currentGPA), parseInt(completedCredits), expectedGrades)
    res.json(prediction)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ----------------------------------------------------
// PRODUCTIVITY (POMODORO & FOCUS TIMER)
// ----------------------------------------------------

router.get('/productivity', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const summary = await runProductivityAgent(userId)
    res.json(summary)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/productivity/log', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const { duration, focusScore, activity } = req.body
    if (!duration || !focusScore) {
      res.status(400).json({ error: 'Duration and FocusScore are required.' })
      return
    }
    const log = await prisma.productivityLog.create({
      data: {
        duration: parseInt(duration),
        focusScore: parseInt(focusScore),
        activity: activity || 'Pomodoro deep focus block',
        userId: userId
      }
    })

    const summary = await runProductivityAgent(userId)
    await prisma.user.update({
      where: { id: userId },
      data: { productivityScore: summary.averageFocusScore }
    })

    res.status(201).json(log)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ----------------------------------------------------
// NOTIFICATION DISPATCH
// ----------------------------------------------------

router.get('/notifications', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const list = await prisma.notification.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ notifications: list })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/notifications/:id/read', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId as string
    const id = req.params.id as string

    const existing = await prisma.notification.findUnique({
      where: { id }
    })
    if (!existing || existing.userId !== userId) {
      res.status(404).json({ error: 'Notification not found' })
      return
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true }
    })
    res.json(updated)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
