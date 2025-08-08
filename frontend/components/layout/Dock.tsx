"use client"

import { MessageCircle } from "lucide-react"
import { useResponsive } from "@/hooks/useResponsive"
import { DOCK_ITEMS, SOCIAL_LINKS } from "@/constants"

interface DockProps {
  onOpenWindow: (windowId: string) => void
  onToggleChat: () => void
  isChatOpen: boolean
}

export function Dock({ onOpenWindow, onToggleChat, isChatOpen }: DockProps) {
  const { isMobile } = useResponsive()

  if (isMobile) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-30">
        <div className="glass-effect rounded-2xl p-3">
          {/* Main dock items */}
          <div className="grid grid-cols-5 gap-2 mb-3">
            {DOCK_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => onOpenWindow(item.id)}
                className="aspect-square rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all duration-300 hover:bg-white/30"
                title={item.label}
              >
                <item.icon className="w-5 h-5 text-white" />
              </button>
            ))}
          </div>

          {/* Chat and social */}
          <div className="flex justify-center space-x-2">
            <button
              onClick={onToggleChat}
              className={`w-10 h-10 rounded-xl backdrop-blur-md border border-white/30 flex items-center justify-center transition-all duration-300 ${
                isChatOpen ? "bg-blue-500/50" : "bg-white/20 hover:bg-white/30"
              }`}
              title="AI Assistant"
            >
              <MessageCircle className="w-4 h-4 text-white" />
            </button>

            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all duration-300"
                title={social.label}
              >
                <social.icon className="w-4 h-4 text-white" />
              </a>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30">
      <div className="glass-effect rounded-2xl px-4 py-3 flex items-center space-x-3">
        {/* Main dock items */}
        {DOCK_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onOpenWindow(item.id)}
            className="dock-item group relative"
            title={item.label}
          >
            <item.icon className="w-6 h-6 text-white" />
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {item.label}
            </div>
          </button>
        ))}

        {/* Divider */}
        <div className="w-px h-8 bg-white/30" />

        {/* Chat button */}
        <button
          onClick={onToggleChat}
          className={`dock-item group relative ${isChatOpen ? "bg-blue-500/50" : ""}`}
          title="AI Assistant"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            AI Assistant
          </div>
        </button>

        {/* Social links */}
        {SOCIAL_LINKS.map((social) => (
          <a
            key={social.id}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="dock-item group relative"
            title={social.label}
          >
            <social.icon className="w-5 h-5 text-white" />
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {social.label}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
