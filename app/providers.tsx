"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface AppContextType {
  currentDate: Date
  setCurrentDate: (date: Date) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  return <AppContext.Provider value={{ currentDate, setCurrentDate }}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

