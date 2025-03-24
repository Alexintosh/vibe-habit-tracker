'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Directly load the SQLite WASM from CDN to avoid issues with our local setup
const SQLITE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js'

// Define interfaces for database objects
interface Habit {
  id: string
  name: string
  description: string
  frequency: string
  goal: number
  color: string
  emoji: string
  category: string
  order: number
  createdAt: string
}

export default function ImportDbDirectPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  // Helper function to add debug info
  const addDebugInfo = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]}: ${message}`])
  }

  const loadSQLite = () => {
    return new Promise<any>((resolve, reject) => {
      if ((window as any).SQL) {
        resolve((window as any).SQL)
        return
      }

      const script = document.createElement('script')
      script.src = SQLITE_CDN
      script.onload = () => {
        const initSqlJs = (window as any).initSqlJs
        initSqlJs({
          locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        }).then((SQL: any) => {
          (window as any).SQL = SQL
          resolve(SQL)
        }).catch(reject)
      }
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  // Handle file selection and database opening
  const handleSelectFile = async () => {
    try {
      setLoading(true)
      setError(null)
      addDebugInfo('Loading SQLite WASM...')

      // Load SQLite
      const SQL = await loadSQLite()
      addDebugInfo('SQLite loaded successfully')

      // Open file picker
      addDebugInfo('Opening file picker')
      const fileHandles = await window.showOpenFilePicker({
        types: [
          {
            description: 'SQLite Database',
            accept: {
              'application/x-sqlite3': ['.db'],
              'application/octet-stream': ['.db']
            }
          }
        ]
      })

      // Get file
      addDebugInfo('File selected, reading content')
      const fileHandle = fileHandles[0]
      const file = await fileHandle.getFile()
      
      // Read file as ArrayBuffer
      addDebugInfo(`Reading file: ${file.name} (${file.size} bytes)`)
      const arrayBuffer = await file.arrayBuffer()
      
      // Create database
      addDebugInfo('Creating database connection')
      const db = new SQL.Database(new Uint8Array(arrayBuffer))
      
      // Query habits
      addDebugInfo('Querying habits')
      const results = db.exec("SELECT * FROM Habit ORDER BY `order` ASC, createdAt DESC")
      
      if (results.length > 0 && results[0].values.length > 0) {
        const { columns, values } = results[0]
        
        // Convert to habit objects
        const habits: Habit[] = values.map((row: any) => {
          const habit: any = {}
          columns.forEach((col, index) => {
            habit[col] = row[index]
          })
          
          return {
            id: habit.id,
            name: habit.name,
            description: habit.description || '',
            frequency: habit.frequency,
            goal: habit.goal,
            color: habit.color || '#6366F1',
            emoji: habit.emoji || '✨',
            category: habit.category || 'OTHER',
            order: habit.order || 0,
            createdAt: habit.createdAt
          }
        })
        
        addDebugInfo(`Found ${habits.length} habits`)
        setHabits(habits)
      } else {
        addDebugInfo('No habits found in database')
        setHabits([])
      }
    } catch (err: any) {
      console.error('Error:', err)
      setError(`Error: ${err.message || 'Unknown error'}`)
      addDebugInfo(`Error: ${err.message || err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/import-db" 
          className="text-muted-foreground hover:text-foreground flex items-center transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to standard import
        </Link>
        <h1 className="text-3xl font-bold">Import SQLite Database (Direct Method)</h1>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Database File</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button 
              onClick={handleSelectFile}
              disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Select SQLite Database'
              )}
            </Button>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-red-600 font-medium">Error</p>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            )}
            
            {/* Debug information */}
            {debugInfo.length > 0 && (
              <div className="mt-4 border rounded-md p-3 bg-gray-50">
                <p className="font-medium mb-2">Debug Information:</p>
                <pre className="text-xs overflow-auto max-h-40 p-2 bg-gray-100 rounded">
                  {debugInfo.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {habits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Habits ({habits.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {habits.map((habit) => (
                <div 
                  key={habit.id} 
                  className="p-4 border rounded-md flex items-center"
                  style={{ borderLeftColor: habit.color, borderLeftWidth: '4px' }}
                >
                  <div className="mr-3 text-xl">{habit.emoji}</div>
                  <div>
                    <h3 className="font-medium">{habit.name}</h3>
                    <p className="text-sm text-muted-foreground">{habit.description}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-primary/10 text-primary">
                        {habit.frequency}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-gray-100">
                        {habit.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 