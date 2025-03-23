import { useState, useEffect, useRef } from "react"
import { Habit, HabitWithLogs } from "@/lib/types"
import { deleteHabit, toggleHabitLog, updateHabitOrders } from "@/app/actions"
import { formatDate } from "@/lib/date-utils"
import { useSyncContext } from "@/app/sync-provider"

export function useHabitActions(initialHabits: HabitWithLogs[]) {
  const [habits, setHabits] = useState(initialHabits)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const { notifyStateChange, syncState } = useSyncContext()
  const isSyncing = useRef(false)

  // Listen for sync updates
  useEffect(() => {
    const updateFromSync = async () => {
      if (isSyncing.current) return
      isSyncing.current = true
      try {
        const updatedHabits = await syncState()
        // Only update if the habits have actually changed
        if (JSON.stringify(updatedHabits) !== JSON.stringify(habits)) {
          setHabits(updatedHabits)
        }
      } finally {
        isSyncing.current = false
      }
    }

    const syncInterval = setInterval(updateFromSync, 5000) // Sync every 5 seconds

    return () => {
      clearInterval(syncInterval)
    }
  }, [syncState])

  const handleToggleLog = async (habitId: string, date: Date) => {
    // Update the local state to reflect the change
    setHabits(habits.map(habit => {
      if (habit.id !== habitId) return habit
      
      const formattedDate = formatDate(date)
      const existingLog = habit.logs.find(log => log.date === formattedDate)
      
      const newLogs = existingLog
        ? habit.logs.map(log => 
            log.date === formattedDate 
              ? { ...log, completed: !log.completed }
              : log
          )
        : [...habit.logs, { 
            id: `${habitId}-${formattedDate}`,
            habitId,
            date: formattedDate,
            completed: true
          }]

      return {
        ...habit,
        logs: newLogs
      }
    }))

    // Call server action
    await toggleHabitLog(habitId, formatDate(date))
    notifyStateChange()
  }

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit)
    notifyStateChange()
  }

  const handleDeleteHabit = async (habitId: string) => {
    await deleteHabit(habitId)
    // Update local state after successful deletion
    setHabits(habits.filter(h => h.id !== habitId))
    notifyStateChange()
  }

  const handleReorder = async (newHabits: HabitWithLogs[]) => {
    // Update local state first for optimistic update
    setHabits(newHabits)

    // Then update the server
    const updates = newHabits.map((habit, index) => ({
      id: habit.id,
      order: index
    }))
    await updateHabitOrders(updates)
    notifyStateChange()
  }

  return {
    habits,
    editingHabit,
    setEditingHabit,
    handleToggleLog,
    handleEditHabit,
    handleDeleteHabit,
    handleReorder
  }
} 