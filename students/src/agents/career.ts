import { prisma } from '../lib/prisma'

export interface CareerRoadmap {
  path: string
  title: string
  skills: { name: string; completed: boolean }[]
  recommendedProjects: string[]
  recommendedCourses: string[]
  timeline: string
  progressPercent: number
  agentAdvice: string
}

export const roadmapsData: Record<string, {
  title: string
  skills: string[]
  projects: string[]
  courses: string[]
  timeline: string
  advice: string
}> = {
  SOFTWARE_ENGINEER: {
    title: "Software Engineer Roadmap",
    skills: ["Java/C++ OOP", "Data Structures & Algorithms", "System Design", "Databases (SQL/NoSQL)", "CI/CD & Git"],
    projects: ["REST API E-Commerce Store", "Real-Time Chat App with WebSockets"],
    courses: ["Stanford Algorithms", "Modern System Design by ByteByteGo"],
    timeline: "Sem 1-4: Core DSA & OOP | Sem 5-6: System Design & Projects | Sem 7-8: LeetCode & Placement Applications",
    advice: "Focus heavily on LeetCode Mediums and understanding database concurrency."
  },
  AI_ENGINEER: {
    title: "AI Systems Engineer Roadmap",
    skills: ["Python & Math Essentials", "Machine Learning (Scikit-Learn)", "Deep Learning (PyTorch/TensorFlow)", "LLMs & Agentic Frameworks", "MLOps & Cloud Deployment"],
    projects: ["Image Classifier Model", "Fine-Tuned LLM Chatbot with LangChain"],
    courses: ["Andrew Ng Machine Learning Specialization", "Hugging Face Deep RL Course"],
    timeline: "Sem 1-4: Math, Stats & Python | Sem 5-6: Neural Networks & ML Models | Sem 7-8: LLM Fine-tuning & MLOps",
    advice: "Do not just build APIs; understand vector database indexing and GPU caching mechanisms."
  },
  CLOUD_ENGINEER: {
    title: "Cloud Infrastructure Architect Roadmap",
    skills: ["Linux & Networking Fundamentals", "AWS / Azure Cloud Core Services", "Docker Containerization", "Kubernetes Orchestration", "Terraform (Infrastructure as Code)"],
    projects: ["Multi-Tier App Deployed on AWS ECS", "Serverless REST API Pipeline"],
    courses: ["AWS Certified Solutions Architect", "Kubernetes Certified Administrator (CKA)"],
    timeline: "Sem 1-4: OS & Networking | Sem 5-6: AWS Core & Containers | Sem 7-8: IaC (Terraform) & CI/CD Pipelines",
    advice: "Deploy all your projects using Terraform scripts. Automation is the key to cloud design."
  },
  CYBERSECURITY: {
    title: "Information Security & Cybersecurity Roadmap",
    skills: ["Network Protocols & Wireshark", "Linux Shell Scripting", "Ethical Hacking (Kali Linux)", "Cryptography Algorithms", "SIEM Log Auditing"],
    projects: ["Automated Port Scanner Script", "Vulnerability Pentesting Sandbox"],
    courses: ["CompTIA Security+", "Certified Ethical Hacker (CEH)"],
    timeline: "Sem 1-4: Networking & Linux Scripting | Sem 5-6: Crypto & Pentest Tools | Sem 7-8: CTF Competitions & Audits",
    advice: "Engage in online CTFs (Capture The Flags). Hands-on network hacking is highly valued."
  },
  DATA_SCIENTIST: {
    title: "Data Scientist & Analytics Roadmap",
    skills: ["SQL Queries & Aggregations", "Python Pandas & NumPy", "Statistics & Hypothesis Testing", "Data Visualization (Tableau/Seaborn)", "Feature Engineering & Models"],
    projects: ["Housing Price Prediction Regression", "Customer Cohort Clustering Segmentation"],
    courses: ["Google Data Analytics Professional Certificate", "Applied Data Science by University of Michigan"],
    timeline: "Sem 1-4: Relational Databases & SQL | Sem 5-6: Stats & Data Wrangling | Sem 7-8: Feature Engineering & ML Models",
    advice: "Solidify your statistics base. Interviews focus heavily on hypothesis testing and A/B test setups."
  }
}

export async function runCareerAgent(userId: string): Promise<CareerRoadmap> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { careerGoals: true }
  })

  const goal = user?.careerGoal || "SOFTWARE_ENGINEER"
  const formattedGoal = goal.toUpperCase().replace(/\s+/g, '_')
  
  const roadmapInfo = roadmapsData[formattedGoal] || roadmapsData.SOFTWARE_ENGINEER

  let completedList: string[] = []
  if (user?.careerGoals && user.careerGoals.length > 0) {
    try {
      completedList = JSON.parse(user.careerGoals[0].completedSkills)
    } catch {
      completedList = user.careerGoals[0].completedSkills.split(',').map(s => s.trim())
    }
  }

  const skills = roadmapInfo.skills.map(s => ({
    name: s,
    completed: completedList.includes(s)
  }))

  const completedCount = skills.filter(s => s.completed).length
  const progressPercent = skills.length > 0 ? Math.round((completedCount / skills.length) * 100) : 0

  let agentAdvice = roadmapInfo.advice
  if (progressPercent === 0) {
    agentAdvice = `Get started by checking off your first skill: "${skills[0].name}". ${roadmapInfo.advice}`
  } else if (progressPercent > 80) {
    agentAdvice = `Excellent job! You have acquired almost all essential skills. Focus on the recommended Capstone projects now.`
  }

  return {
    path: formattedGoal,
    title: roadmapInfo.title,
    skills,
    recommendedProjects: roadmapInfo.projects,
    recommendedCourses: roadmapInfo.courses,
    timeline: roadmapInfo.timeline,
    progressPercent,
    agentAdvice
  }
}
