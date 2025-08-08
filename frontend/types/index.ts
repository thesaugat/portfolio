import type React from "react"
export interface WindowProps {
  id: string
  title: string
  children: React.ReactNode
  onClose: () => void
  onFocus: () => void
  isFocused: boolean
  isAnimatingFromSearch?: boolean
  searchBarRef?: React.RefObject<HTMLDivElement>
}

export interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
}

export interface DockItem {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  href?: string
}

export interface Notification {
  id: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  time: string
  type: string
}

export interface Project {
  id: number
  title: string
  description: string
  image: string
  technologies: string[]
  github: string
  demo: string
  featured: boolean
}

export interface SkillCategory {
  title: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  skills: Skill[]
}

export interface Skill {
  name: string
  level: number
}

export interface Experience {
  title: string
  company: string
  location: string
  period: string
  description: string[]
}

export interface Education {
  degree: string
  institution: string
  location: string
  period: string
  details: string
}
