"use client"

import { useState, useRef, useEffect } from "react"
import { Apple, Wifi, Battery, Volume2 } from "lucide-react"

interface MenuBarProps {
  currentTime: string
  onNotificationClick: () => void
}

export function MenuBar({ currentTime, onNotificationClick }: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Don't render on mobile
  if (isMobile) return null

  const menuItems = [
    {
      id: "file",
      label: "File",
      items: [
        { label: "New Project", shortcut: "⌘N", action: () => console.log("New Project") },
        { label: "Open...", shortcut: "⌘O", action: () => console.log("Open") },
        { label: "Save", shortcut: "⌘S", action: () => console.log("Save") },
        { label: "Save As...", shortcut: "⇧⌘S", action: () => console.log("Save As") },
        { type: "separator" },
        { label: "Export Portfolio", action: () => console.log("Export") },
        { label: "Print Resume", shortcut: "⌘P", action: () => console.log("Print") },
        { type: "separator" },
        { label: "Close Window", shortcut: "⌘W", action: () => console.log("Close") },
      ],
    },
    {
      id: "edit",
      label: "Edit",
      items: [
        { label: "Undo", shortcut: "⌘Z", action: () => console.log("Undo") },
        { label: "Redo", shortcut: "⇧⌘Z", action: () => console.log("Redo") },
        { type: "separator" },
        { label: "Cut", shortcut: "⌘X", action: () => console.log("Cut") },
        { label: "Copy", shortcut: "⌘C", action: () => console.log("Copy") },
        { label: "Paste", shortcut: "⌘V", action: () => console.log("Paste") },
        { type: "separator" },
        { label: "Select All", shortcut: "⌘A", action: () => console.log("Select All") },
        { label: "Find", shortcut: "⌘F", action: () => console.log("Find") },
      ],
    },
    {
      id: "view",
      label: "View",
      items: [
        { label: "Show All Windows", action: () => console.log("Show All") },
        { label: "Minimize All", shortcut: "⌘M", action: () => console.log("Minimize All") },
        { type: "separator" },
        { label: "Full Screen", shortcut: "⌃⌘F", action: () => console.log("Full Screen") },
        { label: "Zoom In", shortcut: "⌘+", action: () => console.log("Zoom In") },
        { label: "Zoom Out", shortcut: "⌘-", action: () => console.log("Zoom Out") },
        { label: "Actual Size", shortcut: "⌘0", action: () => console.log("Actual Size") },
        { type: "separator" },
        { label: "Show Dock", action: () => console.log("Show Dock") },
        { label: "Hide Menu Bar", action: () => console.log("Hide Menu Bar") },
      ],
    },
    {
      id: "window",
      label: "Window",
      items: [
        { label: "Minimize", shortcut: "⌘M", action: () => console.log("Minimize") },
        { label: "Close", shortcut: "⌘W", action: () => console.log("Close") },
        { type: "separator" },
        { label: "About Me", action: () => console.log("About Me") },
        { label: "Projects", action: () => console.log("Projects") },
        { label: "Skills", action: () => console.log("Skills") },
        { label: "Contact", action: () => console.log("Contact") },
        { label: "Resume", action: () => console.log("Resume") },
        { type: "separator" },
        { label: "AI Assistant", action: () => console.log("AI Assistant") },
      ],
    },
    {
      id: "help",
      label: "Help",
      items: [
        { label: "Portfolio Help", action: () => console.log("Help") },
        { label: "Keyboard Shortcuts", shortcut: "⌘/", action: () => console.log("Shortcuts") },
        { type: "separator" },
        { label: "Contact Support", action: () => console.log("Support") },
        { label: "Send Feedback", action: () => console.log("Feedback") },
        { type: "separator" },
        { label: "About Saugat Timilsina", action: () => console.log("About") },
        { label: "Check for Updates", action: () => console.log("Updates") },
      ],
    },
  ]

  const handleMenuClick = (menuId: string) => {
    setActiveMenu(activeMenu === menuId ? null : menuId)
  }

  const handleMenuItemClick = (item: any) => {
    if (item.action) {
      item.action()
    }
    setActiveMenu(null)
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-6 glass-effect z-50 flex items-center justify-between px-4 text-white text-sm">
      <div className="flex items-center space-x-4" ref={menuRef}>
        <Apple className="w-4 h-4" />
        <div className="flex items-center space-x-1">
          {menuItems.map((menu) => (
            <div key={menu.id} className="relative">
              <button
                className={`menu-item flex items-center space-x-1 ${activeMenu === menu.id ? "bg-white/20" : ""}`}
                onClick={() => handleMenuClick(menu.id)}
              >
                <span>{menu.label}</span>
              </button>

              {/* Dropdown Menu */}
              {activeMenu === menu.id && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white/95 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl py-2 z-50">
                  {menu.items.map((item, index) => (
                    <div key={index}>
                      {item.type === "separator" ? (
                        <div className="h-px bg-gray-300 mx-2 my-1" />
                      ) : (
                        <button
                          className="w-full px-4 py-2 text-left text-gray-800 hover:bg-blue-500 hover:text-white transition-colors flex items-center justify-between text-sm"
                          onClick={() => handleMenuItemClick(item)}
                        >
                          <span>{item.label}</span>
                          {item.shortcut && <span className="text-xs opacity-60 font-mono">{item.shortcut}</span>}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Battery className="w-4 h-4" />
        <Wifi className="w-4 h-4" />
        <Volume2 className="w-4 h-4" />
        <button onClick={onNotificationClick} className="hover:bg-white/20 px-2 py-1 rounded transition-colors">
          {currentTime}
        </button>
      </div>
    </div>
  )
}
