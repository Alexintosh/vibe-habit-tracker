"use client"

import { HabitListActions } from "@/components/habit-list-actions"
import { getHabitsWithLogs } from "../actions"
import { WeeklyHabitsContainer } from "@/components/weekly-habits-container"
import { useEffect, useState } from "react"
import { HabitWithLogs } from "@/lib/types"

export default function WeekPage() {
  const [habits, setHabits] = useState<HabitWithLogs[]>([])
  const [habitsWeekly, setHabitsWeekly] = useState<HabitWithLogs[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHabits = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const fetchedHabits = await getHabitsWithLogs(today.getFullYear(), today.getMonth())
      setHabits(fetchedHabits)
      setHabitsWeekly(fetchedHabits.filter((habit) => habit.frequency === "weekly"))
    } catch (err) {
      setError("Failed to load habits. Please try again.")
      console.error("Error fetching habits:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHabits()
  }, [])

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
        <h2 className="text-2xl font-bold mb-4">Your week</h2>
        <div className="mb-5">
          <HabitListActions onHabitChange={fetchHabits} />
        </div>
        <div className="space-y-8">
          <div className="bg-white">
            <WeeklyHabitsContainer 
              habits={habitsWeekly} 
              onHabitChange={fetchHabits}
            />
          </div>
        </div>
      </main>
    </>
  )
} 