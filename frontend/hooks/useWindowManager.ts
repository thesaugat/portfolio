"use client"

import { useState } from "react"

export function useWindowManager() {
  const [openWindows, setOpenWindows] = useState<string[]>([])
  const [focusedWindow, setFocusedWindow] = useState<string | null>(null)

  const openWindow = (windowId: string) => {
    if (!openWindows.includes(windowId)) {
      setOpenWindows([...openWindows, windowId])
      setFocusedWindow(windowId)
    } else {
      setFocusedWindow(windowId)
    }
  }

  const closeWindow = (windowId: string) => {
    setOpenWindows(openWindows.filter((id) => id !== windowId))
    if (focusedWindow === windowId) {
      const remainingWindows = openWindows.filter((id) => id !== windowId)
      setFocusedWindow(remainingWindows.length > 0 ? remainingWindows[remainingWindows.length - 1] : null)
    }
  }

  const focusWindow = (windowId: string) => {
    setFocusedWindow(windowId)
  }

  const toggleWindow = (windowId: string) => {
    if (openWindows.includes(windowId)) {
      closeWindow(windowId)
    } else {
      openWindow(windowId)
    }
  }

  return {
    openWindows,
    focusedWindow,
    openWindow,
    closeWindow,
    focusWindow,
    toggleWindow,
  }
}
