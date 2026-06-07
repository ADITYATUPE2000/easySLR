import NextAuth from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions = {
  providers: [
    // Email + Password login
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          throw new Error("No account found with this email")
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isValid) {
          throw new Error("Incorrect password")
        }

        return {
          id:    user.id,
          name:  user.name,
          email: user.email,
          image: user.image,
        }
      },
    }),

    // GitHub OAuth login
    GitHubProvider({
      clientId:     process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt" as const,
  },

  pages: {
    signIn: "/login", // use our custom login page
  },

  callbacks: {
    async signIn({ user, account, profile }: any) {
      // Only run setup for GitHub logins
      if (account?.provider === "github" && profile?.email) {
        const existing = await prisma.user.findUnique({
          where: { email: profile.email },
        })

        if (!existing) {
          const org = await prisma.organization.create({
            data: { name: `${profile.name}'s Org` },
          })

          const newUser = await prisma.user.create({
            data: {
              email: profile.email,
              name:  profile.name,
              image: profile.avatar_url,
              orgId: org.id,
            },
          })

          const project = await prisma.project.create({
            data: {
              name:  "My First Review",
              orgId: org.id,
            },
          })

          await prisma.projectMember.create({
            data: {
              userId:    newUser.id,
              projectId: project.id,
              role:      "OWNER",
            },
          })
        } else {
          await prisma.user.update({
            where: { email: profile.email },
            data: {
              name:  profile.name,
              image: profile.avatar_url,
            },
          })
        }
      }
      return true
    },

    async jwt({ token, user, account, profile }: any) {
      // On first sign in, attach DB user ID to token
      if (user) {
        token.id = user.id
      }
      // For GitHub, find DB user by email
      if (account?.provider === "github" && profile?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: profile.email },
        })
        if (dbUser) token.id = dbUser.id
      }
      return token
    },

    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)