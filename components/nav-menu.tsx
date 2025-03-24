"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Settings, Database } from "lucide-react"

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
            Recap
          </Link>
          <Link 
            href="/day" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/day" ? "text-primary" : "text-muted-foreground"
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
          <Link 
            href="/month" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/month" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Monthly View
          </Link>
          <Link 
            href="/year" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/year" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Yearly View
          </Link>
          <div className="flex-1" />
          <Link 
            href="/import-db" 
            className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${
              pathname === "/import-db" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Database className="h-4 w-4" />
            Import DB
          </Link>
          <Link 
            href="/settings" 
            className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${
              pathname === "/settings" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </div>
    </nav>
  )
} 