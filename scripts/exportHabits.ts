const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const p = require('path')

// Initialize PrismaClient
const prisma = new PrismaClient()

// Load database before running export
async function init() {
  try {
    // Test database connection
    await prisma.$connect()
    console.log('Database connection established')
    
    // Run the export
    await exportHabits()
  } catch (error) {
    console.error('Failed to connect to database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function exportHabits() {
  try {
    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]

    // Fetch all habits from the database
    const habits = await prisma.habit.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      select: {
        name: true,
        description: true,
        frequency: true,
        goal: true,
        color: true,
        order: true,
        emoji: true
      }
    })

    // Format the data to match seed-data.json structure
    const exportData = {
      habits: habits.map(habit => ({
        ...habit,
        description: habit.description || '', // Handle null descriptions
        category: 'GENERAL' // You can modify this if you store categories
      }))
    }

    // Write to file with date in filename
    const exportPath = p.join(process.cwd(), 'prisma', `habits-${today}.json`)
    fs.writeFileSync(
      exportPath,
      JSON.stringify(exportData, null, 2)
    )

    console.log(`Successfully exported ${habits.length} habits to ${exportPath}`)
  } catch (error) {
    console.error('Failed to export habits:', error)
  }
}

// Run the initialization and export
init() 