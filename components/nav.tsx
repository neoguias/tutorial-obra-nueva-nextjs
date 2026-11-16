'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AGENCY } from '@/lib/crm'

const links = [
  { href: '/inmuebles', label: 'Inmuebles' },
  { href: '/clientes', label: 'Clientes' },
  { href: '/visitas', label: 'Visitas' },
  { href: '/promociones', label: 'Obra nueva' },
]

/** El menú con la sección actual marcada. La ruta solo se conoce al recibir la petición. */
export function Nav() {
  return <NavLinks pathname={usePathname()} />
}

/** El mismo menú sin marcar, para mostrarlo mientras llega la ruta. */
export function NavLinks({ pathname }: { pathname?: string }) {
  return (
    <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
      <span className="font-semibold text-teal-700">{AGENCY}</span>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-sm hover:text-teal-700 ${pathname?.startsWith(link.href) ? 'font-semibold text-teal-700' : ''}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
