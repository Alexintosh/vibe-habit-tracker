'use server'

import { cookies } from 'next/headers'

export async function login(formData: FormData) {
  const password = formData.get('password')
  const envPassword = process.env.APP_PASSWORD

  if (!envPassword) {
    throw new Error('APP_PASSWORD not set in environment variables')
  }

  if (!password || password !== envPassword) {
    throw new Error('Invalid password')
  }

  // Set the auth cookie
  const cookieStore = await cookies()
  cookieStore.set({
    name: 'auth-token',
    value: envPassword,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  return { success: true }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
  return { success: true }
} 