export const COLOR_SCHEMES = {
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-200",
    progress: "bg-blue-500",
  },
  green: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-200",
    progress: "bg-green-500",
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    border: "border-purple-200",
    progress: "bg-purple-500",
  },
  orange: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-200",
    progress: "bg-orange-500",
  },
  pink: {
    bg: "bg-pink-100",
    text: "text-pink-800",
    border: "border-pink-200",
    progress: "bg-pink-500",
  },
  gray: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-200",
    progress: "bg-gray-500",
  },
}

export function getColorClasses(color: string) {
  return COLOR_SCHEMES[color as keyof typeof COLOR_SCHEMES] || COLOR_SCHEMES.gray
}
