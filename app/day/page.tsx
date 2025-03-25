import { getHabitsWithLogs, getTodayCompletedNonDailyHabits } from "@/app/actions"
import { TodoListView } from "@/components/TodoListView"
import { HabitListActions } from "@/components/habit-list-actions"

export default async function MonthPage() {
  const today = new Date()
  const habits = await getHabitsWithLogs(today.getFullYear(), today.getMonth())
  const habitsMonthly = habits.filter(h => h.frequency === 'daily')
  console.log("habitsMonthly", habitsMonthly);
  //TODO this should be the same query as before, we don't need two different queries
  const completedHabits = await getTodayCompletedNonDailyHabits()

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Daily Habits</h2>
        <div className="mb-5"><HabitListActions/></div>
        {habitsMonthly.length > 0 ? (
            <TodoListView habits={habitsMonthly} currentDate={today} />
        ) : (
            <p>No daily habits found</p>
        )}
        </section>
        <section>
          <h2 className="text-2xl font-bold mb-4">Completed Today</h2>
          <TodoListView habits={completedHabits} currentDate={today} />
        </section>
      </div>
    </div>
  )
} 