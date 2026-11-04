import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AREAS, AREA_BY_ID, type AreaId } from '../../data/areas'
import { HOY } from '../../data/demo'
import { Icon } from '../../components/Icon'
import { Modal, PageTitle } from '../../components/ui'
import { REGLAS, puntosActividad } from '../../lib/scoring'
import { useStore } from '../../state/store'
import { JUNTA_DIRECTIVA } from './config'

export default function NuevaActividad() {
  const { s, registrarActividad, toast } = useStore()
  const nav = useNavigate()
  const [nombre, setNombre] = useState('')
  const [area, setArea] = useState<AreaId>('salud')
  const [fecha, setFecha] = useState(HOY)
  const [lugar, setLugar] = useState('Sede vecinal')
  const [asistentes, setAsistentes] = useState(30)
  const [fotos, setFotos] = useState(0)
  const [qr, setQr] = useState(0)
  const [alianza, setAlianza] = useState(false)
  const [aliada, setAliada] = useState('mirador')
  const [hito, setHito] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)

  const otras = s.juntas.filter((j) => j.id !== JUNTA_DIRECTIVA && j.estado === 'activa')
  const primera = !s.actividades.some((a) => a.juntaId === JUNTA_DIRECTIVA && a.area === area && a.estado === 'aprobada')
  const d = useMemo(
    () => puntosActividad({ asistentes, fotos, qr, alianzaCon: alianza ? aliada : undefined, hito }, primera),
    [asistentes, fotos, qr, alianza, aliada, hito, primera],
  )
  const revision = d.total > REGLAS.umbralRevision || !d.verificada

  return (
    <>
      <PageTitle title="Nueva actividad" back="/directiva" />
      <form
        className="pad stack"
        style={{ paddingTop: 6 }}
        onSubmit={(e) => {
          e.preventDefault()
          if (!nombre.trim()) return
          const r = registrarActividad({ juntaId: JUNTA_DIRECTIVA, nombre: nombre.trim(), area, fecha, lugar, asistentes, fotos, qr, alianzaCon: alianza ? aliada : undefined, hito })
          toast(r.pendiente ? `Enviada a validación: +${r.puntos} puntos al aprobarse` : `¡Publicada! +${r.puntos} puntos para tu junta`)
          nav('/directiva/actividades')
        }}
      >
        <label className="field">
          Nombre de la actividad
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Operativo de salud y toma de presión" required />
        </label>

        <fieldset style={{ border: 'none', padding: 0, margin: 0 }} className="stack-sm">
          <legend className="bold small" style={{ marginBottom: 8 }}>Área de acción</legend>
          <div className="area-picker">
            {AREAS.map((a) => (
              <button
                type="button"
                key={a.id}
                aria-pressed={area === a.id}
                onClick={() => setArea(a.id)}
                style={area === a.id ? { background: a.color, color: '#fff', borderColor: a.color } : { color: a.tinta }}
              >
                {area === a.id ? '✓ ' : ''}{a.corto}
              </button>
            ))}
          </div>
          <p className="xs muted">{AREA_BY_ID[area].ejemplos}</p>
        </fieldset>

        {area === 'seguridad' && (
          <label className="check-row">
            <span>
              <span className="bold" style={{ display: 'block' }}>Es un hito logrado</span>
              <span className="xs muted">Alarma instalada, plan aprobado o convenio firmado</span>
            </span>
            <input type="checkbox" checked={hito} onChange={(e) => setHito(e.target.checked)} />
          </label>
        )}

        <div className="row">
          <label className="field">
            Fecha
            <input type="date" value={fecha} max={HOY} onChange={(e) => setFecha(e.target.value)} />
          </label>
          <label className="field">
            Lugar
            <input value={lugar} onChange={(e) => setLugar(e.target.value)} />
          </label>
        </div>

        {!hito && (
          <label className="field">
            Asistentes
            <input type="number" min={1} max={999} value={asistentes} onChange={(e) => setAsistentes(Math.max(1, Number(e.target.value) || 1))} />
          </label>
        )}

        <label className="check-row">
          <span>
            <span className="bold" style={{ display: 'block' }}>En alianza con otra junta</span>
            <span className="xs muted">Suma +{REGLAS.alianza} puntos</span>
          </span>
          <input type="checkbox" checked={alianza} onChange={(e) => setAlianza(e.target.checked)} />
        </label>
        {alianza && (
          <label className="field">
            Junta aliada
            <select value={aliada} onChange={(e) => setAliada(e.target.value)}>
              {otras.map((j) => (
                <option key={j.id} value={j.id}>{j.nombre}</option>
              ))}
            </select>
          </label>
        )}

        <div className="row">
          <label className="btn btn-borde" style={{ minHeight: 88, flexDirection: 'column', borderStyle: 'dashed', fontSize: 14 }}>
            <Icon name="camara" size={24} />
            {fotos > 0 ? `${fotos} fotos` : 'Fotos y video'}
            <input type="file" accept="image/*,video/*" multiple className="sr-only" onChange={(e) => setFotos(e.target.files?.length ?? 0)} />
          </label>
          <button type="button" className="btn btn-tinta" style={{ minHeight: 88, flexDirection: 'column', fontSize: 14 }} onClick={() => setQrOpen(true)}>
            <Icon name="qr" size={24} />
            {qr > 0 ? `${qr} registrados` : 'QR de asistencia'}
          </button>
        </div>
        {fotos === 0 && (
          <button type="button" className="btn btn-borde btn-chico" onClick={() => setFotos(4)}>
            Usar 4 fotos de ejemplo
          </button>
        )}

        <div className="puntos-preview" aria-live="polite">
          <div className="xs" style={{ lineHeight: 1.5 }}>
            Base {REGLAS.base} + participación {d.participacion}
            {d.verificada ? ` · verificada ×${REGLAS.multVerificada.toString().replace('.', ',')}` : ' · sin verificar'}
            {d.alianza ? ` · alianza +${d.alianza}` : ''}
            {d.primeraVez ? ` · primera vez en ${AREA_BY_ID[area].corto} +${d.primeraVez}` : ''}
          </div>
          <div className="num" style={{ fontSize: 28 }}>+{d.total}</div>
        </div>
        {revision && (
          <p className="xs muted">
            {d.verificada ? `Sobre ${REGLAS.umbralRevision} puntos la actividad pasa por validación antes de sumar.` : 'Sin fotos y QR la actividad queda en validación. Verificarla multiplica los puntos.'}
          </p>
        )}
        <button className="btn btn-block">Publicar actividad</button>
      </form>

      <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="Asistencia con QR">
        <div className="modal-body" style={{ alignItems: 'center', textAlign: 'center' }}>
          <QRFalso />
          <p className="small">Los vecinos escanean este código con su celular al llegar. Cada escaneo cuenta como asistencia verificada.</p>
          <button
            className="btn btn-block"
            onClick={() => {
              setQr(Math.max(1, Math.round(asistentes * 0.85)))
              setQrOpen(false)
            }}
          >
            Simular {Math.max(1, Math.round(asistentes * 0.85))} escaneos
          </button>
        </div>
      </Modal>
    </>
  )
}

function QRFalso() {
  // Patrón decorativo para la demo (no es un QR real)
  const cells: [number, number][] = []
  let seed = 7
  for (let y = 0; y < 21; y++)
    for (let x = 0; x < 21; x++) {
      seed = (seed * 9301 + 49297) % 233280
      const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)
      if (!finder && seed / 233280 > 0.5) cells.push([x, y])
    }
  const finder = (x: number, y: number) => (
    <g>
      <rect x={x} y={y} width="7" height="7" fill="#1E2B25" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="#1E2B25" />
    </g>
  )
  return (
    <svg width="200" height="200" viewBox="-1 -1 23 23" role="img" aria-label="Código QR de asistencia de ejemplo" style={{ background: '#fff', borderRadius: 12 }}>
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#1E2B25" />
      ))}
      {finder(0, 0)}
      {finder(14, 0)}
      {finder(0, 14)}
    </svg>
  )
}
