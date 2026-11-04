import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Icon } from './Icon'
import { Logo } from './ui'

export function WebShell({ titulo, items, children }: { titulo: string; items: { to: string; label: string; icon: string; end?: boolean }[]; children: ReactNode }) {
  return (
    <div className="web">
      <nav className="web-side" aria-label={titulo}>
        <div className="marca">
          <Logo size={30} />
          <div>
            <div>Barrio Vivo</div>
            <div className="xs" style={{ color: 'var(--gris-claro)', fontFamily: 'var(--texto)', fontWeight: 500 }}>{titulo}</div>
          </div>
        </div>
        {items.map((it) => (
          <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => (isActive ? 'active' : '')}>
            <Icon name={it.icon} size={18} /> {it.label}
          </NavLink>
        ))}
        <Link to="/" style={{ marginTop: 'auto' }}>
          <Icon name="salir" size={18} /> Cambiar perfil
        </Link>
      </nav>
      <main className="web-main">{children}</main>
    </div>
  )
}

export function WebHead({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="web-head">
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {action}
    </div>
  )
}
