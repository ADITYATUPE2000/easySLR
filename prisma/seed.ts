import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Create a test organization
  const org = await prisma.organization.create({
    data: {
      name: "Test Org",
    },
  })

  // Create a test project
  const project = await prisma.project.create({
    data: {
      name: "COVID-19 Meta-Analysis",
      orgId: org.id,
    },
  })

  console.log("✅ Created project with ID:", project.id)
  console.log("Copy this ID and use it in your app!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())