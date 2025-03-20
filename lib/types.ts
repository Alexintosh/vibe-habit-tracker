export type Frequency = "daily" | "weekly"

export interface Habit {
  id: string
  name: string
  description: string
  frequency: Frequency
  goal: number
  color: string
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

