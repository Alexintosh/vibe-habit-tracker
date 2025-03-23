"use client"

import { WeeklyHabitList } from "./weekly-habit-list"
import { HabitWithLogs } from "@/lib/types"
import { useHabitActions } from "@/lib/hooks/use-habit-actions"
import { HabitForm } from "./habit-form"

export function WeeklyHabitsContainer({
  habits: initialHabits
}: {
  habits: HabitWithLogs[]
}) {
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
    return <HabitForm habit={editingHabit} onCancel={handleCancelEdit} />
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