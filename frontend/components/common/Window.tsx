"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { X, Minus, Maximize2, Minimize2 } from "lucide-react"
import { useResponsive } from "@/hooks/useResponsive"
import { calculateSearchBarAnimation } from "@/utils/animations"
import type { WindowProps } from "@/types"

export function Window({
  id,
  title,
  children,
  onClose,
  onFocus,
  isFocused,
  isAnimatingFromSearch = false,
  searchBarRef,
}: WindowProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [animationStyle, setAnimationStyle] = useState<React.CSSProperties>({})
  const windowRef = useRef<HTMLDivElement>(null)
  const { isMobile } = useResponsive()

  useEffect(() => {
    if (isAnimatingFromSearch && searchBarRef?.current && windowRef.current) {
      const animation = calculateSearchBarAnimation(searchBarRef, windowRef)

      setAnimationStyle(animation.initial)

      setTimeout(() => {
        setAnimationStyle(animation.final)
      }, 50)
    }
  }, [isAnimatingFromSearch, searchBarRef])

  if (isMinimized) return null

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Mobile layout - always fullscreen
  if (isMobile) {
    return (
      <div className="fixed inset-4 bottom-20 z-40 rounded-2xl overflow-hidden bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 h-14 flex items-center justify-between px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="w-5 h-5 bg-red-500 rounded-full hover:bg-red-600 transition-colors shadow-sm"
            />
            <button
              onClick={() => setIsMinimized(true)}
              className="w-5 h-5 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors shadow-sm"
            />
            <button className="w-5 h-5 bg-green-500 rounded-full hover:bg-green-600 transition-colors shadow-sm" />
          </div>

          <div className="text-gray-800 text-base font-semibold">{title}</div>

          <div className="w-16" />
        </div>

        {/* Content with proper spacing for dock */}
        <div className="bg-white h-full overflow-auto pb-4">{children}</div>
      </div>
    )
  }

  // Desktop layout
  const windowStyle = isFullscreen
    ? "fixed inset-4"
    : "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[80vh]"

  return (
    <div
      ref={windowRef}
      className={`${windowStyle} z-40 rounded-2xl overflow-hidden bg-white shadow-2xl ${isFocused ? "ring-2 ring-blue-500/20" : ""
        } ${!isAnimatingFromSearch ? "animate-in zoom-in-95 duration-300" : ""}`}
      style={isAnimatingFromSearch ? animationStyle : {}}
      onClick={onFocus}
    >
      {/* Title Bar */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 h-12 flex items-center justify-between px-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="w-4 h-4 bg-red-500 rounded-full hover:bg-red-600 transition-all duration-200 hover:scale-110 shadow-sm"
          />
          <button
            onClick={() => setIsMinimized(true)}
            className="w-4 h-4 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-all duration-200 hover:scale-110 shadow-sm"
          />
          <button
            onClick={toggleFullscreen}
            className="w-4 h-4 bg-green-500 rounded-full hover:bg-green-600 transition-all duration-200 hover:scale-110 shadow-sm flex items-center justify-center"
          >
            {isFullscreen ? <Minimize2 className="w-2 h-2 text-white" /> : <Maximize2 className="w-2 h-2 text-white" />}
          </button>
        </div>

        <div className="text-gray-800 text-sm font-semibold">{title}</div>

        <div className="flex items-center space-x-2">
          <button onClick={() => setIsMinimized(true)} className="p-1 hover:bg-gray-200 rounded transition-colors">
            <Minus className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={toggleFullscreen} className="p-1 hover:bg-gray-200 rounded transition-colors">
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-gray-600" />
            ) : (
              <Maximize2 className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="bg-white h-full overflow-auto">{children}</div>
    </div>
  )
}
