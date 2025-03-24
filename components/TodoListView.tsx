"use client"

import { toggleHabitLog } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { HabitWithLogs } from "@/lib/types"
import { useState } from "react"
import { HabitActions } from "./habit-actions"
import { useHabitActions } from "@/lib/hooks/use-habit-actions"
import { HabitForm } from "./habit-form"

interface TodoListViewProps {
  habits: HabitWithLogs[]
  currentDate: Date // Format: YYYY-MM-DD
}

export function TodoListView({ habits, currentDate }: TodoListViewProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const currentDateStr = currentDate.toISOString().split('T')[0]

  
  const order = habits.sort((a, b) => {
    if(a.logs.length === 0) return 1;
    return a.logs[0].completed === true ? -1 : 1
  })
  console.log("order", order);

  const {
    editingHabit,
    setEditingHabit,
    handleToggleLog,
    handleEditHabit,
    handleDeleteHabit,
  } = useHabitActions(habits)

  const handleCancelEdit = () => {
    setEditingHabit(null)
  }

  if (editingHabit) {
    return <HabitForm habit={editingHabit} onCancel={handleCancelEdit} />
  }

  return (
    <div className="space-y-3">

      {order.map((habit) => (
        <Card 
          key={habit.id}
          className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer ${
            habit.logs.some(log => log.date === currentDateStr && log.completed) 
              ? 'bg-green-50 hover:bg-green-100' 
              : ''
          }`}
          onClick={() => handleToggleLog(habit.id, currentDate)}
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl" role="img" aria-label={`Habit emoji: ${habit.name}`}>
              {habit.emoji || '✨'}
            </span>
            <div>
              <h3 className="font-medium">{habit.name}</h3>
              {habit.description && (
                <p className="text-sm text-gray-500">{habit.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {habit.achieved}/{habit.goal} this month
            </div>
            <HabitActions
              habit={habit}
              onEdit={handleEditHabit}
              onDelete={handleDeleteHabit}
            />
            <Button 
              variant="ghost" 
              size="sm"
              disabled={isUpdating === habit.id}
              className={habit.logs.some(log => log.date === currentDate && log.completed) 
                ? 'text-green-600' 
                : 'text-gray-400'
              }
            >
              {isUpdating === habit.id ? (
                <span className="animate-spin">⟳</span>
              ) : habit.logs.some(log => log.date === currentDate && log.completed) ? (
                '✓'
              ) : (
                '○'
              )}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
} 