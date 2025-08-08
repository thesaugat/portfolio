import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  color?: string
}

export function ProgressBar({ value, max = 100, className, color = "blue" }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    pink: "bg-pink-500",
    gray: "bg-gray-500",
  }

  return (
    <div className={cn("w-full bg-white/50 rounded-full h-2", className)}>
      <div
        className={cn(
          "h-2 rounded-full transition-all duration-1000",
          colorClasses[color as keyof typeof colorClasses],
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
