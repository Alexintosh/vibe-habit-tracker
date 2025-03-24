import { importDatabase, exportDatabase } from "@/app/actions"

let currentDatabaseHandle: FileSystemHandle | null = null

export async function importDatabaseFile(): Promise<boolean> {
  try {
    // Request file handle from user
    const fileHandle = await window.showOpenFilePicker({
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

    // Get the file
    const file = await fileHandle[0].getFile()
    if (!file) {
      throw new Error('Could not get file')
    }

    // Read the file content
    const buffer = await file.arrayBuffer()
    
    // Import the database using server action
    return await importDatabase(buffer)
  } catch (error) {
    console.error('Error importing database:', error)
    return false
  }
}

export async function exportDatabaseFile(): Promise<boolean> {
  try {
    // Request file handle from user
    const fileHandle = await window.showSaveFilePicker({
      types: [
        {
          description: 'SQLite Database',
          accept: {
            'application/x-sqlite3': ['.db'],
            'application/octet-stream': ['.db']
          }
        }
      ],
      suggestedName: `habits-${new Date().toISOString().split('T')[0]}.db`
    })

    // Get the database content from server
    const data = await exportDatabase()
    if (!data) {
      throw new Error('Failed to export database')
    }
    
    // Create a writable stream
    const writable = await fileHandle.createWritable()
    
    // Write the data
    await writable.write(data)
    
    return true
  } catch (error) {
    console.error('Error exporting database:', error)
    return false
  }
} 