'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react'
import { initSqlite, createDbConnection, queryHabits } from '@/lib/utils/sqlite-loader'
import Link from 'next/link'

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

export default function ImportDbPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(false)
  const [initLoading, setInitLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sqliteInitialized, setSqliteInitialized] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  // Helper function to add debug info
  const addDebugInfo = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]}: ${message}`])
  }

  // Initialize SQLite WASM
  useEffect(() => {
    const loadSqlite = async () => {
      try {
        addDebugInfo('Starting SQLite initialization')
        setInitLoading(true)
        await initSqlite()
        setSqliteInitialized(true)
        addDebugInfo('SQLite initialized successfully')
      } catch (err: any) {
        console.error('Failed to initialize SQLite:', err)
        setError(`Failed to initialize SQLite: ${err.message || 'Unknown error'}`)
        addDebugInfo(`SQLite init error: ${err.message || err}`)
      } finally {
        setInitLoading(false)
      }
    }

    loadSqlite()
  }, [])

  // Handle file selection and database opening
  const handleSelectFile = async () => {
    if (!sqliteInitialized) {
      setError('SQLite is not initialized yet. Please wait.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      addDebugInfo('Opening file picker')

      // Open file picker
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
      
      // Create database connection
      addDebugInfo('Creating database connection')
      const sqliteDb = await createDbConnection(arrayBuffer)
      
      // Query habits
      addDebugInfo('Querying habits')
      const results = await queryHabits(sqliteDb)
      addDebugInfo(`Found ${results.length} habits`)
      setHabits(results)
    } catch (err: any) {
      console.error('Error opening database:', err)
      setError(`Failed to open database: ${err.message || 'Unknown error'}`)
      addDebugInfo(`Error: ${err.message || err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Import SQLite Database</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-8">
        <p className="text-blue-700 mb-2">
          Having issues with the SQLite WASM loader? Try our simplified direct import method:
        </p>
        <Link 
          href="/import-db/direct" 
          className="text-blue-600 font-medium flex items-center hover:underline"
        >
          Go to simplified import page <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Database File</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button 
              onClick={handleSelectFile}
              disabled={loading || initLoading || !sqliteInitialized}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : initLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing SQLite...
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