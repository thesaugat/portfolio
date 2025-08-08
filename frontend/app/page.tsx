"use client"

import { useState, useEffect } from "react"
import { MenuBar } from "@/components/layout/MenuBar"
import { Desktop } from "@/components/layout/Desktop"
import { Dock } from "@/components/layout/Dock"
import { NotificationCenter } from "@/components/common/NotificationCenter"
import { MobileLayout } from "@/components/layout/MobileLayout"
import { useWindowManager } from "@/hooks/useWindowManager"
import { useTime } from "@/hooks/useTime"

export default function Home() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const currentTime = useTime()
  const { openWindows, focusedWindow, openWindow, closeWindow, focusWindow, toggleWindow } = useWindowManager()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen)
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <MobileLayout
        openWindows={openWindows}
        focusedWindow={focusedWindow}
        onOpenWindow={openWindow}
        onCloseWindow={closeWindow}
        onFocusWindow={focusWindow}
        onToggleWindow={toggleWindow}
        currentTime={currentTime}
        isNotificationOpen={isNotificationOpen}
        onToggleNotifications={toggleNotifications}
      />
    )
  }

  // Desktop Layout
  return (
    <div
      className="h-screen w-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      <MenuBar currentTime={currentTime} onNotificationClick={toggleNotifications} />

      <Desktop
        openWindows={openWindows}
        focusedWindow={focusedWindow}
        onCloseWindow={closeWindow}
        onOpenWindow={openWindow}
        onFocusWindow={focusWindow}
      />

      <Dock
        onOpenWindow={openWindow}
        onToggleChat={() => toggleWindow("chat")}
        isChatOpen={openWindows.includes("chat")}
      />

      {isNotificationOpen && <NotificationCenter onClose={() => setIsNotificationOpen(false)} />}
    </div>
  )
}
