import { useEffect, useRef, type ReactNode } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { AREA_BY_ID, AREAS, type AreaId } from '../data/areas'
import type { EstadoNecesidad } from '../data/types'
import { Icon } from './Icon'

export function Logo({ size = 40, mono = false }: { size?: number; mono?: boolean }) {
  const dots = mono
    ? ['#F2B632', '#FFFFFF', '#F2B632', '#FFFFFF', '#F2B632', '#FFFFFF', '#F2B632']
    : AREAS.map((a) => a.color)
  const pts = [
    [24, 6], [38.1, 12.8], [41.5, 28], [31.8, 40.2], [16.2, 40.2], [6.5, 28], [9.9, 12.8],
  ]
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4.2" fill={dots[i]} />
      ))}
      <path d="M16 26 L24 18.5 L32 26 L32 33 L16 33 Z" fill={mono ? '#FFFFFF' : '#1D6B4E'} />
      <rect x="22" y="27" width="4" height="6" fill={mono ? '#1D6B4E' : '#F2B632'} />
    </svg>
  )
}

export function AreaIcon({ area, size = 44 }: { area: AreaId; size?: number }) {
  const a = AREA_BY_ID[area]
  return (
    <span className="area-icon" style={{ width: size, height: size, background: a.color }}>
      <Icon name={a.icono} size={Math.round(size * 0.52)} />
    </span>
  )
}

export function AreaChip({ area, solid = true }: { area: AreaId; solid?: boolean }) {
  const a = AREA_BY_ID[area]
  return (
    <span className="chip" style={solid ? { background: a.color, color: '#fff' } : { background: a.suave, color: a.tinta }}>
      {a.corto}
    </span>
  )
}

export function Chip({ children, tone = 'verde' }: { children: ReactNode; tone?: 'verde' | 'sol' | 'gris' | 'rojo' | 'tinta' }) {
  return <span className={`chip chip-${tone}`}>{children}</span>
}

export function Bar({ value, color = 'var(--verde)', track = 'var(--linea)', height = 10 }: { value: number; color?: string; track?: string; height?: number }) {
  return (
    <span className="bar" style={{ background: track, height }}>
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
    </span>
  )
}

export const SEMAFORO: Record<EstadoNecesidad, { label: string; color: string; fondo: string; paso: number }> = {
  enviada: { label: 'Enviada', color: '#8A2018', fondo: '#FBE3E0', paso: 0 },
  recibida: { label: 'Recibida', color: '#6B4700', fondo: '#FFF4D6', paso: 1 },
  evaluacion: { label: 'En evaluación', color: '#6B4700', fondo: '#FFF4D6', paso: 2 },
  respondida: { label: 'Con respuesta', color: '#1D4688', fondo: '#E4ECFA', paso: 3 },
  resuelta: { label: 'Resuelta', color: '#1D6B4E', fondo: '#E8F1EC', paso: 4 },
}

export function Semaforo({ estado }: { estado: EstadoNecesidad }) {
  const s = SEMAFORO[estado]
  return (
    <span className="chip" style={{ background: s.fondo, color: s.color }}>
      <span className="dot" style={{ background: s.color }} />
      {s.label}
    </span>
  )
}

export function PasosSemaforo({ estado }: { estado: EstadoNecesidad }) {
  const paso = SEMAFORO[estado].paso
  const labels = ['Enviada', 'Recibida', 'Evaluación', 'Respuesta', 'Resuelta']
  return (
    <ol className="pasos" aria-label={`Estado: ${SEMAFORO[estado].label}`}>
      {labels.map((l, i) => (
        <li key={l} data-on={i <= paso ? 'true' : 'false'}>
          <span />
          {l}
        </li>
      ))}
    </ol>
  )
}

// ---- Radar de 7 áreas ----------------------------------------------------------------

export function Radar({ values, size = 300, label }: { values: number[]; size?: number; label: string }) {
  const cx = 110, cy = 110, R = 88
  const ang = (i: number) => (-90 + (360 / 7) * i) * (Math.PI / 180)
  const pt = (i: number, r: number) => [cx + Math.cos(ang(i)) * r, cy + Math.sin(ang(i)) * r]
  const poly = (r: (i: number) => number) => AREAS.map((_, i) => pt(i, r(i)).map((n) => n.toFixed(1)).join(',')).join(' ')
  return (
    <svg width="100%" style={{ maxWidth: size }} viewBox="-58 -14 336 244" role="img" aria-label={label}>
      <polygon points={poly(() => R)} fill="var(--papel)" stroke="var(--linea)" />
      <polygon points={poly(() => R / 2)} fill="none" stroke="var(--linea)" />
      {AREAS.map((_, i) => {
        const [x, y] = pt(i, R)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--linea)" />
      })}
      <polygon points={poly((i) => Math.max(0.06, values[i]) * R)} fill="var(--verde)" fillOpacity="0.22" stroke="var(--verde)" strokeWidth="2.5" strokeLinejoin="round" />
      {AREAS.map((a, i) => {
        const [x, y] = pt(i, Math.max(0.06, values[i]) * R)
        return <circle key={a.id} cx={x} cy={y} r="5" fill={a.color} />
      })}
      {AREAS.map((a, i) => {
        const [x, y] = pt(i, R + 16)
        const anchor = Math.abs(x - cx) < 8 ? 'middle' : x > cx ? 'start' : 'end'
        return (
          <text key={a.id} x={x} y={y + 4} textAnchor={anchor} fontSize="12" fontWeight="700" fill={a.tinta} fontFamily="Figtree, sans-serif">
            {a.corto}
          </text>
        )
      })}
    </svg>
  )
}

// ---- Estructura móvil -----------------------------------------------------------------

export interface NavItem {
  to: string
  label: string
  icon: string
  end?: boolean
}

export function BottomNav({ items, label }: { items: NavItem[]; label: string }) {
  return (
    <nav className="bottom-nav" aria-label={label} style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => (isActive ? 'active' : '')}>
          <Icon name={it.icon} size={22} />
          <span>{it.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export function MobileFrame({ children, nav }: { children: ReactNode; nav: ReactNode }) {
  return (
    <div className="mobile-wrap">
      <div className="mobile">
        <div className="mobile-scroll">{children}</div>
        {nav}
      </div>
    </div>
  )
}

export function PageTitle({ title, sub, back }: { title: string; sub?: string; back?: string }) {
  return (
    <header className="page-title">
      {back && (
        <Link to={back} className="icon-btn" aria-label="Volver">
          <Icon name="flecha" size={20} />
        </Link>
      )}
      <div>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
    </header>
  )
}

export function CambiarPerfil({ claro = false }: { claro?: boolean }) {
  return (
    <Link to="/" className={`cambiar ${claro ? 'claro' : ''}`}>
      Cambiar perfil
    </Link>
  )
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog ref={ref} className="modal" onClose={onClose} aria-label={title}>
      <div className="modal-head">
        <h2>{title}</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
          <Icon name="x" size={20} />
        </button>
      </div>
      {children}
    </dialog>
  )
}

export function Tabs<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="empty">{children}</p>
}
