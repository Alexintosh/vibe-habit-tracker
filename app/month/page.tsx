import { getHabitsWithLogs } from "@/app/actions"
import { MonthlyHabitList } from "@/app/components/MonthlyHabitList"
import { HabitListActions } from "@/components/habit-list-actions"

export default async function MonthPage() {
  const today = new Date()
  const currentDate = today.toISOString().split('T')[0]
  const habits = await getHabitsWithLogs(today.getFullYear(), today.getMonth())
  const habitsMonthly = habits.filter(h => h.frequency === 'monthly')

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        {habitsMonthly.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Monthly Habits</h2>
            <div className="mb-5"><HabitListActions/></div>
            <MonthlyHabitList habits={habitsMonthly} currentDate={currentDate} />
          </section>
        )}
      </div>
    </div>
  )
} 