import { getHabitsWithLogs } from "../actions"
import { WeeklyHabitsContainer } from "@/components/weekly-habits-container"

export default async function Home() {
  // Use start of current day to avoid hydration mismatch
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const habits = await getHabitsWithLogs(today.getFullYear(), today.getMonth())
  const habitsWeekly = habits.filter((habit) => habit.frequency === "weekly")

  return (
    <>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your week</h1>

        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <WeeklyHabitsContainer habits={habitsWeekly} />
          </div>
        </div>
      </main>
    </>
  )
} 