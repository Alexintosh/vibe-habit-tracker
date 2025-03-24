"use client"
import type { HabitWithLogs} from "@/lib/types"
import { useAppContext } from "@/app/providers"
import { formatDate, getDaysInMonth } from "@/lib/date-utils"
import { Button } from "@/components/ui/button"
import { Check, GripVertical } from "lucide-react"
import { HabitForm } from "./habit-form"
import { HabitActions } from "./habit-actions"
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useHabitActions } from "@/lib/hooks/use-habit-actions"

interface HabitListProps {
  habits: HabitWithLogs[],
  title: string,
  onHabitChange: () => Promise<void>
}

// Create a sortable row component
export function SortableHabitRow({ 
  habit, 
  daysInMonth,
  onToggleLog,
  onEditHabit,
  onDeleteHabit,
  isToday 
}: { 
  habit: HabitWithLogs
  daysInMonth: Date[]
  onToggleLog: (habitId: string, date: Date) => void
  onEditHabit: (habit: HabitWithLogs) => void
  onDeleteHabit: (habitId: string) => void
  isToday: (date: Date) => boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const rowClassName = `${isDragging ? 'bg-accent' : ''} ${habit.achieved >= habit.goal ? 'bg-green-50 hover:bg-green-100' : ''}`
  const stickyCellClassName = `sticky left-0 shadow-[4px_0_4px_-4px_rgba(0,0,0,0.1)] z-20 ${rowClassName}`

  return (
    <tr 
      ref={setNodeRef} 
      style={style}
      className={`border-t ${rowClassName}`}
      {...attributes}
    >
      <td className={`p-2 ${stickyCellClassName} bg-white`}>
        <div className="flex items-center gap-2">
          <button 
            className="cursor-grab hover:bg-accent p-1 rounded" 
            {...listeners}
          >
            <div className="h-4 w-4">{habit.emoji || '✨'}</div>
          </button>
          <div>
            <div className="font-medium">{habit.name}</div>
            <div className="text-sm text-gray-500">{habit.achieved}/{habit.goal}</div>
          </div>
        </div>
      </td>
      {daysInMonth.map((day) => {
        const date = formatDate(day)
        const log = habit.logs.find((log) => log.date === date)
        return (
          <td 
            className={`text-center p-2 ${isToday(day) ? 'bg-muted' : ''}`}
          >
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 transition-colors`}
              style={{
                backgroundColor: log?.completed 
                  ? `${habit.color}` 
                  : 'transparent',
                opacity: log?.completed ? 1 : 0.2,
              }}
              onClick={() => onToggleLog(habit.id, day)}
            >
              {log?.completed && <Check className="h-4 w-4 text-foreground" />}
            </Button>
          </td>
        )
      })}
      <td className="text-center p-2">{habit.goal}</td>
      <td className="text-center p-2">{habit.achieved}</td>
      <td className={`text-center p-2 sticky right-0 shadow-[-4px_0_4px_-4px_rgba(0,0,0,0.1)] z-20 ${rowClassName} bg-white`}>
        <HabitActions
          habit={habit}
          onEdit={onEditHabit}
          onDelete={onDeleteHabit}
        />
      </td>
    </tr>
  )
}

export function HabitList({ habits: initialHabits, title, onHabitChange }: HabitListProps) {
  const { currentDate } = useAppContext()
  const {
    habits,
    editingHabit,
    setEditingHabit,
    handleToggleLog,
    handleEditHabit,
    handleDeleteHabit,
    handleReorder
  } = useHabitActions(initialHabits)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)

  const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  const handleColumnSelect = async (day: Date) => {
    const date = formatDate(day)
    
    // Find all habits that have a log for this date
    const logsForDate = habits.map(habit => ({
      habitId: habit.id,
      log: habit.logs.find(log => log.date === date)
    }))
    
    // Determine if we should mark all as completed or uncompleted
    const completedCount = logsForDate.filter(({ log }) => log?.completed).length
    const shouldComplete = completedCount <= habits.length / 2

    // Toggle all habits for this date
    for (const habit of habits) {
      await handleToggleLog(habit.id, day)
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = habits.findIndex((item) => item.id === active.id)
      const newIndex = habits.findIndex((item) => item.id === over?.id)

      // Create a deep copy of the habits array to preserve all properties
      const newHabits = [...habits]
      const [removed] = newHabits.splice(oldIndex, 1)
      newHabits.splice(newIndex, 0, removed)

      // Update the order through the hook
      handleReorder(newHabits)
    }
  }

  if (editingHabit) {
    return <HabitForm 
      habit={editingHabit} 
      onCancel={() => setEditingHabit(null)} 
      onSuccess={onHabitChange}
    />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold capitalize">{title} ({habits.length})</h2>
      </div>

      <div className="overflow-x-auto relative [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-white">
              <th className="text-left p-2 min-w-[150px] sticky left-0 bg-white shadow-[4px_0_4px_-4px_rgba(0,0,0,0.1)] z-20">Habits</th>
              {daysInMonth.map((day) => (
                <th 
                  key={day.getTime()}
                  className={`text-center p-2 w-10 bg-white ${
                    isToday(day) ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500">
                      {day.toLocaleDateString("en-US", { weekday: "short" }).charAt(0)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-accent"
                      onClick={() => handleColumnSelect(day)}
                    >
                      {day.getDate()}
                    </Button>
                  </div>
                </th>
              ))}
              <th className="text-center p-2 min-w-[80px] bg-white">Goal</th>
              <th className="text-center p-2 min-w-[80px] bg-white">Achieved</th>
              <th className="text-center p-2 min-w-[100px] sticky right-0 bg-white shadow-[-4px_0_4px_-4px_rgba(0,0,0,0.1)] z-20">Actions</th>
            </tr>
          </thead>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <tbody>
              <SortableContext
                items={habits.map(habit => habit.id)}
                strategy={verticalListSortingStrategy}
              >
                {habits.map((habit) => (
                  <SortableHabitRow
                    key={habit.id}
                    habit={habit}
                    daysInMonth={daysInMonth}
                    onToggleLog={handleToggleLog}
                    onEditHabit={handleEditHabit}
                    onDeleteHabit={handleDeleteHabit}
                    isToday={isToday}
                  />
                ))}
              </SortableContext>
            </tbody>
          </DndContext>
        </table>
      </div>
    </div>
  )
}

