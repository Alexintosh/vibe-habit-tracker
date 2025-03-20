'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card'
import { login } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'

function SubmitButton() {
  return (
    <Button type="submit" className="w-full">
      Login
    </Button>
  )
}

export function LoginForm() {
  const [error, setError] = useState('')
  const router = useRouter()
  
  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <form action={async (formData: FormData) => {
        try {
          const result = await login(formData)
          if (result.success) {
            router.push('/')
            router.refresh()
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Invalid password')
        }
      }}>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}
          <div className="space-y-2">
            <label htmlFor="password">Password</label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  )
} 