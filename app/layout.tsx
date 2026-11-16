import type { Metadata } from 'next'
import { AGENCY } from '@/lib/crm'
import './globals.css'

export const metadata: Metadata = {
  title: { template: `%s · ${AGENCY}`, default: AGENCY },
}

/** Lo común a todo: el CRM y la web pública ponen cada uno su cabecera en su propio layout. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased">{children}</body>
    </html>
  )
}
