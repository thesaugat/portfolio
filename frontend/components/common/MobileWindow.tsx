"use client"

import type React from "react"
import { ArrowLeft, X } from "lucide-react"

interface MobileWindowProps {
  id: string
  title: string
  children: React.ReactNode
  onClose: () => void
  onBack: () => void
}

export function MobileWindow({ id, title, children, onClose, onBack }: MobileWindowProps) {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="safe-area-top bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>

          <h1 className="text-lg font-semibold text-gray-900 text-center flex-1 mx-4">{title}</h1>

          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-white">{children}</div>
    </div>
  )
}
