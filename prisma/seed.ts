const { PrismaClient } = require('@prisma/client')
const { readFileSync } = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
  try {
    // Read the seed data file
    const seedFile = readFileSync(
      path.join(__dirname, './seed-data.json'),
      'utf-8'
    )
    const data = JSON.parse(seedFile)

    console.log('🌱 Starting seeding...')

    // Create habits
    for (const habit of data.habits) {
      const created = await prisma.habit.create({
        data: habit,
      })
      console.log(`Created habit: ${created.name}`)
    }

    console.log('✅ Seeding finished')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  }) 