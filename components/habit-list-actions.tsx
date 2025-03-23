"use client"

import { useState } from "react"
import { Plus, Trash, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HabitForm } from "./habit-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteAllHabits } from "@/app/actions"

export function HabitListActions() {
  const [isAddingHabit, setIsAddingHabit] = useState(false)

  if (isAddingHabit) {
    return <HabitForm onCancel={() => setIsAddingHabit(false)} />
  }

  return (
    <div className="flex gap-2">
      <Button onClick={() => setIsAddingHabit(true)} className="flex items-center gap-1">
        <Plus className="h-4 w-4" />
        <span>New Habit</span>
      </Button>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="flex items-center gap-1">
            <Trash className="h-4 w-4" />
            <span>Delete All</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete All Habits
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all your habits and their tracking history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteAllHabits} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 