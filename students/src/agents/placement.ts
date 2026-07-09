import { prisma } from '../lib/prisma'

export interface PlacementSummary {
  dsaSolvedCount: number
  applicationsCount: number
  offersCount: number
  readinessScore: number
  resumeScore: number
  resumeSuggestions: string[]
  recommendedTopics: string[]
  recentApplications: { id: string; company: string; status: string }[]
}

export async function runPlacementAgent(userId: string): Promise<PlacementSummary> {
  const placements = await prisma.placement.findMany({
    where: { userId }
  })

  const dsaItems = placements.filter(p => p.type === 'DSA' && p.status === 'COMPLETED')
  const dsaSolvedCount = dsaItems.length

  const jobApplications = placements.filter(p => p.type === 'COMPANY')
  const applicationsCount = jobApplications.length
  const offersCount = jobApplications.filter(p => p.status === 'OFFERED').length

  const dsaComponent = Math.min(50, (dsaSolvedCount / 50) * 50)
  const appComponent = Math.min(30, (applicationsCount / 5) * 30)
  const offerComponent = offersCount > 0 ? 20 : 0
  const readinessScore = Math.min(100, Math.round(dsaComponent + appComponent + offerComponent))

  const resumeScore = Math.min(100, 60 + Math.min(25, dsaSolvedCount * 0.5) + (applicationsCount > 0 ? 10 : 0))

  const resumeSuggestions: string[] = []
  if (dsaSolvedCount < 10) {
    resumeSuggestions.push("Add technical project items to showcase programming versatility.")
  }
  if (applicationsCount === 0) {
    resumeSuggestions.push("Include a link to your GitHub profile and active web portfolio.")
  }
  if (dsaSolvedCount >= 10 && dsaSolvedCount < 30) {
    resumeSuggestions.push("Mention DSA milestones on your resume (e.g. 'Solved 20+ algorithmic structures').")
  }
  if (resumeSuggestions.length === 0) {
    resumeSuggestions.push("Resume format is excellent. Make project results quantifiable.")
  }

  const recommendedTopics: string[] = []
  if (dsaSolvedCount < 5) {
    recommendedTopics.push("Arrays & Hashing", "Two Pointers")
  } else if (dsaSolvedCount < 15) {
    recommendedTopics.push("Sliding Window", "Linked List", "Binary Search")
  } else if (dsaSolvedCount < 30) {
    recommendedTopics.push("Trees & BSTs", "Graphs DFS/BFS", "Recursion")
  } else {
    recommendedTopics.push("Dynamic Programming", "Heap / Priority Queue", "Union Find")
  }

  const recentApplications = jobApplications.map(app => ({
    id: app.id,
    company: app.title,
    status: app.status
  })).slice(0, 5)

  return {
    dsaSolvedCount,
    applicationsCount,
    offersCount,
    readinessScore,
    resumeScore,
    resumeSuggestions,
    recommendedTopics,
    recentApplications
  }
}
