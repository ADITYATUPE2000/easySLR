import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

// Call this in any API route to get the logged-in user
export async function requireSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Unauthorized — please sign in")
  }
  return session
}

// Call this to check the user belongs to a project
export async function assertProjectAccess(
  userId: string,
  projectId: string
) {
  const member = await prisma.projectMember.findFirst({
    where: { userId, projectId },
  })
  if (!member) {
    throw new Error("Forbidden — you are not a member of this project")
  }
  return member
}