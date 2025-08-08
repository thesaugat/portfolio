import {
  User,
  FolderOpen,
  Code,
  Mail,
  FileText,
  Github,
  Linkedin,
  Twitter,
  Calendar,
  Database,
  Cloud,
  Smartphone,
  Brain,
  Wrench,
} from "lucide-react"
import type { DockItem, Notification, Project, SkillCategory, Experience, Education } from "@/types"

export const DOCK_ITEMS: DockItem[] = [
  { id: "about", icon: User, label: "About Me" },
  { id: "projects", icon: FolderOpen, label: "Projects" },
  { id: "skills", icon: Code, label: "Skills" },
  { id: "contact", icon: Mail, label: "Contact" },
  { id: "resume", icon: FileText, label: "Resume" },
]

export const SOCIAL_LINKS: DockItem[] = [
  { id: "github", icon: Github, label: "GitHub", href: "https://github.com/saugattimilsina" },
  { id: "linkedin", icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/in/saugattimilsina" },
  { id: "twitter", icon: Twitter, label: "Twitter", href: "https://twitter.com/saugattimilsina" },
]

export const NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    icon: Mail,
    title: "New Message",
    description: "Someone viewed your portfolio",
    time: "2 min ago",
    type: "message",
  },
  {
    id: "2",
    icon: Code,
    title: "Project Update",
    description: "AI Chat Integration completed",
    time: "1 hour ago",
    type: "update",
  },
  {
    id: "3",
    icon: Calendar,
    title: "Reminder",
    description: "Update portfolio projects",
    time: "3 hours ago",
    type: "reminder",
  },
]

export const PROJECTS: Project[] = [
  {
    id: 1,
    title: "AI-Powered E-commerce Platform",
    description:
      "A modern e-commerce platform with AI-driven product recommendations, intelligent search functionality, and personalized user experiences. Built with Next.js and integrated with OpenAI for smart features.",
    image: "/placeholder.svg?height=300&width=500&text=AI+E-commerce+Platform",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Node.js", "MongoDB", "OpenAI", "Stripe", "Redis"],
    github: "https://github.com/saugattimilsina/ai-ecommerce",
    demo: "https://ai-ecommerce-demo.vercel.app",
    featured: true,
  },
  {
    id: 2,
    title: "Real-time Chat Application",
    description:
      "A scalable chat application with real-time messaging, file sharing, video calling capabilities, and end-to-end encryption. Features include group chats, message reactions, and offline support.",
    image: "/placeholder.svg?height=300&width=500&text=Chat+Application",
    technologies: ["React", "Socket.io", "Express", "PostgreSQL", "WebRTC", "JWT", "AWS S3"],
    github: "https://github.com/saugattimilsina/realtime-chat",
    demo: "https://realtime-chat-demo.vercel.app",
    featured: true,
  },
  {
    id: 3,
    title: "Task Management Dashboard",
    description:
      "A comprehensive project management tool with team collaboration features, analytics, time tracking, and automated workflows. Includes Kanban boards, Gantt charts, and reporting.",
    image: "/placeholder.svg?height=300&width=500&text=Task+Management+Dashboard",
    technologies: ["Vue.js", "Nuxt.js", "Supabase", "Chart.js", "Vuetify", "PWA"],
    github: "https://github.com/saugattimilsina/task-manager",
    demo: "https://task-manager-demo.vercel.app",
    featured: false,
  },
  {
    id: 4,
    title: "Weather Forecast Mobile App",
    description:
      "A beautiful weather application with location-based forecasts, interactive maps, weather alerts, and detailed analytics. Features offline support and customizable widgets.",
    image: "/placeholder.svg?height=300&width=500&text=Weather+App",
    technologies: ["React Native", "Expo", "Weather API", "Maps", "AsyncStorage", "Push Notifications"],
    github: "https://github.com/saugattimilsina/weather-app",
    demo: "https://weather-app-demo.vercel.app",
    featured: false,
  },
  {
    id: 5,
    title: "Blockchain Voting System",
    description:
      "A secure and transparent voting system built on blockchain technology. Features voter authentication, real-time results, and immutable vote records with smart contract integration.",
    image: "/placeholder.svg?height=300&width=500&text=Blockchain+Voting",
    technologies: ["React", "Solidity", "Web3.js", "Ethereum", "MetaMask", "IPFS"],
    github: "https://github.com/saugattimilsina/blockchain-voting",
    demo: "https://blockchain-voting-demo.vercel.app",
    featured: true,
  },
  {
    id: 6,
    title: "Social Media Analytics Tool",
    description:
      "An advanced analytics platform for social media management with sentiment analysis, engagement tracking, competitor analysis, and automated reporting features.",
    image: "/placeholder.svg?height=300&width=500&text=Social+Analytics",
    technologies: ["Python", "Django", "React", "D3.js", "PostgreSQL", "Celery", "Redis"],
    github: "https://github.com/saugattimilsina/social-analytics",
    demo: "https://social-analytics-demo.vercel.app",
    featured: false,
  },
]

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: "Frontend Development",
    icon: Code,
    color: "blue",
    skills: [
      { name: "React", level: 95 },
      { name: "Next.js", level: 90 },
      { name: "TypeScript", level: 88 },
      { name: "Tailwind CSS", level: 92 },
      { name: "Vue.js", level: 80 },
      { name: "HTML/CSS", level: 95 },
    ],
  },
  {
    title: "Backend Development",
    icon: Database,
    color: "green",
    skills: [
      { name: "Node.js", level: 90 },
      { name: "Express.js", level: 88 },
      { name: "Python", level: 85 },
      { name: "PostgreSQL", level: 82 },
      { name: "MongoDB", level: 80 },
      { name: "GraphQL", level: 75 },
    ],
  },
  {
    title: "Cloud & DevOps",
    icon: Cloud,
    color: "purple",
    skills: [
      { name: "AWS", level: 80 },
      { name: "Vercel", level: 90 },
      { name: "Docker", level: 75 },
      { name: "Git/GitHub", level: 92 },
      { name: "CI/CD", level: 78 },
      { name: "Linux", level: 80 },
    ],
  },
  {
    title: "Mobile Development",
    icon: Smartphone,
    color: "orange",
    skills: [
      { name: "React Native", level: 85 },
      { name: "Expo", level: 88 },
      { name: "Flutter", level: 70 },
      { name: "iOS Development", level: 65 },
      { name: "Android Development", level: 68 },
    ],
  },
  {
    title: "AI & Machine Learning",
    icon: Brain,
    color: "pink",
    skills: [
      { name: "OpenAI API", level: 85 },
      { name: "LangChain", level: 80 },
      { name: "TensorFlow", level: 70 },
      { name: "Natural Language Processing", level: 75 },
      { name: "Computer Vision", level: 65 },
    ],
  },
  {
    title: "Tools & Others",
    icon: Wrench,
    color: "gray",
    skills: [
      { name: "VS Code", level: 95 },
      { name: "Figma", level: 80 },
      { name: "Postman", level: 88 },
      { name: "Jira", level: 75 },
      { name: "Slack", level: 90 },
    ],
  },
]

