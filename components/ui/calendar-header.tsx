"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useAppContext } from "@/app/providers"
import { getMonthName } from "@/lib/date-utils"
import { Button } from "@/components/ui/button"

export function CalendarHeader() {
  const { currentDate, setCurrentDate } = useAppContext()

  const month = currentDate.getMonth()
  const year = currentDate.getFullYear()

  const monthName = currentDate.toLocaleString('en-US', { month: 'long' })

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <Button variant="ghost" onClick={handlePrevMonth} aria-label="Previous month">
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <h2 className="text-xl font-semibold">
        {monthName}, {year}
      </h2>
      <Button variant="ghost" onClick={handleNextMonth} aria-label="Next month">
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  )
}

