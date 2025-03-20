"use client"

import { useState } from "react"
import type { Habit, HabitWithLogs } from "@/lib/types"
import { deleteHabit, deleteAllHabits, toggleHabitLog } from "@/app/actions"
import { useAppContext } from "@/app/providers"
import { formatDate, getDaysInMonth } from "@/lib/date-utils"
import { Button } from "@/components/ui/button"
import { Check, Edit, Plus, Trash, AlertTriangle } from "lucide-react"
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

  const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  const handleToggleLog = async (habitId: string, date: Date | string) => {
    const formattedDate = date instanceof Date ? formatDate(date) : date
    await toggleHabitLog(habitId, formattedDate)
  }

  const handleDeleteHabit = async (habitId: string) => {
    await deleteHabit(habitId)
  }

  const handleDeleteAllHabits = async () => {
    await deleteAllHabits()
  }

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit)
  }

  const handleCancelEdit = () => {
    setEditingHabit(null)
    setIsAddingHabit(false)
  }

  const handleColumnSelect = async (day: Date) => {
    // Get the formatted date for this column
    const date = formatDate(day)
    
    // Find all habits that have a log for this date
    const logsForDate = habits.map(habit => ({
      habitId: habit.id,
      log: habit.logs.find(log => log.date === date)
    }))
    
    // Determine if we should mark all as completed or uncompleted
    // If more than half are completed, we'll mark all as uncompleted
    const completedCount = logsForDate.filter(({ log }) => log?.completed).length
    const shouldComplete = completedCount <= habits.length / 2

    // Toggle all habits for this date
    for (const habit of habits) {
      const log = habit.logs.find(log => log.date === date)
      if ((log?.completed ?? false) !== shouldComplete) {
        await toggleHabitLog(habit.id, date)
      }
    }
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
        <div className="flex gap-2">
          <Button onClick={() => setIsAddingHabit(true)} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span>New Habit</span>
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-1">
                <Trash className="h-4 w-4" />
                <span>Delete All</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Delete All Habits
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your habits and their tracking history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAllHabits} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-2 min-w-[150px]">Habits</th>
              {daysInMonth.map((day) => (
                <th 
                  key={day.getTime()}
                  className={`text-center p-2 w-10 ${
                    isToday(day) ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500">
                      {day.toLocaleDateString("en-US", { weekday: "short" }).charAt(0)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-accent"
                      onClick={() => handleColumnSelect(day)}
                    >
                      {day.getDate()}
                    </Button>
                  </div>
                </th>
              ))}
              <th className="text-center p-2 min-w-[80px]">Goal</th>
              <th className="text-center p-2 min-w-[80px]">Achieved</th>
              <th className="text-center p-2 min-w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => (
              <tr key={habit.id} className="border-t">
                <td className="p-2">
                  <div>
                    <div className="font-medium">{habit.name}</div>
                    {habit.description && (
                      <div className="text-sm text-gray-500">{habit.description}</div>
                    )}
                  </div>
                </td>
                {daysInMonth.map((day) => {
                  const date = formatDate(day)
                  const log = habit.logs.find((log) => log.date === date)
                  return (
                    <td 
                      className={`text-center p-2 ${
                        isToday(day) ? 'bg-muted' : ''
                      }`}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 transition-colors`}
                        style={{
                          backgroundColor: log?.completed 
                            ? `${habit.color}` 
                            : 'transparent',
                          opacity: log?.completed ? 1 : 0.2,
                        }}
                        onClick={() => handleToggleLog(habit.id, day)}
                      >
                        {log?.completed && <Check className="h-4 w-4 text-foreground" />}
                      </Button>
                    </td>
                  )
                })}
                <td className="text-center p-2">{habit.goal}</td>
                <td className="text-center p-2">{habit.achieved}</td>
                <td className="text-center p-2">
                  <div className="flex justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditHabit(habit)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Habit</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this habit and its tracking history.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteHabit(habit.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

