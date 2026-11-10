// Piezas compartidas: mapa del barrio y encuesta anual.
import { useState } from 'react'
import { AREA_BY_ID } from '../data/areas'
import { ENCUESTA } from '../data/demo'
import type { Alerta, Necesidad, Punto } from '../data/types'
import { useStore } from '../state/store'
import { Modal } from './ui'

interface Pin {
  id: string
  punto: Punto
  color: string
  label: string
  tipo: 'necesidad' | 'aviso'
}

/** Mapa esquemático de la villa: calles, plaza, sede, canal y multicancha. */
export function BarrioMapa({
  necesidades = [],
  alertas = [],
  onPick,
  marca,
  seleccion,
  onSelect,
}: {
  necesidades?: Necesidad[]
  alertas?: Alerta[]
  onPick?: (p: Punto) => void
  marca?: Punto | null
  seleccion?: string | null
  onSelect?: (id: string | null) => void
}) {
  const pins: Pin[] = [
    ...necesidades.filter((n) => n.punto).map((n) => ({ id: n.id, punto: n.punto!, color: AREA_BY_ID[n.area].color, label: n.titulo, tipo: 'necesidad' as const })),
    ...alertas.filter((a) => a.punto).map((a) => ({ id: a.id, punto: a.punto!, color: '#F2B632', label: a.titulo, tipo: 'aviso' as const })),
  ]
  return (
    <svg
      viewBox="0 0 100 70"
      className="barrio-mapa"
      role="img"
      aria-label={onPick ? 'Mapa del barrio: toca para marcar el lugar' : `Mapa del barrio con ${pins.length} puntos`}
      onClick={(e) => {
        if (!onPick) return
        const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
        onPick({ x: Math.round(((e.clientX - r.left) / r.width) * 100), y: Math.round(((e.clientY - r.top) / r.height) * 70) })
      }}
      style={{ cursor: onPick ? 'crosshair' : undefined }}
    >
      <rect width="100" height="70" fill="#EEF3EC" />
      <path d="M62 70 Q78 52 100 46 L100 54 Q82 58 70 70 Z" fill="#BFD9E6" />
      <rect x="0" y="18" width="100" height="4" fill="#fff" />
      <rect x="0" y="43" width="100" height="4" fill="#fff" />
      <rect x="43" y="0" width="4" height="70" fill="#fff" />
      <rect x="14" y="50" width="17" height="12" rx="2" fill="#CFE3D7" />
      <rect x="52" y="29" width="9" height="9" rx="1.5" fill="#1D6B4E" />
      <rect x="74" y="25" width="16" height="11" rx="1.5" fill="#E7DCC5" />
      <g fontSize="2.6" fill="#56635C" fontFamily="inherit">
        <text x="2" y="16.5">Pasaje Los Robles</text>
        <text x="2" y="41.5">Calle Los Maitenes</text>
        <text x="16" y="65.5">Plaza</text>
        <text x="52" y="27.5">Sede</text>
        <text x="74" y="23.5">Multicancha</text>
        <text x="84" y="66" fill="#3C6F8A">Canal</text>
      </g>
      {pins.map((p) => (
        <g
          key={p.id}
          onClick={(e) => { e.stopPropagation(); onSelect?.(seleccion === p.id ? null : p.id) }}
          style={{ cursor: onSelect ? 'pointer' : undefined }}
        >
          <title>{p.label}</title>
          {p.tipo === 'aviso' ? (
            <rect x={p.punto.x - 2} y={p.punto.y - 2} width="4" height="4" rx="1" transform={`rotate(45 ${p.punto.x} ${p.punto.y})`} fill={p.color} stroke="#1E2B25" strokeWidth={seleccion === p.id ? 0.8 : 0.4} />
          ) : (
            <circle cx={p.punto.x} cy={p.punto.y} r={seleccion === p.id ? 3.2 : 2.6} fill={p.color} stroke="#fff" strokeWidth="0.8" />
          )}
        </g>
      ))}
      {marca && <circle cx={marca.x} cy={marca.y} r="2.8" fill="none" stroke="#C2366B" strokeWidth="1" />}
    </svg>
  )
}

/** Encuesta anual de barrio: cinco preguntas, dos minutos. */
export function EncuestaModal({ open, onClose, vecinoId }: { open: boolean; onClose: () => void; vecinoId: string }) {
  const { dispatch, toast } = useStore()
  const [r, setR] = useState<number[]>(ENCUESTA.preguntas.map(() => 0))
  const listo = r.every((x) => x > 0)
  return (
    <Modal open={open} onClose={onClose} title={ENCUESTA.nombre}>
      <form
        className="modal-body"
        onSubmit={(e) => {
          e.preventDefault()
          if (!listo) return
          dispatch({ t: 'encuesta', vecinoId, r })
          onClose()
          toast('Gracias. Tu respuesta es anónima y ayuda a medir cómo cambia el barrio')
        }}
      >
        <p className="small muted">Las mismas cinco preguntas cada año. Es anónima: la junta y el municipio ven solo promedios.</p>
        {ENCUESTA.preguntas.map((p, i) => (
          <fieldset key={p.id} className="encuesta-p">
            <legend className="small bold">{p.texto}</legend>
            <div className="escala">
              {ENCUESTA.escala.map((e, k) => (
                <button type="button" key={e} aria-pressed={r[i] === k + 1} onClick={() => setR(r.map((x, j) => (j === i ? k + 1 : x)))}>
                  {e}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
        <button className="btn btn-block" disabled={!listo}>{listo ? 'Enviar' : 'Responde las 5 preguntas'}</button>
      </form>
    </Modal>
  )
}

const coma = (n: number) => n.toFixed(1).replace('.', ',')

/** Comparación año a año, pregunta por pregunta. */
export function ResultadoEncuesta({ y2025, y2026 }: { y2025: number[]; y2026: number[] }) {
  return (
    <div className="stack-sm">
      {ENCUESTA.preguntas.map((p, i) => {
        const d = y2026[i] - y2025[i]
        return (
          <div key={p.id} className="encuesta-fila">
            <span className="small">{p.corto}</span>
            <span className="encuesta-barra" aria-hidden="true">
              <i style={{ width: `${(y2025[i] / 5) * 100}%`, background: 'var(--gris-claro)' }} />
              <i style={{ width: `${(y2026[i] / 5) * 100}%`, background: 'var(--verde)' }} />
            </span>
            <span className="small bold" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
              {coma(y2026[i])}{' '}
              <span style={{ color: d > 0.05 ? 'var(--verde)' : d < -0.05 ? 'var(--rojo-tinta)' : 'var(--gris)' }}>
                {d > 0.05 ? '▲' : d < -0.05 ? '▼' : '='}
              </span>
            </span>
          </div>
        )
      })}
      <p className="xs muted">Promedio de 1 a 5. Gris: 2025. Verde: 2026.</p>
    </div>
  )
}

export { coma }
