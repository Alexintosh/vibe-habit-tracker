export type Frequency = "daily" | "weekly"

export type HabitCategory = "MORNING" | "BREAKFAST" | "HEALTH" | "BUILDING" | "OTHER"

export interface Habit {
  id: string
  name: string
  description: string
  frequency: Frequency
  category: HabitCategory
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

