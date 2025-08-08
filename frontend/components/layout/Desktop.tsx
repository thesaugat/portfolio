"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Search, Sparkles } from "lucide-react"
import { Window } from "@/components/common/Window"
import { ChatWindow } from "@/apps/chat/ChatWindow"
import { AboutWindow } from "@/apps/about/AboutWindow"
import { ProjectsWindow } from "@/apps/projects/ProjectsWindow"
import { SkillsWindow } from "@/apps/skills/SkillsWindow"
import { ContactWindow } from "@/apps/contact/ContactWindow"
import { ResumeWindow } from "@/apps/resume/ResumeWindow"
import { WINDOW_TITLES } from "@/constants"

interface DesktopProps {
  openWindows: string[]
  focusedWindow: string | null
  onCloseWindow: (windowId: string) => void
  onOpenWindow: (windowId: string) => void
  onFocusWindow: (windowId: string) => void
}

export function Desktop({ openWindows, focusedWindow, onCloseWindow, onOpenWindow, onFocusWindow }: DesktopProps) {
  const [searchValue, setSearchValue] = useState("")
  const [isSearchAnimating, setIsSearchAnimating] = useState(false)
  const searchBarRef = useRef<HTMLDivElement>(null)

  const windowComponents = {
    about: AboutWindow,
    projects: ProjectsWindow,
    skills: SkillsWindow,
    contact: ContactWindow,
    resume: ResumeWindow,
    chat: ChatWindow,
  }

  const handleSearchClick = () => {
    if (!openWindows.includes("chat")) {
      setIsSearchAnimating(true)
      setTimeout(() => {
        onOpenWindow("chat")
        setIsSearchAnimating(false)
      }, 200)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      handleSearchClick()
    }
  }

  return (
    <div className="absolute inset-0 pt-6 pb-20">
      {/* Central Search Bar - shown when no windows are open */}
      {openWindows.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-2xl mx-4">
            {/* Profile Section */}
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-white text-4xl font-bold border border-white/30 shadow-2xl">
                ST
              </div>
              <h1 className="text-5xl font-bold mb-4 text-white">Saugat Timilsina</h1>
              <p className="text-xl text-white/90 mb-2">Full Stack Developer & AI Engineer</p>
              <p className="text-base text-white/70">Built with AI. Backed by My Experience.</p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <div
                ref={searchBarRef}
                onClick={handleSearchClick}
                className={`group cursor-pointer transform transition-all duration-300 hover:scale-105 ${isSearchAnimating ? "scale-110 opacity-50" : ""
                  }`}
              >
                <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-4 shadow-2xl hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <Search className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
                    <input
                      type="text"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Ask me anything about my work, skills, or experience..."
                      className="flex-1 bg-transparent text-white placeholder-white/60 focus:outline-none text-lg"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Sparkles className="w-6 h-6 text-blue-300 group-hover:text-blue-200 transition-colors animate-pulse" />
                  </div>
                </div>
              </div>
            </form>

            <p className="text-sm text-white/60 mt-4">
              Powered by AI • Click to start a conversation or explore the dock below
            </p>
          </div>
        </div>
      )}

      {/* Search Bar - shown when windows are open */}
      {openWindows.length > 0 && !openWindows.includes("chat") && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
          <div
            ref={searchBarRef}
            onClick={handleSearchClick}
            className={`group cursor-pointer transform transition-all duration-300 hover:scale-105 ${isSearchAnimating ? "scale-110 opacity-50" : ""
              }`}
          >
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 shadow-xl hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center space-x-3">
                <Search className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Ask AI assistant..."
                  className="w-64 bg-transparent text-white placeholder-white/60 focus:outline-none text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
                <Sparkles className="w-5 h-5 text-blue-300 group-hover:text-blue-200 transition-colors animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Windows */}
      {openWindows.map((windowId) => {
        const WindowComponent = windowComponents[windowId as keyof typeof windowComponents]
        const title = WINDOW_TITLES[windowId as keyof typeof WINDOW_TITLES]

        return (
          <Window
            key={windowId}
            id={windowId}
            title={title}
            onClose={() => onCloseWindow(windowId)}
            onFocus={() => onFocusWindow(windowId)}
            isFocused={focusedWindow === windowId}
            isAnimatingFromSearch={windowId === "chat" && isSearchAnimating}
            searchBarRef={searchBarRef}
          >
            <WindowComponent initialMessage={searchValue} />
          </Window>
        )
      })}
    </div>
  )
}
