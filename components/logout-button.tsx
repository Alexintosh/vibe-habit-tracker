'use client'

import { Button } from './ui/button'
import { LogOut } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  return (
    <form action={async () => {
      const result = await logout()
      if (result.success) {
        router.push('/login')
        router.refresh()
      }
    }}>
      <Button variant="ghost" size="icon">
        <LogOut className="h-5 w-5" />
      </Button>
    </form>
  )
} 