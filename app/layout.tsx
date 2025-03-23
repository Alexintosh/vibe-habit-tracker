import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LogoutButton } from "@/components/logout-button"
import { NavMenu } from "@/components/nav-menu"
import { AppProvider } from "@/app/providers"
import { SyncProvider } from "./sync-provider"
import { getHabitsWithLogs } from "./actions"
import { revalidatePath } from "next/cache"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Habit Tracker",
  description: "Track your daily and weekly habits",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const handleSync = async () => {
    'use server'
    // Fetch fresh data from the database
    // const now = new Date()
    // const habits = await getHabitsWithLogs(now.getFullYear(), now.getMonth())
    // // Revalidate the current path to ensure fresh data
    // revalidatePath('/')
    // return habits
  }

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <AppProvider>
          <NavMenu />
          <SyncProvider onSync={handleSync}>
            <div className="absolute right-4 top-4">
              <LogoutButton />
            </div>
            {children}
          </SyncProvider>
        </AppProvider>
      </body>
    </html>
  )
}



import './globals.css'