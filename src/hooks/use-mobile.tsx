
import * as React from "react"

// Breakpoints for different screen sizes
export const BREAKPOINTS = {
  mobile: 767,
  tablet: 1023,
  desktop: 1024
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.mobile}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth <= BREAKPOINTS.mobile)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth <= BREAKPOINTS.mobile)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mqlMin = window.matchMedia(`(min-width: ${BREAKPOINTS.mobile + 1}px)`)
    const mqlMax = window.matchMedia(`(max-width: ${BREAKPOINTS.tablet}px)`)
    
    const onChange = () => {
      setIsTablet(
        window.innerWidth > BREAKPOINTS.mobile && 
        window.innerWidth <= BREAKPOINTS.tablet
      )
    }
    
    mqlMin.addEventListener("change", onChange)
    mqlMax.addEventListener("change", onChange)
    onChange()
    
    return () => {
      mqlMin.removeEventListener("change", onChange)
      mqlMax.removeEventListener("change", onChange)
    }
  }, [])

  return !!isTablet
}

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS.desktop}px)`)
    const onChange = () => {
      setIsDesktop(window.innerWidth >= BREAKPOINTS.desktop)
    }
    mql.addEventListener("change", onChange)
    setIsDesktop(window.innerWidth >= BREAKPOINTS.desktop)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isDesktop
}
