export type Frequency = "daily" | "weekly" | "monthly" | "yearly" | "quarterly" | "semiannual"

export const HabitCategories = ["MORNING", "BREAKFAST", "HEALTH", "BUILDING", "OTHER", "ADULTING"] as const;

export interface Habit {
  id: string
  name: string
  description: string
  frequency: Frequency
  category: string
  goal: number
  color: string
  emoji?: string
  createdAt: string
}

export interface HabitLog {
  id: string
  habitId: string
  date: string
  completed: boolean
}

export interface HabitWithLogs extends Habit {
  logs: HabitLog[]
  achieved: number
}

