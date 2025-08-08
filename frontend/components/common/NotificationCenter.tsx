"use client"

import { Bell, X } from "lucide-react"
import { useResponsive } from "@/hooks/useResponsive"
import { NOTIFICATIONS } from "@/constants"

interface NotificationCenterProps {
  onClose: () => void
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const { isMobile } = useResponsive()

  const containerClass = isMobile
    ? "fixed inset-4 glass-effect rounded-lg shadow-2xl z-50 notification-slide"
    : "fixed top-6 right-4 w-80 glass-effect rounded-lg shadow-2xl z-50 notification-slide"

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-white" />
          <span className="text-white font-medium">Notifications</span>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Notifications */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {NOTIFICATIONS.map((notification) => (
          <div
            key={notification.id}
            className="bg-white/10 rounded-lg p-3 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <notification.icon className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium text-sm">{notification.title}</h4>
                <p className="text-white/70 text-xs mt-1">{notification.description}</p>
                <span className="text-white/50 text-xs">{notification.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/20">
        <button className="w-full text-center text-white/70 hover:text-white text-sm transition-colors">
          Clear All
        </button>
      </div>
    </div>
  )
}
