"use client"

import { WeeklyHabitList } from "./weekly-habit-list"
import { HabitWithLogs } from "@/lib/types"
import { useHabitActions } from "@/lib/hooks/use-habit-actions"
import { HabitForm } from "./habit-form"

interface WeeklyHabitsContainerProps {
  habits: HabitWithLogs[]
  onHabitChange: () => Promise<void>
}

export function WeeklyHabitsContainer({
  habits: initialHabits,
  onHabitChange
}: WeeklyHabitsContainerProps) {
  const {
    habits,
    editingHabit,
    setEditingHabit,
    handleToggleLog,
    handleEditHabit,
    handleDeleteHabit,
    handleReorder
  } = useHabitActions(initialHabits)

  const handleCancelEdit = () => {
    setEditingHabit(null)
  }

  if (editingHabit) {
    return <HabitForm 
      habit={editingHabit} 
      onCancel={handleCancelEdit} 
      onSuccess={onHabitChange}
    />
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