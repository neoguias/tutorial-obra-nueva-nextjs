import { Suspense } from 'react'
import { Nav, NavLinks } from '@/components/nav'

/** Las pantallas del CRM, con su menú. */
export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <Suspense fallback={<NavLinks />}>
          <Nav />
        </Suspense>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </>
  )
}
