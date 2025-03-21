"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Habit, Frequency } from "@/lib/types"
import { createHabit, updateHabit } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface HabitFormProps {
  habit?: Habit
  onCancel: () => void
}

const COLORS = [
  "#FECACA", // red-200
  "#FED7AA", // orange-200
  "#FEF08A", // yellow-200
  "#D9F99D", // lime-200
  "#BBF7D0", // green-200
  "#A7F3D0", // emerald-200
  "#BAE6FD", // light-blue-200
  "#C7D2FE", // indigo-200
  "#DDD6FE", // purple-200
  "#FBCFE8", // pink-200
]

export function HabitForm({ habit, onCancel }: HabitFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: habit?.name || "",
    description: habit?.description || "",
    frequency: habit?.frequency || ("daily" as Frequency),
    goal: habit?.goal || 20,
    color: habit?.color || COLORS[0],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFrequencyChange = (value: string) => {
    setFormData((prev) => ({ ...prev, frequency: value as Frequency }))
  }

  const handleColorChange = (color: string) => {
    setFormData((prev) => ({ ...prev, color }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (habit) {
        await updateHabit(habit.id, formData)
      } else {
        await createHabit(formData)
      }
      router.refresh()
      onCancel()
    } catch (error) {
      console.error("Error saving habit:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{habit ? "Edit Habit" : "Add New Habit"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Morning Exercise"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your habit..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <RadioGroup value={formData.frequency} onValueChange={handleFrequencyChange} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily">Daily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly">Weekly</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">Monthly Goal</Label>
            <Input
              id="goal"
              name="goal"
              type="number"
              min="1"
              max="31"
              value={formData.goal}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full ${
                    formData.color === color ? "ring-2 ring-offset-2 ring-gray-400" : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : habit ? "Update Habit" : "Add Habit"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

