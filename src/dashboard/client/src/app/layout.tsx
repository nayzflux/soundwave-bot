import './globals.css'
import { Inter } from 'next/font/google'
import React from "react";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Dashboard | SoundWave Bot',
  description: 'Welcome on the SoundWave Bot dashboard, here you can manage queue and play song on your server',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
        <body className={"scrollbar-hide " + inter.className}>{children}</body>
    </html>
  )
}
