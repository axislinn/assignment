"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      // This is where you would normally send analytics data
      // For example, using Google Analytics:
      // window.gtag('config', 'GA_MEASUREMENT_ID', {
      //   page_path: pathname + searchParams.toString(),
      // })
    }
  }, [pathname, searchParams])

  return null
}
