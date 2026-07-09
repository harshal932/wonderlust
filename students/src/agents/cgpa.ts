import { prisma } from '../lib/prisma'

export interface CGPAPrediction {
  currentCGPA: number
  targetCGPA: number
  predictedSemesterGPA: number
  predictedOverallCGPA: number
  requiredGPAForTarget: number
  status: 'ON_TRACK' | 'WARNING' | 'CRITICAL'
  advice: string
}

export async function runCGPAAgent(
  userId: string, 
  currentGPA: number, 
  completedCredits: number, 
  expectedGrades: { subjectId: string; expectedGradePoints: number }[]
): Promise<CGPAPrediction> {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  const targetCGPA = user?.targetCGPA || 8.5
  const subjects = await prisma.subject.findMany({
    where: { userId }
  })

  let totalSemesterCredits = 0
  let totalGradePoints = 0

  for (const exp of expectedGrades) {
    const subject = subjects.find(s => s.id === exp.subjectId)
    if (subject) {
      totalSemesterCredits += subject.credits
      totalGradePoints += subject.credits * exp.expectedGradePoints
    }
  }

  const predictedSemesterGPA = totalSemesterCredits > 0
    ? Number((totalGradePoints / totalSemesterCredits).toFixed(2))
    : 0.0

  const totalCreditsAfterSemester = completedCredits + totalSemesterCredits
  const predictedOverallCGPA = totalCreditsAfterSemester > 0
    ? Number(((currentGPA * completedCredits + predictedSemesterGPA * totalSemesterCredits) / totalCreditsAfterSemester).toFixed(2))
    : currentGPA

  const currentSemester = user?.semester || 1
  const completedSemesters = Math.max(1, currentSemester - 1)
  const totalSemesters = 8
  const remainingSemesters = Math.max(1, totalSemesters - completedSemesters)
  
  // (currentGPA * completedSemesters + requiredGPA * remainingSemesters) / totalSemesters = targetCGPA
  const requiredGPAForTarget = Number(
    ((targetCGPA * totalSemesters - currentGPA * completedSemesters) / remainingSemesters).toFixed(2)
  )

  let status: 'ON_TRACK' | 'WARNING' | 'CRITICAL' = 'ON_TRACK'
  let advice = ''

  if (predictedOverallCGPA >= targetCGPA) {
    status = 'ON_TRACK'
    advice = `Awesome! Your predicted CGPA (${predictedOverallCGPA}) is on track to meet or exceed your target (${targetCGPA}).`
  } else if (predictedOverallCGPA >= targetCGPA - 0.4) {
    status = 'WARNING'
    advice = `Warning: Predicted CGPA (${predictedOverallCGPA}) is slightly below your target (${targetCGPA}). Try raising one or two course grades to push it over.`
  } else {
    status = 'CRITICAL'
    advice = `Critical: Predicted CGPA (${predictedOverallCGPA}) is far below your target of ${targetCGPA}. You need a GPA of at least ${requiredGPAForTarget} in your remaining semesters.`
  }

  return {
    currentCGPA: currentGPA,
    targetCGPA,
    predictedSemesterGPA,
    predictedOverallCGPA,
    requiredGPAForTarget: Math.min(10.0, Math.max(0.0, requiredGPAForTarget)),
    status,
    advice
  }
}
