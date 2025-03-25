"use client"

import { startOfWeek, addDays, format, isToday } from "date-fns";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { HabitWithLogs } from "@/lib/types";
import { SortableHabitRow } from "./habit-list";
import { HabitCategories } from "@/lib/types";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
  // State for expanded categories
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(HabitCategories)
  );

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Get current week days
  const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start from Monday
  const daysInWeek = Array.from({ length: 7 }, (_, i) => 
    addDays(startOfCurrentWeek, i)
  );

  // Group habits by category
  const habitsByCategory = habits.reduce((acc, habit) => {
    const category = habit.category || "OTHER";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(habit);
    return acc;
  }, {} as Record<string, HabitWithLogs[]>);

  // Sort categories based on HabitCategories order
  const sortedCategories = Object.keys(habitsByCategory).sort((a, b) => {
    const indexA = HabitCategories.indexOf(a as typeof HabitCategories[number]);
    const indexB = HabitCategories.indexOf(b as typeof HabitCategories[number]);
    return indexA - indexB;
  });

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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {sortedCategories.map((category) => (
              <tbody key={category}>
                <tr 
                  className="bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => toggleCategory(category)}
                >
                  <td colSpan={12} className="p-2 font-medium">
                    <div className="flex items-center gap-2">
                      <ChevronRight 
                        className={cn(
                          "h-4 w-4 transition-transform",
                          expandedCategories.has(category) && "rotate-90"
                        )}
                      />
                      {category}
                    </div>
                  </td>
                </tr>
                {expandedCategories.has(category) && (
                  <SortableContext
                    items={habitsByCategory[category].map((h) => h.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {habitsByCategory[category].map((habit) => (
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
                )}
              </tbody>
            ))}
          </DndContext>
        </table>
      </div>
    </div>
  );
} 