// app/layout.js
import './globals.css'

export const metadata = {
  title: 'Exam Application',
  description: 'An exam application built with Next.js 14',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}