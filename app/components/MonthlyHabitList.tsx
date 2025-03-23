"use client"

import { toggleHabitLog } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { HabitWithLogs } from "@/lib/types"
import { useState } from "react"

interface MonthlyHabitListProps {
  habits: HabitWithLogs[]
  currentDate: string // Format: YYYY-MM-DD
}

export function MonthlyHabitList({ habits, currentDate }: MonthlyHabitListProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleToggle = async (habitId: string) => {
    setIsUpdating(habitId)
    try {
      await toggleHabitLog(habitId, currentDate)
    } catch (error) {
      console.error('Failed to toggle habit:', error)
    } finally {
      setIsUpdating(null)
    }
  }

  return (
    <div className="space-y-3">
      {habits.map((habit) => (
        <Card 
          key={habit.id}
          className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer ${
            habit.logs.some(log => log.date === currentDate && log.completed) 
              ? 'bg-green-50 hover:bg-green-100' 
              : ''
          }`}
          onClick={() => handleToggle(habit.id)}
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