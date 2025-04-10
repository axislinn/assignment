"use client"

import { useState } from "react"
import { Star } from "lucide-react"

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readOnly?: boolean
  size?: "sm" | "md" | "lg"
}

export function StarRating({ value, onChange, readOnly = false, size = "md" }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0)

  const handleMouseOver = (index: number) => {
    if (readOnly) return
    setHoverValue(index)
  }

  const handleMouseLeave = () => {
    if (readOnly) return
    setHoverValue(0)
  }

  const handleClick = (index: number) => {
    if (readOnly) return
    onChange?.(index)
  }

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  const starSize = sizeClasses[size]

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((index) => (
        <Star
          key={index}
          className={`
            ${starSize}
            ${readOnly ? "cursor-default" : "cursor-pointer"}
            ${(hoverValue || value) >= index ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
          `}
          onMouseOver={() => handleMouseOver(index)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(index)}
        />
      ))}
    </div>
  )
}
