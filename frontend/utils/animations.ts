import type React from "react"
export const ANIMATION_DURATIONS = {
  fast: 200,
  normal: 300,
  slow: 500,
}

export const EASING = {
  easeOut: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
}

export function calculateSearchBarAnimation(
  searchBarRef: React.RefObject<HTMLDivElement>,
  windowRef: React.RefObject<HTMLDivElement>,
) {
  if (!searchBarRef.current || !windowRef.current) return {}

  const searchRect = searchBarRef.current.getBoundingClientRect()
  const searchCenterX = searchRect.left + searchRect.width / 2
  const searchCenterY = searchRect.top + searchRect.height / 2

  const windowCenterX = window.innerWidth / 2
  const windowCenterY = window.innerHeight / 2

  return {
    initial: {
      transform: `translate(${searchCenterX - windowCenterX}px, ${searchCenterY - windowCenterY}px) scale(0.1)`,
      opacity: 0,
    },
    final: {
      transform: "translate(0, 0) scale(1)",
      opacity: 1,
      transition: `all ${ANIMATION_DURATIONS.slow}ms ${EASING.bounce}`,
    },
  }
}
