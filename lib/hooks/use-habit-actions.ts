import { useState, useEffect, useRef } from "react"
import { Habit, HabitWithLogs } from "@/lib/types"
import { deleteHabit, toggleHabitLog, updateHabitOrders } from "@/app/actions"
import { formatDate } from "@/lib/date-utils"

export function useHabitActions(initialHabits: HabitWithLogs[]) {
  const [habits, setHabits] = useState(initialHabits)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)


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
  }

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit)
  }

  const handleDeleteHabit = async (habitId: string) => {
    await deleteHabit(habitId)
    // Update local state after successful deletion
    setHabits(habits.filter(h => h.id !== habitId))
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