"use client"

import { createContext, useContext, useCallback, useState, useEffect, useRef } from "react"
import { HabitWithLogs } from "@/lib/types"

type SyncContextType = {
  syncState: () => Promise<HabitWithLogs[]>
  notifyStateChange: () => void
}

const SyncContext = createContext<SyncContextType | null>(null)

export function useSyncContext() {
  const context = useContext(SyncContext)
  if (!context) {
    throw new Error("useSyncContext must be used within a SyncProvider")
  }
  return context
}

export function SyncProvider({
  children,
  onSync
}: {
  children: React.ReactNode
  onSync: () => Promise<HabitWithLogs[]>
}) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isSyncing = useRef(false)
  const lastSyncTime = useRef(Date.now())

  const notifyStateChange = useCallback(() => {
    if (isSyncing.current) return

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    const now = Date.now()
    const timeSinceLastSync = now - lastSyncTime.current
    
    // If it's been less than 200ms since last sync, debounce
    const delay = timeSinceLastSync < 200 ? 200 : 0

    timeoutRef.current = setTimeout(async () => {
      if (isSyncing.current) return
      isSyncing.current = true
      try {
        await onSync()
        lastSyncTime.current = Date.now()
      } finally {
        isSyncing.current = false
        timeoutRef.current = null
      }
    }, delay)
  }, [onSync])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <SyncContext.Provider value={{ syncState: onSync, notifyStateChange }}>
      {children}
    </SyncContext.Provider>
  )
} 