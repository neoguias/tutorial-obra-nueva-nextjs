import { AGENCY } from '@/lib/crm'

/** La web pública de la agencia, sin el menú del CRM. */
export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-4 font-semibold text-teal-700">{AGENCY}</div>
      </header>
      <main>{children}</main>
    </div>
  )
}
