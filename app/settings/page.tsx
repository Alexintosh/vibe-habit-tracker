'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { importDatabaseFile, exportDatabaseFile } from "@/lib/utils/db-import"
import { toast } from "sonner"

export default function SettingsPage() {
  const handleImport = async () => {
    const success = await importDatabaseFile()
    if (success) {
      toast.success('Database imported successfully')
    } else {
      toast.error('Failed to import database')
    }
  }

  const handleExport = async () => {
    const success = await exportDatabaseFile()
    if (success) {
      toast.success('Database exported successfully')
    } else {
      toast.error('Failed to export database')
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Database Management</CardTitle>
          <CardDescription>
            Import or export your habits database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={handleImport}>
              Import Database
            </Button>
            <Button onClick={handleExport}>
              Export Database
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 