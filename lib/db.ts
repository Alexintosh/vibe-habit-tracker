import type { Habit, HabitLog, HabitWithLogs, Frequency } from "./types"
import { prisma } from "./prisma"

type PrismaHabit = {
  id: string
  name: string
  description: string | null
  frequency: string
  goal: number
  color: string
  emoji?: string | null
  category: string
  order: number
  createdAt: Date
}

type PrismaHabitLog = {
  id: string
  habitId: string
  date: string
  completed: boolean
}

// In a real application, this would be replaced with a proper database
// For now, we'll use localStorage for persistence
class HabitDatabase {
  private habits: Habit[] = []
  private logs: HabitLog[] = []
  private initialized = false

  constructor() {
    // Initialize with empty state for SSR
    this.habits = []
    this.logs = []
    
    // We'll load from storage in a useEffect on the client side
    if (typeof window !== "undefined") {
      // Defer loading to avoid hydration mismatch
      setTimeout(() => {
        this.loadFromStorage()
        this.initialized = true
      }, 0)
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
    const habits = await prisma.habit.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })
    return habits.map((habit: PrismaHabit) => ({
      ...habit,
      description: habit.description ?? '',
      emoji: habit.emoji ?? '✨',
      frequency: habit.frequency as Frequency,
      createdAt: habit.createdAt.toISOString()
    }))
  }

  async getHabitById(id: string): Promise<Habit | null> {
    const habit = await prisma.habit.findUnique({
      where: { id }
    })
    if (!habit) return null
    return {
      ...habit,
      description: habit.description ?? '',
      frequency: habit.frequency as Frequency,
      createdAt: habit.createdAt.toISOString()
    }
  }

  async createHabit(habit: Omit<Habit, "id" | "createdAt">): Promise<Habit> {
    // Get the highest order value
    const maxOrder = await prisma.habit.aggregate({
      _max: {
        order: true
      }
    })

    // Create the habit with the next order value
    const created = await prisma.habit.create({
      data: {
        ...habit,
        order: (maxOrder._max.order ?? -1) + 1
      }
    })
    return {
      ...created,
      description: created.description ?? '',
      frequency: created.frequency as Frequency,
      createdAt: created.createdAt.toISOString()
    }
  }

  async updateHabit(id: string, updates: Partial<Omit<Habit, "id" | "createdAt">>): Promise<Habit | null> {
    const updated = await prisma.habit.update({
      where: { id },
      data: updates
    })
    return {
      ...updated,
      createdAt: updated.createdAt.toISOString()
    }
  }

  async deleteHabit(id: string): Promise<boolean> {
    await prisma.habit.delete({
      where: { id }
    })
    return true
  }

  async deleteAllHabits(): Promise<boolean> {
    await prisma.habitLog.deleteMany({})
    await prisma.habit.deleteMany({})
    return true
  }

  async getLogsByHabitId(habitId: string): Promise<HabitLog[]> {
    return prisma.habitLog.findMany({
      where: { habitId },
      orderBy: { date: 'desc' }
    })
  }

  async getLogsByDateRange(startDate: string, endDate: string): Promise<HabitLog[]> {
    return prisma.habitLog.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'desc' }
    })
  }

  async toggleHabitLog(habitId: string, date: string): Promise<HabitLog> {
    const existingLog = await prisma.habitLog.findFirst({
      where: { habitId, date }
    })

    if (existingLog) {
      return prisma.habitLog.update({
        where: { id: existingLog.id },
        data: { completed: !existingLog.completed }
      })
    }

    return prisma.habitLog.create({
      data: {
        habitId,
        date,
        completed: true
      }
    })
  }

  async getHabitsWithLogs(year: number, month: number): Promise<HabitWithLogs[]> {
    const startDate = new Date(year, month, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]

    const habits = await prisma.habit.findMany({
      include: {
        logs: {
          where: {
            date: {
              gte: startDate,
              lte: endDate
            }
          }
        }
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return habits.map((habit: PrismaHabit & { logs: PrismaHabitLog[] }) => ({
      ...habit,
      createdAt: habit.createdAt.toISOString(),
      achieved: this.isHabitAchieved(habit)
      //achieved: habit.logs.filter((log: PrismaHabitLog) => log.completed).length
    }))
  }


 isHabitAchieved(habit: PrismaHabit & { logs: PrismaHabitLog[] }): number {
    const now = new Date()
    let startDate: Date
    let endDate = now

    // Calculate date range based on frequency
    switch (habit.frequency) {
      case 'weekly':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - ((now.getDay() + 6) % 7))
        break
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        break
      case 'semiannual':
        const halfYear = Math.floor(now.getMonth() / 6)
        startDate = new Date(now.getFullYear(), halfYear * 6, 1)
        break
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        return 0 // Invalid frequency
    }

    // Format dates to match log date format
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    // Count completed logs within the frequency period
    const completedInPeriod = habit.logs.filter(log => 
      log.completed && 
      log.date >= startDateStr && 
      log.date <= endDateStr
    ).length

    return completedInPeriod
  }
  

  async updateHabitOrders(updates: { id: string; order: number }[]): Promise<boolean> {
    // Use a transaction to ensure all updates succeed or none do
    await prisma.$transaction(
      updates.map(({ id, order }) =>
        prisma.habit.update({
          where: { id },
          data: { order }
        })
      )
    )
    return true
  }

  async getTodayCompletedNonDailyHabits(): Promise<HabitWithLogs[]> {
    const today = new Date().toISOString().split('T')[0]
    
    const habits = await prisma.habit.findMany({
      where: {
        frequency: {
          not: 'daily'
        },
        logs: {
          some: {
            date: today,
            completed: true
          }
        }
      },
      include: {
        logs: {
          where: {
            date: today
          }
        }
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return habits.map((habit) => ({
      ...habit,
      description: habit.description ?? '',
      emoji: habit.emoji ?? '✨',
      frequency: habit.frequency as Frequency,
      createdAt: habit.createdAt.toISOString(),
      achieved: habit.logs.filter(log => log.completed).length
    }))
  }
}

// Export a singleton instance
export const db = new HabitDatabase()

