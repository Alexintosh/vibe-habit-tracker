"use client"

import { startOfWeek, addDays, format, isToday } from "date-fns";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "./ui/button";
import type { HabitWithLogs } from "@/lib/types";
import { SortableHabitRow } from "./habit-list";

interface WeeklyHabitListProps {
  habits: HabitWithLogs[];
  onToggleLog: (habitId: string, date: Date) => void;
  onEditHabit: (habit: HabitWithLogs) => void;
  onDeleteHabit: (habitId: string) => void;
  onReorder: (habits: HabitWithLogs[]) => void;
}

export function WeeklyHabitList({ 
  habits, 
  onToggleLog, 
  onEditHabit, 
  onDeleteHabit,
  onReorder 
}: WeeklyHabitListProps) {
  // Get current week days
  const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start from Monday
  const daysInWeek = Array.from({ length: 7 }, (_, i) => 
    addDays(startOfCurrentWeek, i)
  );

  // DnD sensors setup
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle DnD end
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = habits.findIndex((habit) => habit.id === active.id);
      const newIndex = habits.findIndex((habit) => habit.id === over.id);
      
      const newHabits = [...habits];
      const [removed] = newHabits.splice(oldIndex, 1);
      newHabits.splice(newIndex, 0, removed);
      
      onReorder(newHabits);
    }
  };

  return (
    <div className="rounded-md border">
      <div className="relative">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Habit</th>
              {daysInWeek.map((day) => (
                <th key={day.toISOString()} className="p-2 text-center">
                  <div>{format(day, 'EEE')}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(day, 'd')}
                  </div>
                </th>
              ))}
              <th className="p-2 text-center">Goal</th>
              <th className="p-2 text-center">Done</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={habits.map((h) => h.id)}
                strategy={verticalListSortingStrategy}
              >
                {habits.map((habit) => (
                  <SortableHabitRow
                    key={habit.id}
                    habit={habit}
                    daysInMonth={daysInWeek}
                    onToggleLog={onToggleLog}
                    onEditHabit={onEditHabit}
                    onDeleteHabit={onDeleteHabit}
                    isToday={isToday}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </tbody>
        </table>
      </div>
    </div>
  );
} 