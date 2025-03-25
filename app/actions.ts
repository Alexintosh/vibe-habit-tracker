"use server"

import { db } from "@/lib/db"
import type { Habit } from "@/lib/types"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function getHabits() {
  return db.getHabits()
}

export async function getHabitById(id: string) {
  return db.getHabitById(id)
}

export async function createHabit(habit: Omit<Habit, "id" | "createdAt">) {
  const newHabit = await db.createHabit(habit)
  revalidatePath("/")
  return newHabit
}

export async function updateHabit(id: string, updates: Partial<Omit<Habit, "id" | "createdAt">>) {
  const updatedHabit = await db.updateHabit(id, updates)
  revalidatePath("/")
  return updatedHabit
}

export async function deleteHabit(id: string) {
  const result = await db.deleteHabit(id)
  revalidatePath("/")
  return result
}

export async function deleteAllHabits() {
  await db.deleteAllHabits()
  revalidatePath("/")
}

export async function toggleHabitLog(habitId: string, date: string) {
  const log = await db.toggleHabitLog(habitId, date)
  revalidatePath("/")
  return log
}

export async function getHabitsWithLogs(year: number, month: number) {
  return db.getHabitsWithLogs(year, month)
}

export async function updateHabitOrders(updates: { id: string; order: number; category?: string }[]) {
  try {
    await db.updateHabitOrders(updates)
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Failed to update habit orders:', error)
    return { success: false, error: 'Failed to update habit orders' }
  }
}

export async function getTodayCompletedNonDailyHabits() {
  return db.getTodayCompletedNonDailyHabits()
}

