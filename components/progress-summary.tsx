"use client"

import type { HabitWithLogs } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ProgressSummaryProps {
  habits: HabitWithLogs[]
}

export function ProgressSummary({ habits }: ProgressSummaryProps) {
  if (habits.length === 0) {
    return null
  }

  const totalGoals = habits.reduce((sum, habit) => sum + habit.goal, 0)
  const totalAchieved = habits.reduce((sum, habit) => sum + habit.achieved, 0)
  const completionRate = totalGoals > 0 ? Math.round((totalAchieved / totalGoals) * 100) : 0

  const completedHabits = habits.filter((habit) => habit.achieved >= habit.goal).length
  const habitCompletionRate = habits.length > 0 ? Math.round((completedHabits / habits.length) * 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Overall Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate}%</div>
          <Progress value={completionRate} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {totalAchieved} of {totalGoals} total check-ins
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Habits Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{habitCompletionRate}%</div>
          <Progress value={habitCompletionRate} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {completedHabits} of {habits.length} habits reached their goals
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

