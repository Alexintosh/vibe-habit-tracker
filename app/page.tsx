import { getHabitsWithLogs } from "./actions"
import { CalendarHeader } from "@/components/ui/calendar-header"
import { HabitList } from "@/components/habit-list"
import { ProgressSummary } from "@/components/progress-summary"
import { HabitListActions } from "@/components/habit-list-actions"
import { useEffect } from "react"

export default async function Home() {
  // Use start of current day to avoid hydration mismatch
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const habits = await getHabitsWithLogs(today.getFullYear(), today.getMonth())
  const habitCategories = [...new Set(habits.map((habit) => habit.category))]

  return (
    <>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Habit Tracker</h1>

        <div className="space-y-8">
          <ProgressSummary habits={habits} />

          <div className="bg-white rounded-lg shadow-md p-6">
            <HabitListActions />
            <CalendarHeader />
            {habitCategories.map((category) => (
              <HabitList 
                key={category}
                habits={habits.filter((habit) => habit.category === category)} 
                title={category} 
              />
            ))}
          </div>
        </div>
      </main>
    </>
  )
}

