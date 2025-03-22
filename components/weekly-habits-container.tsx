"use client"

import { WeeklyHabitList } from "./weekly-habit-list"
import { HabitWithLogs } from "@/lib/types"
import { toggleHabitLog, updateHabitOrders } from "@/app/actions"
import { useState } from "react"
import { formatDate } from "@/lib/date-utils"

export function WeeklyHabitsContainer({
  habits: initialHabits
}: {
  habits: HabitWithLogs[]
}) {
  const [habits, setHabits] = useState(initialHabits)

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

  const handleEditHabit = (habit: HabitWithLogs) => {
    // This will be handled by client component
    console.log('Edit habit:', habit)
  }

  const handleDeleteHabit = async (habitId: string) => {
    // Delete logic will be handled by the component
    console.log('Delete habit:', habitId)
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

  return (
    <WeeklyHabitList
      habits={habits}
      onToggleLog={handleToggleLog}
      onEditHabit={handleEditHabit}
      onDeleteHabit={handleDeleteHabit}
      onReorder={handleReorder}
    />
  )
} 