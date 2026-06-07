import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const userId    = "cmq268z1g000nva9wkex7l4s8"
  const projectId = "cmq22scud0002val82w2pbqqz"

  await prisma.projectMember.create({
    data: {
      userId,
      projectId,
      role: "OWNER",
    },
  })

  console.log("✅ Added as project member!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())