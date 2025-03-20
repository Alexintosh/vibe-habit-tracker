"use client"

import { useState } from "react"
import type { Habit, HabitWithLogs } from "@/lib/types"
import { deleteHabit, toggleHabitLog } from "@/app/actions"
import { useAppContext } from "@/app/providers"
import { formatDate, getDaysInMonth } from "@/lib/date-utils"
import { Button } from "@/components/ui/button"
import { Check, Edit, Plus, Trash } from "lucide-react"
import { HabitForm } from "./habit-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface HabitListProps {
  habits: HabitWithLogs[]
}

export function HabitList({ habits }: HabitListProps) {
  const { currentDate } = useAppContext()
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [isAddingHabit, setIsAddingHabit] = useState(false)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)

  const handleToggleLog = async (habitId: string, date: Date) => {
    await toggleHabitLog(habitId, formatDate(date))
  }

  const handleDeleteHabit = async (habitId: string) => {
    await deleteHabit(habitId)
  }

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit)
  }

  const handleCancelEdit = () => {
    setEditingHabit(null)
    setIsAddingHabit(false)
  }

  if (editingHabit) {
    return <HabitForm habit={editingHabit} onCancel={handleCancelEdit} />
  }

  if (isAddingHabit) {
    return <HabitForm onCancel={handleCancelEdit} />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Habits</h2>
        <Button onClick={() => setIsAddingHabit(true)} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span>New Habit</span>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-2 min-w-[150px]">Habits</th>
              {daysInMonth.map((day) => (
                <th key={day.getDate()} className="text-center p-2 w-10">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500">
                      {day.toLocaleDateString("en-US", { weekday: "short" }).charAt(0)}
                    </span>
                    <span>{day.getDate()}</span>
                  </div>
                </th>
              ))}
              <th className="text-center p-2 min-w-[80px]">Goal</th>
              <th className="text-center p-2 min-w-[80px]">Achieved</th>
              <th className="text-center p-2 min-w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {habits.length === 0 ? (
              <tr>
                <td colSpan={daysInMonth.length + 4} className="text-center p-4 text-gray-500">
                  No habits yet. Add your first habit to get started!
                </td>
              </tr>
            ) : (
              habits.map((habit) => (
                <tr key={habit.id} className="border-t">
                  <td className="p-2 font-medium">{habit.name}</td>

                  {daysInMonth.map((day) => {
                    const dateStr = formatDate(day)
                    const log = habit.logs.find((log) => log.date === dateStr)
                    const isCompleted = log?.completed || false

                    return (
                      <td key={dateStr} className="text-center p-1">
                        <button
                          className={`w-8 h-8 rounded transition-colors ${
                            isCompleted ? "bg-opacity-70" : "bg-opacity-20 hover:bg-opacity-30"
                          }`}
                          style={{ backgroundColor: habit.color }}
                          onClick={() => handleToggleLog(habit.id, day)}
                          aria-label={`${isCompleted ? "Unmark" : "Mark"} ${habit.name} for ${dateStr}`}
                        >
                          {isCompleted && <Check className="h-4 w-4 mx-auto" />}
                        </button>
                      </td>
                    )
                  })}

                  <td className="text-center p-2">{habit.goal}</td>
                  <td
                    className={`text-center p-2 font-medium ${
                      habit.achieved >= habit.goal
                        ? "text-green-600"
                        : habit.achieved >= habit.goal * 0.7
                          ? "text-yellow-600"
                          : ""
                    }`}
                  >
                    {habit.achieved}
                  </td>
                  <td className="p-2">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditHabit(habit)}
                        aria-label={`Edit ${habit.name}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={`Delete ${habit.name}`}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Habit</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{habit.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteHabit(habit.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

