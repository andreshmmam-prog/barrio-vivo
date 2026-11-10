import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AREA_BY_ID } from '../../data/areas'
import { FONDOS, HOY } from '../../data/demo'
import type { Movimiento } from '../../data/types'
import { Icon } from '../../components/Icon'
import { Bar, Chip, Empty, Modal, PageTitle, Tabs } from '../../components/ui'
import { carpeta, cuentas } from '../../lib/gestion'
import { diasEntre, fechaCorta, fechaLarga, miles } from '../../lib/scoring'
import { useStore } from '../../state/store'
import { JUNTA_DIRECTIVA } from './config'

type Tab = 'fondos' | 'cuentas' | 'sede'

export default function Gestion() {
  const [tab, setTab] = useState<Tab>('fondos')
  return (
    <>
      <PageTitle title="Gestión" sub="Fondos, cuentas claras y la sede" />
      <div className="pad stack" style={{ paddingTop: 6 }}>
        <div className="row">
          <Link to="/directiva/documentos" className="btn btn-borde btn-chico"><Icon name="documento" size={16} /> Documentos</Link>
          <Link to="/directiva/socios" className="btn btn-borde btn-chico"><Icon name="socios" size={16} /> Socios</Link>
        </div>
        <Tabs<Tab> value={tab} onChange={setTab} label="Gestión" options={[{ value: 'fondos', label: 'Fondos' }, { value: 'cuentas', label: 'Cuentas' }, { value: 'sede', label: 'Sede' }]} />
        {tab === 'fondos' && <Fondos />}
        {tab === 'cuentas' && <Cuentas />}
        {tab === 'sede' && <Sede />}
      </div>
    </>
  )
}

function Fondos() {
  const { s, dispatch, toast } = useStore()
  const [abierto, setAbierto] = useState<string | null>(null)
  const fondo = FONDOS.find((f) => f.id === abierto)
  const c = fondo ? carpeta(s, JUNTA_DIRECTIVA, fondo) : null
  return (
    <>
      <p className="small">La app arma la carpeta con lo que la junta ya registró: necesidades votadas, actividades con fotos, actas y documentos.</p>
      {FONDOS.filter((f) => f.cierre >= HOY).map((f) => {
        const k = carpeta(s, JUNTA_DIRECTIVA, f)
        const dias = diasEntre(HOY, f.cierre)
        const postulado = s.postulaciones.includes(f.id)
        return (
          <article key={f.id} className="card stack-sm">
            <div className="between" style={{ alignItems: 'flex-start' }}>
              <div>
                <p className="titulo">{f.nombre}</p>
                <p className="xs muted">{f.fuente} · {f.monto}</p>
              </div>
              {postulado ? <Chip>Postulado</Chip> : <Chip tone={dias < 30 ? 'sol' : 'gris'}>Cierra en {dias} días</Chip>}
            </div>
            <div className="chips">
              {f.areas.map((a) => <span key={a} className="chip" style={{ background: AREA_BY_ID[a].suave, color: AREA_BY_ID[a].tinta }}>{AREA_BY_ID[a].corto}</span>)}
            </div>
            <div className="resultado">
              <div className="between xs"><span>Carpeta lista</span><b>{k.listos} de {k.lista.length}</b></div>
              <Bar value={(k.listos / k.lista.length) * 100} height={8} color={k.listos === k.lista.length ? 'var(--verde)' : 'var(--sol)'} />
            </div>
            <button className="btn btn-borde btn-chico" onClick={() => setAbierto(f.id)}>Ver la carpeta</button>
          </article>
        )
      })}
      <p className="xs muted">Fondos de ejemplo. En el piloto se cargan los fondos reales de la comuna y la región.</p>

      <Modal open={!!fondo} onClose={() => setAbierto(null)} title="Carpeta de postulación">
        {fondo && c && (
          <div className="modal-body">
            <p className="bold">{fondo.nombre}</p>
            <p className="xs muted">Cierra el {fechaLarga(fondo.cierre)} · {fondo.monto}</p>
            <ul className="requisitos">
              {c.lista.map((r) => (
                <li key={r.texto} data-ok={r.ok}>
                  <span aria-hidden="true">{r.ok ? '✓' : '!'}</span>
                  <div><b className="small">{r.texto}</b><p className="xs muted">{r.detalle}</p></div>
                </li>
              ))}
            </ul>
            {c.necesidades.length > 0 && (
              <div className="regla">
                <p className="small bold">Respaldo de los vecinos</p>
                {c.necesidades.slice(0, 3).map((n) => <p key={n.id} className="xs">▲ {n.apoyos} · {n.titulo}</p>)}
              </div>
            )}
            <button className="btn btn-borde btn-block" onClick={() => toast('En el piloto la carpeta se descarga en PDF con fotos y actas')}>
              <Icon name="descargar" size={18} /> Descargar carpeta
            </button>
            <button
              className="btn btn-block"
              disabled={s.postulaciones.includes(fondo.id)}
              onClick={() => { dispatch({ t: 'postular', id: fondo.id }); setAbierto(null); toast('Postulación registrada. Te avisaremos el resultado') }}
            >
              {s.postulaciones.includes(fondo.id) ? 'Ya postulaste' : 'Marcar como postulado'}
            </button>
          </div>
        )}
      </Modal>
    </>
  )
}

