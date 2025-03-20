import { getHabitsWithLogs } from "./actions"
import { CalendarHeader } from "@/components/ui/calendar-header"
import { HabitList } from "@/components/habit-list"
import { ProgressSummary } from "@/components/progress-summary"

export default async function Home() {
  const today = new Date()
  const habits = await getHabitsWithLogs(today.getFullYear(), today.getMonth())

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Habit Tracker</h1>

      <div className="space-y-8">
        <ProgressSummary habits={habits} />

        <div className="bg-white rounded-lg shadow-md p-6">
          <CalendarHeader />
          <HabitList habits={habits} />
        </div>
      </div>
    </main>
  )
}

