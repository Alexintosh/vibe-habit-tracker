import type { Habit, HabitLog, HabitWithLogs } from "./types"

// In a real application, this would be replaced with a proper database
// For now, we'll use localStorage for persistence
class HabitDatabase {
  private habits: Habit[] = []
  private logs: HabitLog[] = []
  private initialized = false

  constructor() {
    // Initialize from localStorage when in browser environment
    if (typeof window !== "undefined") {
      this.loadFromStorage()
      this.initialized = true
    }
  }

  private loadFromStorage() {
    try {
      const habitsJson = localStorage.getItem("habits")
      const logsJson = localStorage.getItem("habitLogs")

      if (habitsJson) {
        this.habits = JSON.parse(habitsJson)
      }

      if (logsJson) {
        this.logs = JSON.parse(logsJson)
      }
    } catch (error) {
      console.error("Failed to load from storage:", error)
    }
  }

  private saveToStorage() {
    if (!this.initialized) return

    try {
      localStorage.setItem("habits", JSON.stringify(this.habits))
      localStorage.setItem("habitLogs", JSON.stringify(this.logs))
    } catch (error) {
      console.error("Failed to save to storage:", error)
    }
  }

  async getHabits(): Promise<Habit[]> {
    return [...this.habits]
  }

  async getHabitById(id: string): Promise<Habit | null> {
    return this.habits.find((habit) => habit.id === id) || null
  }

  async createHabit(habit: Omit<Habit, "id" | "createdAt">): Promise<Habit> {
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }

    this.habits.push(newHabit)
    this.saveToStorage()

    return newHabit
  }

  async updateHabit(id: string, updates: Partial<Omit<Habit, "id" | "createdAt">>): Promise<Habit | null> {
    const index = this.habits.findIndex((habit) => habit.id === id)

    if (index === -1) return null

    const updatedHabit = {
      ...this.habits[index],
      ...updates,
    }

    this.habits[index] = updatedHabit
    this.saveToStorage()

    return updatedHabit
  }

  async deleteHabit(id: string): Promise<boolean> {
    const initialLength = this.habits.length
    this.habits = this.habits.filter((habit) => habit.id !== id)

    // Also delete associated logs
    this.logs = this.logs.filter((log) => log.habitId !== id)

    this.saveToStorage()

    return this.habits.length < initialLength
  }

  async getLogsByHabitId(habitId: string): Promise<HabitLog[]> {
    return this.logs.filter((log) => log.habitId === habitId)
  }

  async getLogsByDateRange(startDate: string, endDate: string): Promise<HabitLog[]> {
    return this.logs.filter((log) => {
      return log.date >= startDate && log.date <= endDate
    })
  }

  async toggleHabitLog(habitId: string, date: string): Promise<HabitLog> {
    const existingLog = this.logs.find((log) => log.habitId === habitId && log.date === date)

    if (existingLog) {
      // Toggle existing log
      existingLog.completed = !existingLog.completed
      this.saveToStorage()
      return existingLog
    } else {
      // Create new log
      const newLog: HabitLog = {
        id: crypto.randomUUID(),
        habitId,
        date,
        completed: true,
      }

      this.logs.push(newLog)
      this.saveToStorage()

      return newLog
    }
  }

  async getHabitsWithLogs(year: number, month: number): Promise<HabitWithLogs[]> {
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)

    const startDateStr = startDate.toISOString().split("T")[0]
    const endDateStr = endDate.toISOString().split("T")[0]

    const logs = await this.getLogsByDateRange(startDateStr, endDateStr)

    return this.habits.map((habit) => {
      const habitLogs = logs.filter((log) => log.habitId === habit.id)
      const achieved = habitLogs.filter((log) => log.completed).length

      return {
        ...habit,
        logs: habitLogs,
        achieved,
      }
    })
  }
}

// Export a singleton instance
export const db = new HabitDatabase()