function Cuentas() {
  const { s, dispatch, toast } = useStore()
  const c = cuentas(s, JUNTA_DIRECTIVA)
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ tipo: 'gasto' as Movimiento['tipo'], concepto: '', monto: 0, respaldo: false })
  return (
    <>
      <div className="card stack-sm" style={{ background: 'var(--tinta)', color: '#fff', border: 'none' }}>
        <p className="small" style={{ color: 'var(--gris-claro)' }}>Saldo</p>
        <p className="num" style={{ fontSize: 34, color: 'var(--sol)' }}>${miles(c.saldo)}</p>
        <div className="between small"><span>Ingresos ${miles(c.ingresos)}</span><span>Gastos ${miles(c.gastos)}</span></div>
      </div>
      {c.sinRespaldo > 0 && (
        <div className="lista-item" style={{ background: 'var(--rojo-suave)', borderColor: 'var(--rojo-suave)' }}>
          <Icon name="alerta" size={20} />
          <span className="small"><b>{c.sinRespaldo} gasto sin boleta.</b> Súbela para que la rendición quede limpia.</span>
        </div>
      )}
      <button className="btn btn-block" onClick={() => setOpen(true)}><Icon name="mas" size={18} /> Registrar ingreso o gasto</button>
      <p className="xs muted">Los socios ven el saldo y cada movimiento en su app. Solo la tesorería puede registrar.</p>
      {c.movs.map((m) => (
        <div key={m.id} className="between small" style={{ borderBottom: '1px solid var(--linea)', paddingBottom: 8 }}>
          <span>{m.concepto}<span className="xs muted" style={{ display: 'block' }}>{fechaCorta(m.fecha)}{m.tipo === 'gasto' ? (m.respaldo ? ' · con boleta' : ' · falta boleta') : ''}</span></span>
          <b style={{ whiteSpace: 'nowrap', color: m.tipo === 'ingreso' ? 'var(--verde)' : undefined }}>{m.tipo === 'ingreso' ? '+' : '−'}${miles(m.monto)}</b>
        </div>
      ))}
      <Modal open={open} onClose={() => setOpen(false)} title="Nuevo movimiento">
        <form
          className="modal-body"
          onSubmit={(e) => {
            e.preventDefault()
            if (!f.concepto.trim() || f.monto <= 0) return
            dispatch({ t: 'nuevoMovimiento', m: { id: `t${Date.now()}`, juntaId: JUNTA_DIRECTIVA, fecha: HOY, ...f, concepto: f.concepto.trim(), respaldo: f.tipo === 'ingreso' || f.respaldo } })
            setF({ tipo: 'gasto', concepto: '', monto: 0, respaldo: false })
            setOpen(false)
            toast('Registrado. Los socios ya lo ven')
          }}
        >
          <div className="chips">
            {(['ingreso', 'gasto'] as const).map((t) => (
              <button type="button" key={t} className={`btn btn-chico ${f.tipo === t ? '' : 'btn-borde'}`} aria-pressed={f.tipo === t} onClick={() => setF({ ...f, tipo: t })}>{t === 'ingreso' ? 'Ingreso' : 'Gasto'}</button>
            ))}
          </div>
          <label className="field">Concepto<input value={f.concepto} onChange={(e) => setF({ ...f, concepto: e.target.value })} required /></label>
          <label className="field">Monto en pesos<input type="number" min={1} value={f.monto || ''} onChange={(e) => setF({ ...f, monto: Math.max(0, Number(e.target.value) || 0) })} required /></label>
          {f.tipo === 'gasto' && (
            <label className="btn btn-borde" style={{ minHeight: 56, borderStyle: 'dashed' }}>
              <Icon name="camara" size={20} /> {f.respaldo ? 'Boleta adjunta' : 'Foto de la boleta o factura'}
              <input type="file" accept="image/*" className="sr-only" onChange={() => setF({ ...f, respaldo: true })} />
            </label>
          )}
          <button className="btn btn-block">Registrar</button>
        </form>
      </Modal>
    </>
  )
}

function Sede() {
  const { s, dispatch, toast } = useStore()
  const lista = s.reservas.filter((r) => r.juntaId === JUNTA_DIRECTIVA && r.fecha >= HOY && r.estado !== 'rechazada').sort((a, b) => a.fecha.localeCompare(b.fecha))
  const pendientes = lista.filter((r) => r.estado === 'pendiente')
  const confirmadas = lista.filter((r) => r.estado === 'confirmada')
  return (
    <>
      <p className="small bold">Por confirmar</p>
      {pendientes.length === 0 && <Empty>No hay reservas pendientes.</Empty>}
      {pendientes.map((r) => (
        <div key={r.id} className="card stack-sm">
          <div className="between"><b className="small">{r.recurso}</b><span className="xs muted">{fechaCorta(r.fecha)} · {r.bloque}</span></div>
          <p className="small">{r.quien} · {r.motivo}</p>
          <div className="row">
            <button className="btn btn-borde btn-chico" onClick={() => { dispatch({ t: 'decidirReserva', id: r.id, ok: false }); toast('Reserva rechazada') }}>Rechazar</button>
            <button className="btn btn-chico" onClick={() => { dispatch({ t: 'decidirReserva', id: r.id, ok: true }); toast('Reserva confirmada. Se le avisa al vecino') }}>Confirmar</button>
          </div>
        </div>
      ))}
      <p className="small bold">Calendario</p>
      {confirmadas.map((r) => (
        <div key={r.id} className="lista-item" style={{ padding: '10px 12px' }}>
          <div className="fecha-mini"><b>{Number(r.fecha.slice(8))}</b><span>{fechaCorta(r.fecha).split(' ')[1]}</span></div>
          <div className="grow"><p className="small bold">{r.recurso} · {r.bloque}</p><p className="xs muted">{r.quien} · {r.motivo}</p></div>
        </div>
      ))}
    </>
  )
}
