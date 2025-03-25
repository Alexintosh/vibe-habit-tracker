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
      achieved: this.isHabitAchieved2(habit, (new Date(year, month, 1)), (new Date(year, month + 1, 0)))
      //achieved: habit.logs.filter((log: PrismaHabitLog) => log.completed).length
    }))
  }

  async getHabitsWithLogsByPeriod(startDate: Date, endDate: Date): Promise<HabitWithLogs[]> {

    const habits = await prisma.habit.findMany({
      include: {
        logs: {
          where: {
            date: {
              gte: startDate.toISOString().split('T')[0],
              lte: endDate.toISOString().split('T')[0]
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
      achieved: this.isHabitAchieved2(habit, startDate, endDate)
    }))
  }

  isHabitAchieved2(
    habit: PrismaHabit & { logs: PrismaHabitLog[] },
    periodStart?: Date,
    periodEnd?: Date
  ): number {
    // Default to current period if not specified
    const now = new Date()
    const endDate = periodEnd || now
    
    // Initialize the result object
    const result = {
      achieved: false,
      completed: 0,
      required: habit.goal || 0,
      periods: [] as { start: Date, end: Date, achieved: boolean, completed: number }[]
    }

    // If no goal is set, return early
    if (!habit.goal) {
      return result
    }

    // Get the formatted date strings from logs for easy comparison
    const completedLogDates = habit.logs
      .filter(log => log.completed)
      .map(log => log.date)

    // Handle different frequencies
    switch (habit.frequency) {
      case 'weekly': {
        // Determine periods to analyze
        let currentPeriodStart: Date
        
        if (periodStart) {
          // Start from the beginning of the week containing periodStart
          currentPeriodStart = new Date(periodStart)
          const dayOfWeek = currentPeriodStart.getDay()
          // Adjust to Monday (weekStartsOn: 1)
          currentPeriodStart.setDate(currentPeriodStart.getDate() - ((dayOfWeek + 6) % 7))
        } else {
          // Use current week
          currentPeriodStart = new Date(now)
          const dayOfWeek = currentPeriodStart.getDay()
          currentPeriodStart.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
        }
        
        // Process each week in the range
        while (currentPeriodStart <= endDate) {
          const periodEnd = new Date(currentPeriodStart)
          periodEnd.setDate(currentPeriodStart.getDate() + 6) // End of week (Sunday)
          
          // Count completed logs in this week
          const startStr = currentPeriodStart.toISOString().split('T')[0]
          const endStr = periodEnd.toISOString().split('T')[0]
          
          const completedInPeriod = completedLogDates.filter(
            date => date >= startStr && date <= endStr
          ).length
          
          // Record this period's results
          result.periods.push({
            start: new Date(currentPeriodStart),
            end: new Date(periodEnd),
            achieved: completedInPeriod >= habit.goal,
            completed: completedInPeriod
          })
          
          // Move to next week
          currentPeriodStart.setDate(currentPeriodStart.getDate() + 7)
        }
        break
      }
      
      case 'monthly': {
        // Determine periods to analyze
        let currentPeriodStart: Date
        
        if (periodStart) {
          // Start from the beginning of the month containing periodStart
          currentPeriodStart = new Date(periodStart.getFullYear(), periodStart.getMonth(), 1)
        } else {
          // Use current month
          currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1)
        }
        
        // Process each month in the range
        while (currentPeriodStart <= endDate) {
          const periodEnd = new Date(currentPeriodStart)
          // Last day of the month
          periodEnd.setMonth(periodEnd.getMonth() + 1)
          periodEnd.setDate(0)
          
          // Count completed logs in this month
          const startStr = currentPeriodStart.toISOString().split('T')[0]
          const endStr = periodEnd.toISOString().split('T')[0]
          
          const completedInPeriod = completedLogDates.filter(
            date => date >= startStr && date <= endStr
          ).length
          
          // Record this period's results
          result.periods.push({
            start: new Date(currentPeriodStart),
            end: new Date(periodEnd),
            achieved: completedInPeriod >= habit.goal,
            completed: completedInPeriod
          })
          
          // Move to next month
          currentPeriodStart.setMonth(currentPeriodStart.getMonth() + 1)
        }
        break
      }
      
      case 'quarterly': {
        // Determine periods to analyze
        let currentPeriodStart: Date
        
        if (periodStart) {
          // Start from the beginning of the quarter containing periodStart
          const quarter = Math.floor(periodStart.getMonth() / 3)
          currentPeriodStart = new Date(periodStart.getFullYear(), quarter * 3, 1)
        } else {
          // Use current quarter
          const quarter = Math.floor(now.getMonth() / 3)
          currentPeriodStart = new Date(now.getFullYear(), quarter * 3, 1)
        }
        
        // Process each quarter in the range
        while (currentPeriodStart <= endDate) {
          const periodEnd = new Date(currentPeriodStart)
          // Last day of the quarter
          periodEnd.setMonth(currentPeriodStart.getMonth() + 3)
          periodEnd.setDate(0)
          
          // Count completed logs in this quarter
          const startStr = currentPeriodStart.toISOString().split('T')[0]
          const endStr = periodEnd.toISOString().split('T')[0]
          
          const completedInPeriod = completedLogDates.filter(
            date => date >= startStr && date <= endStr
          ).length
          
          // Record this period's results
          result.periods.push({
            start: new Date(currentPeriodStart),
            end: new Date(periodEnd),
            achieved: completedInPeriod >= habit.goal,
            completed: completedInPeriod
          })
          
          // Move to next quarter
          currentPeriodStart.setMonth(currentPeriodStart.getMonth() + 3)
        }
        break
      }
      
      case 'semiannual': {
        // Determine periods to analyze
        let currentPeriodStart: Date
        
        if (periodStart) {
          // Start from the beginning of the half-year containing periodStart
          const halfYear = Math.floor(periodStart.getMonth() / 6)
          currentPeriodStart = new Date(periodStart.getFullYear(), halfYear * 6, 1)
        } else {
          // Use current half-year
          const halfYear = Math.floor(now.getMonth() / 6)
          currentPeriodStart = new Date(now.getFullYear(), halfYear * 6, 1)
        }
        
        // Process each half-year in the range
        while (currentPeriodStart <= endDate) {
          const periodEnd = new Date(currentPeriodStart)
          // Last day of the half-year
          periodEnd.setMonth(currentPeriodStart.getMonth() + 6)
          periodEnd.setDate(0)
          
          // Count completed logs in this half-year
          const startStr = currentPeriodStart.toISOString().split('T')[0]
          const endStr = periodEnd.toISOString().split('T')[0]
          
          const completedInPeriod = completedLogDates.filter(
            date => date >= startStr && date <= endStr
          ).length
          
          // Record this period's results
          result.periods.push({
            start: new Date(currentPeriodStart),
            end: new Date(periodEnd),
            achieved: completedInPeriod >= habit.goal,
            completed: completedInPeriod
          })
          
          // Move to next half-year
          currentPeriodStart.setMonth(currentPeriodStart.getMonth() + 6)
        }
        break
      }
      
      case 'yearly': {
        // Determine periods to analyze
        let currentPeriodStart: Date
        
        if (periodStart) {
          // Start from the beginning of the year containing periodStart
          currentPeriodStart = new Date(periodStart.getFullYear(), 0, 1)
        } else {
          // Use current year
          currentPeriodStart = new Date(now.getFullYear(), 0, 1)
        }
        
        // Process each year in the range
        while (currentPeriodStart <= endDate) {
          const periodEnd = new Date(currentPeriodStart.getFullYear(), 11, 31)
          
          // Count completed logs in this year
          const startStr = currentPeriodStart.toISOString().split('T')[0]
          const endStr = periodEnd.toISOString().split('T')[0]
          
          const completedInPeriod = completedLogDates.filter(
            date => date >= startStr && date <= endStr
          ).length
          
          // Record this period's results
          result.periods.push({
            start: new Date(currentPeriodStart),
            end: new Date(periodEnd),
            achieved: completedInPeriod >= habit.goal,
            completed: completedInPeriod
          })
          
          // Move to next year
          currentPeriodStart.setFullYear(currentPeriodStart.getFullYear() + 1)
        }
        break
      }
    }
    
    // For the overall period, check if all subperiods achieved their goals
    // or if the most recent period achieved its goal
    if (result.periods.length > 0) {
      // Count total completions across all periods
      result.completed = result.periods.reduce((sum, period) => sum + period.completed, 0)
      
      // Check if the most recent relevant period achieved its goal
      const mostRecentPeriod = result.periods[result.periods.length - 1]
      if (mostRecentPeriod && mostRecentPeriod.end >= now) {
        result.achieved = mostRecentPeriod.achieved
      }
    }
    
    return result.completed
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
  

  async updateHabitOrders(updates: { id: string; order: number; category?: string }[]): Promise<boolean> {
    // Use a transaction to ensure all updates succeed or none do
    await prisma.$transaction(
      updates.map(({ id, order, category }) =>
        prisma.habit.update({
          where: { id },
          data: {
            order,
            ...(category && { category })
          }
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

