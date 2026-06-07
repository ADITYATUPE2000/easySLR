import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import SessionWrapper from "@/components/SessionWrapper"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EasySLR",
  description: "Systematic Literature Review Tool",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  )
}
