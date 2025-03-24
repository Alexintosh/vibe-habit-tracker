import { HabitListActions } from "@/components/habit-list-actions"
import { getHabitsWithLogs } from "../actions"
import { TodoListView } from "@/components/TodoListView"

export default async function Home() {
  // Use start of current day to avoid hydration mismatch
  const today = new Date()
  const habits = await getHabitsWithLogs(today.getFullYear(), today.getMonth())
  const habitsYearly = habits.filter((habit) => habit.frequency === "yearly")

  return (
    <>
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">Your week</h2>
        <div className="mb-5"><HabitListActions/></div>
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <TodoListView habits={habitsYearly} currentDate={today} />
          </div>
        </div>
      </main>
    </>
  )
} 