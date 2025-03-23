"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function NavMenu() {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-sm mb-8">
      <div className="container mx-auto px-4">
        <div className="flex space-x-8 h-14 items-center">
          <Link 
            href="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Daily View
          </Link>
          <Link 
            href="/week" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/week" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Weekly View
          </Link>
        </div>
      </div>
    </nav>
  )
} 