import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

export async function GET() {
    const session = await getServerSession(authOptions)
    return NextResponse.json({
        session,
        nextauthUrl: process.env.NEXTAUTH_URL,
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        hasGithubId: !!process.env.GITHUB_CLIENT_ID,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
    })
}