export const EXPERIENCE: Experience[] = [
  {
    title: "Senior Full Stack Developer",
    company: "Tech Innovations Ltd.",
    location: "Remote",
    period: "2022 - Present",
    description: [
      "Led development of AI-powered web applications using React, Next.js, and Node.js",
      "Implemented machine learning models for personalized user experiences",
      "Mentored junior developers and established coding best practices",
      "Improved application performance by 40% through optimization techniques",
    ],
  },
  {
    title: "Full Stack Developer",
    company: "Digital Solutions Inc.",
    location: "Kathmandu, Nepal",
    period: "2020 - 2022",
    description: [
      "Developed and maintained multiple client projects using modern web technologies",
      "Built RESTful APIs and integrated third-party services",
      "Collaborated with design teams to implement pixel-perfect UI/UX",
      "Deployed applications on AWS and managed CI/CD pipelines",
    ],
  },
  {
    title: "Frontend Developer",
    company: "StartupXYZ",
    location: "Kathmandu, Nepal",
    period: "2019 - 2020",
    description: [
      "Created responsive web applications using React and Vue.js",
      "Worked closely with UX designers to implement user-friendly interfaces",
      "Optimized applications for maximum speed and scalability",
      "Participated in agile development processes and code reviews",
    ],
  },
]

export const EDUCATION: Education[] = [
  {
    degree: "Bachelor of Computer Engineering",
    institution: "Tribhuvan University",
    location: "Kathmandu, Nepal",
    period: "2015 - 2019",
    details: "Graduated with First Class Honors. Specialized in Software Engineering and AI.",
  },
]

export const ACHIEVEMENTS = [
  "Winner of National Hackathon 2023 - AI Category",
  "Open Source Contributor with 500+ GitHub stars",
  "Speaker at Nepal Tech Conference 2022",
  "AWS Certified Solutions Architect",
  "Published 10+ technical articles on Medium",
]

export const CONTACT_INFO = [
  {
    icon: Mail,
    label: "Email",
    value: "saugat@example.com",
    href: "mailto:saugat@example.com",
  },
  {
    icon: Mail,
    label: "Phone",
    value: "+977 98XXXXXXXX",
    href: "tel:+97798XXXXXXXX",
  },
  {
    icon: Mail,
    label: "Location",
    value: "Kathmandu, Nepal",
    href: "#",
  },
]

export const WINDOW_TITLES = {
  about: "About Me",
  projects: "Projects",
  skills: "Skills & Technologies",
  contact: "Contact",
  resume: "Resume",
  chat: "AI Assistant",
}

export const MENU_ITEMS = [
  { id: "file", label: "File" },
  { id: "edit", label: "Edit" },
  { id: "view", label: "View" },
  { id: "window", label: "Window" },
  { id: "help", label: "Help" },
]
