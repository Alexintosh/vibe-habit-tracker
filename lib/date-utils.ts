export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const date = new Date(year, month, 1)

  while (date.getMonth() === month) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }

  return days
}

export function getMonthName(month: number): string {
  return new Date(0, month).toLocaleString("default", { month: "long" })
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

export function parseDate(dateString: string): Date {
  return new Date(dateString)
}

export function getDayOfWeek(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" }).charAt(0)
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

