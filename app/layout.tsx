import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LogoutButton } from "@/components/logout-button"
import { AppProvider } from "@/app/providers"

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
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <AppProvider>
          <div className="absolute right-4 top-4">
            <LogoutButton />
          </div>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}



import './globals.css'