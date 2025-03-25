"use client"

import { getHabitsWithLogs, getHabitsWithLogsByPeriod } from "./actions"
import { CalendarHeader } from "@/components/ui/calendar-header"
import { HabitList } from "@/components/habit-list"
import { ProgressSummary } from "@/components/progress-summary"
import { HabitListActions } from "@/components/habit-list-actions"
import { useEffect, useState } from "react"
import { HabitWithLogs } from "@/lib/types"
import { endOfMonth, startOfMonth } from "date-fns"

export default function Home() {
  const [habits, setHabits] = useState<HabitWithLogs[]>([])
  const [habitCategories, setHabitCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [periodType, setPeriodType] = useState<PeriodType>('month')

  const fetchHabits = async (date: Date = currentDate) => {
    try {
      setIsLoading(true)
      setError(null)

      // Get start of month and end of month
      const monthStart = startOfMonth(date)
      const monthEnd = endOfMonth(date)
      const fetchedHabits = await getHabitsWithLogsByPeriod(monthStart, monthEnd)
      setHabits(fetchedHabits)
      setHabitCategories([...new Set(fetchedHabits.map((habit) => habit.category))])
    } catch (err) {
      setError("Failed to load habits. Please try again.")
      console.error("Error fetching habits:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHabits()
  }, [currentDate])

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate)
  }

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-lg">Loading habits...</div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-lg text-red-500">{error}</div>
        </div>
      </main>
    )
  }

  return (
    <>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Habit Tracker</h1>

        <div className="space-y-8">
          <ProgressSummary habits={habits} />

          <div className="bg-white rounded-lg shadow-md p-6">
            <HabitListActions onHabitChange={fetchHabits} />
            <CalendarHeader />
            {habitCategories.map((category) => (
              <HabitList 
                key={category}
                habits={habits.filter((habit) => habit.category === category)} 
                title={category}
                onHabitChange={fetchHabits}
              />
            ))}
          </div>
        </div>
      </main>
    </>
  )
}

