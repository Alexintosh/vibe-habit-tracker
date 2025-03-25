"use client"

import { startOfWeek, addDays, format, isToday } from "date-fns";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, DragStartEvent, DragEndEvent } from "@dnd-kit/core";
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

  // State for active drag
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    // Find the category of the dragged habit
    for (const [category, categoryHabits] of Object.entries(habitsByCategory)) {
      if (categoryHabits.some(h => h.id === active.id)) {
        setActiveCategory(category);
        break;
      }
    }
  };

  // Handle DnD end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!active || !over || active.id === over.id) {
      setActiveId(null);
      setActiveCategory(null);
      return;
    }

    // Find target habit and its category
    let targetHabit: HabitWithLogs | null = null;
    let targetHabitCategory = "";

    // Find the target habit and its category
    for (const [category, categoryHabits] of Object.entries(habitsByCategory)) {
      const found = categoryHabits.find(h => h.id === over.id);
      if (found) {
        targetHabit = found;
        targetHabitCategory = category;
        break;
      }
    }

    if (!targetHabit) return;

    // Create new habits array with updated order and category
    const newHabits = [...habits];
    const oldIndex = habits.findIndex((h) => h.id === active.id);
    const newIndex = habits.findIndex((h) => h.id === over.id);
    
    // Update the category if it changed
    if (activeCategory !== targetHabitCategory) {
      newHabits[oldIndex] = {
        ...newHabits[oldIndex],
        category: targetHabitCategory
      };
    }

    // Reorder the array
    const [removed] = newHabits.splice(oldIndex, 1);
    newHabits.splice(newIndex, 0, removed);
    
    // Update orders and categories
    const updatedHabits = newHabits.map((habit, index) => ({
      ...habit,
      order: index
    }));
    
    onReorder(updatedHabits);
    setActiveId(null);
    setActiveCategory(null);
  };

  return (
    <div className="rounded-md border relative isolate">
      <div className="relative max-h-[80vh] overflow-auto">
        
        <table className="w-full">
          <thead className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
            <tr className="border-b [&>th]:bg-background/95 [&>th]:backdrop-blur supports-[backdrop-filter]:[&>th]:bg-background/75">
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
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {sortedCategories.map((category) => (
              <tbody 
                key={category}
                className={cn(
                  "transition-colors relative",
                  activeCategory && activeCategory !== category && "opacity-50"
                )}
              >
                <tr 
                  className="bg-muted/100 cursor-pointer hover:bg-muted/70 transition-colors sticky z-40 top-[49px]"
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