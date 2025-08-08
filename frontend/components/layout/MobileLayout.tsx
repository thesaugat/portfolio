"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { User, FolderOpen, Code, Mail, FileText, MessageCircle, Bell, Search, Sparkles } from "lucide-react"
import { MobileWindow } from "@/components/common/MobileWindow"
import { NotificationCenter } from "@/components/common/NotificationCenter"
import { ChatWindow } from "@/apps/chat/ChatWindow"
import { AboutWindow } from "@/apps/about/AboutWindow"
import { ProjectsWindow } from "@/apps/projects/ProjectsWindow"
import { SkillsWindow } from "@/apps/skills/SkillsWindow"
import { ContactWindow } from "@/apps/contact/ContactWindow"
import { ResumeWindow } from "@/apps/resume/ResumeWindow"
import { WINDOW_TITLES, SOCIAL_LINKS } from "@/constants"

interface MobileLayoutProps {
  openWindows: string[]
  focusedWindow: string | null
  onOpenWindow: (windowId: string) => void
  onCloseWindow: (windowId: string) => void
  onFocusWindow: (windowId: string) => void
  onToggleWindow: (windowId: string) => void
  currentTime: string
  isNotificationOpen: boolean
  onToggleNotifications: () => void
}

export function MobileLayout({
  openWindows,
  focusedWindow,
  onOpenWindow,
  onCloseWindow,
  onFocusWindow,
  onToggleWindow,
  currentTime,
  isNotificationOpen,
  onToggleNotifications,
}: MobileLayoutProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [currentView, setCurrentView] = useState<"home" | "app">("home")

  const windowComponents = {
    about: AboutWindow,
    projects: ProjectsWindow,
    skills: SkillsWindow,
    contact: ContactWindow,
    resume: ResumeWindow,
    chat: ChatWindow,
  }

  const appItems = [
    { id: "about", icon: User, label: "About Me", color: "bg-blue-500" },
    { id: "projects", icon: FolderOpen, label: "Projects", color: "bg-green-500" },
    { id: "skills", icon: Code, label: "Skills", color: "bg-purple-500" },
    { id: "contact", icon: Mail, label: "Contact", color: "bg-red-500" },
    { id: "resume", icon: FileText, label: "Resume", color: "bg-orange-500" },
    { id: "chat", icon: MessageCircle, label: "AI Assistant", color: "bg-indigo-500" },
  ]

  const handleAppOpen = (appId: string) => {
    onOpenWindow(appId)
    setCurrentView("app")
    setShowMenu(false)
  }

  const handleBackToHome = () => {
    setCurrentView("home")
    // Close all windows when going back to home
    openWindows.forEach((windowId) => onCloseWindow(windowId))
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      handleAppOpen("chat")
    }
  }

  // If there's an open window, show it in app view
  useEffect(() => {
    if (openWindows.length > 0) {
      setCurrentView("app")
    } else {
      setCurrentView("home")
    }
  }, [openWindows.length])

  // App View - Show the focused window
  if (currentView === "app" && openWindows.length > 0) {
    const activeWindowId = focusedWindow || openWindows[openWindows.length - 1]
    const WindowComponent = windowComponents[activeWindowId as keyof typeof windowComponents]
    const title = WINDOW_TITLES[activeWindowId as keyof typeof WINDOW_TITLES]

    return (
      <div className="h-screen bg-white flex flex-col">
        <MobileWindow id={activeWindowId} title={title} onClose={handleBackToHome} onBack={handleBackToHome}>
          <WindowComponent initialMessage={searchValue} />
        </MobileWindow>
      </div>
    )
  }

  // Home View - iOS-style home screen
  return (
    <div
      className="h-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
      }}
    >
      {/* Status Bar */}
      <div className="safe-area-top bg-black/10 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-2 text-white text-sm font-medium">
          <div className="flex items-center space-x-1">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <span className="ml-2">Portfolio</span>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={onToggleNotifications} className="p-1 rounded-full hover:bg-white/20 transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <span>{currentTime}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 pt-8 pb-32">
        {/* Profile Section */}
        <div className="text-center mb-12">
          <div className="w-28 h-28 mx-auto mb-6 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
            ST
          </div>
          <h1 className="text-4xl font-bold mb-3 text-white">Saugat Timilsina</h1>
          <p className="text-lg text-white/90 mb-2">Full Stack Developer & AI Engineer</p>
          <p className="text-sm text-white/70">Building the future with code and AI</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-12">
          <div className="relative bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 shadow-xl">
            <div className="flex items-center space-x-4">
              <Search className="w-6 h-6 text-white/70" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Ask AI about my work and experience..."
                className="flex-1 bg-transparent text-white placeholder-white/60 focus:outline-none text-base"
              />
              <Sparkles className="w-6 h-6 text-blue-300 animate-pulse" />
            </div>
          </div>
        </form>

        {/* App Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-3 gap-6 mb-8">
            {appItems.map((app) => (
              <button
                key={app.id}
                onClick={() => handleAppOpen(app.id)}
                className="flex flex-col items-center space-y-3 active:scale-95 transition-transform duration-150"
              >
                <div className={`w-16 h-16 ${app.color} rounded-2xl shadow-lg flex items-center justify-center`}>
                  <app.icon className="w-8 h-8 text-white" />
                </div>
                <span className="text-white text-sm font-medium text-center leading-tight">{app.label}</span>
              </button>
            ))}
          </div>

          {/* Social Links */}
          <div className="mt-auto">
            <p className="text-white/60 text-center text-sm mb-4">Connect with me</p>
            <div className="flex justify-center space-x-6">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all duration-200 active:scale-95"
                >
                  <social.icon className="w-6 h-6 text-white" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-32 h-1 bg-white/30 rounded-full"></div>
      </div>

      {/* Notifications */}
      {isNotificationOpen && <NotificationCenter onClose={onToggleNotifications} />}
    </div>
  )
}
