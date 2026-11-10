import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { HOY } from '../../data/demo'
import type { Movimiento } from '../../data/types'
import { Icon } from '../../components/Icon'
import { Bar, Chip, Empty, Modal, PageTitle, Tabs } from '../../components/ui'
import { alertasHora, carpeta, cuentas } from '../../lib/gestion'
import { REGLAS, diasEntre, fechaCorta, fechaLarga, miles } from '../../lib/scoring'
import { useStore } from '../../state/store'
import { JUNTA_DIRECTIVA } from './config'

type Tab = 'fondos' | 'horas' | 'cuentas' | 'sede'

export default function Gestion() {
  const [params] = useSearchParams()
  const [tab, setTab] = useState<Tab>((params.get('tab') as Tab) || 'fondos')
  return (
    <>
      <PageTitle title="Gestión" sub="Fondos, horas de voluntariado, cuentas y la sede" />
      <div className="pad stack" style={{ paddingTop: 6 }}>
        <div className="row">
          <Link to="/directiva/documentos" className="btn btn-borde btn-chico"><Icon name="documento" size={16} /> Documentos</Link>
          <Link to="/directiva/socios" className="btn btn-borde btn-chico"><Icon name="socios" size={16} /> Socios</Link>
        </div>
        <Tabs<Tab> value={tab} onChange={setTab} label="Gestión" options={[{ value: 'fondos', label: 'Fondos' }, { value: 'horas', label: 'Horas' }, { value: 'cuentas', label: 'Cuentas' }, { value: 'sede', label: 'Sede' }]} />
        {tab === 'fondos' && <Fondos />}
        {tab === 'horas' && <Horas />}
        {tab === 'cuentas' && <Cuentas />}
        {tab === 'sede' && <Sede />}
      </div>
    </>
  )
}

const ESTADO_POSTULACION = { postulado: 'Postulado', adjudicado: 'Adjudicado', no_adjudicado: 'No adjudicado' } as const

function Fondos() {
  const { s, dispatch, toast } = useStore()
  const [abierto, setAbierto] = useState<string | null>(null)
  const fondo = s.fondos.find((f) => f.id === abierto)
  const c = fondo ? carpeta(s, JUNTA_DIRECTIVA, fondo) : null
  return (
    <>
      <p className="small">La app arma la carpeta con lo que la junta ya registró y revisa cada requisito contra las bases. La postulación se hace en el portal de cada fondo.</p>
      {s.fondos.filter((f) => f.cierre >= HOY).sort((a, b) => a.cierre.localeCompare(b.cierre)).map((f) => {
        const k = carpeta(s, JUNTA_DIRECTIVA, f)
        const dias = diasEntre(HOY, f.cierre)
        const estado = s.postulaciones[f.id]
        const abre = f.apertura && f.apertura > HOY
        return (
          <article key={f.id} className="card stack-sm">
            <div className="between" style={{ alignItems: 'flex-start', gap: 8 }}>
              <div>
                <p className="titulo">{f.nombre}</p>
                <p className="xs muted">{f.fuente} · {f.monto}</p>
              </div>
              {estado ? (
                <Chip tone={estado === 'no_adjudicado' ? 'gris' : undefined}>{ESTADO_POSTULACION[estado]}</Chip>
              ) : abre ? (
                <Chip tone="gris">Abre {fechaCorta(f.apertura!)}</Chip>
              ) : (
                <Chip tone={dias <= 30 ? 'sol' : 'gris'}>Cierra en {dias} días</Chip>
              )}
            </div>
            {f.fechasEstimadas && <p className="xs" style={{ color: 'var(--sol-tinta)', fontWeight: 700 }}>Fechas estimadas según la convocatoria anterior. Se confirman cuando salgan las bases.</p>}
            <div className="resultado">
              <div className="between xs"><span>Carpeta lista</span><b>{k.listos} de {k.lista.length}</b></div>
              <Bar value={(k.listos / k.lista.length) * 100} height={8} color={k.listos === k.lista.length ? 'var(--verde)' : 'var(--sol)'} />
            </div>
            <p className="xs muted">
              {f.ejemplo ? 'Fondo de ejemplo' : f.bases ? <a href={f.bases} target="_blank" rel="noreferrer">Ver bases</a> : 'Bases cargadas por el municipio'}
              {' · '}revisado el {fechaCorta(f.revisado)} por {f.cargadoPor === 'municipio' ? 'el municipio' : 'Barrio Vivo'}
            </p>
            <button className="btn btn-borde btn-chico" onClick={() => setAbierto(f.id)}>Ver requisitos y carpeta</button>
          </article>
        )
      })}
      <p className="xs muted">Te avisamos 30, 15 y 5 días antes de cada cierre.</p>

      <Modal open={!!fondo} onClose={() => setAbierto(null)} title="Carpeta de postulación">
        {fondo && c && (
          <div className="modal-body">
            <p className="bold">{fondo.nombre}</p>
            <p className="xs muted">
              {fondo.apertura ? `Postulación del ${fechaLarga(fondo.apertura)} al ${fechaLarga(fondo.cierre)}` : `Cierra el ${fechaLarga(fondo.cierre)}`}
              {fondo.fechasEstimadas ? ' (estimado)' : ''} · {fondo.monto}
            </p>
            <div className="regla">
              <p className="xs bold">Quién puede postular</p>
              <p className="small">{fondo.quienes}</p>
            </div>
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
            <p className="xs muted">Revisa siempre las bases oficiales: la carpeta ayuda, pero las bases mandan.</p>
            <div className="row">
              {fondo.bases && <a className="btn btn-borde btn-chico" href={fondo.bases} target="_blank" rel="noreferrer">Bases</a>}
              <button className="btn btn-borde btn-chico" onClick={() => toast('En el piloto la carpeta se descarga en PDF con documentos, fotos y actas')}>
                <Icon name="descargar" size={16} /> Carpeta
              </button>
            </div>
            {fondo.portal && (
              fondo.portal.startsWith('http')
                ? <a className="btn btn-sol btn-block" href={fondo.portal} target="_blank" rel="noreferrer">Ir a postular al portal</a>
                : <p className="small"><b>Dónde se postula:</b> {fondo.portal}</p>
            )}
            <button
              className="btn btn-block"
              disabled={!!s.postulaciones[fondo.id]}
              onClick={() => { dispatch({ t: 'postular', id: fondo.id }); setAbierto(null); toast('Postulación registrada. Cuando haya resultado se verá aquí') }}
            >
              {s.postulaciones[fondo.id] ? ESTADO_POSTULACION[s.postulaciones[fondo.id]] : 'Ya postulamos: registrar'}
            </button>
          </div>
        )}
      </Modal>
    </>
  )
}

function Horas() {
  const { s, dispatch, toast } = useStore()
  const junta = s.juntas.find((j) => j.id === JUNTA_DIRECTIVA)!
  const pend = s.horas.filter((h) => h.juntaId === JUNTA_DIRECTIVA && h.estado === 'por_revisar').sort((a, b) => a.fecha.localeCompare(b.fecha))
  const limpias = pend.filter((h) => alertasHora(h, s.horas).length === 0)
  const aprobadasMes = s.horas.filter((h) => h.juntaId === JUNTA_DIRECTIVA && h.estado === 'aprobada' && h.fecha.slice(0, 7) === HOY.slice(0, 7))
  const ORIGEN = { convocatoria: 'Convocatoria', ayuda: 'Manos Vecinas', actividad: 'Actividad', embajador: 'Embajador digital' }
  return (
    <>
      <p className="small">
        La junta certifica las horas de voluntariado. Antes, la directiva las revisa una vez al mes. Las convocatorias con asistencia por QR quedan aprobadas solas.
      </p>
      <div className="row">
        <div className="card" style={{ padding: 10 }}><p className="xs muted">Por revisar</p><p className="num" style={{ fontSize: 24 }}>{pend.reduce((n, h) => n + h.horas, 0)} h</p></div>
        <div className="card" style={{ padding: 10 }}><p className="xs muted">Aprobadas este mes</p><p className="num" style={{ fontSize: 24 }}>{aprobadasMes.reduce((n, h) => n + h.horas, 0)} h</p></div>
      </div>
      {limpias.length > 0 && (
        <button className="btn btn-block" onClick={() => { dispatch({ t: 'revisarHora', ids: limpias.map((h) => h.id), ok: true }); toast(`${limpias.length} registros aprobados`) }}>
          <Icon name="check" size={18} /> Aprobar los {limpias.length} registros sin alertas
        </button>
      )}
      {pend.length === 0 && <Empty>No hay horas por revisar.</Empty>}
      {pend.map((h) => {
        const al = alertasHora(h, s.horas)
        const bloqueada = h.tramo === '14-17' && !h.autorizacion
        return (
          <article key={h.id} className="card stack-sm" style={al.length ? { borderColor: 'var(--sol)' } : undefined}>
            <div className="between">
              <b className="small">{h.persona}</b>
              <span className="num" style={{ fontSize: 16 }}>{h.horas} h</span>
            </div>
            <p className="xs muted">{ORIGEN[h.origen]} · {fechaCorta(h.fecha)} · {h.detalle}{h.con ? ` · con ${h.con}` : ''}</p>
            {al.map((x) => <p key={x} className="xs" style={{ color: 'var(--sol-tinta)', fontWeight: 700 }}>⚠ {x}</p>)}
            <div className="row">
              <button className="btn btn-borde btn-chico" onClick={() => { dispatch({ t: 'revisarHora', ids: [h.id], ok: false }); toast('Registro rechazado') }}>Rechazar</button>
              {bloqueada ? (
                <button className="btn btn-chico btn-borde" onClick={() => { dispatch({ t: 'autorizarHora', id: h.id }); toast('Autorización del apoderado registrada') }}>Registrar autorización</button>
              ) : (
                <button className="btn btn-chico" onClick={() => { dispatch({ t: 'revisarHora', ids: [h.id], ok: true }); toast('Horas aprobadas') }}>Aprobar</button>
              )}
            </div>
          </article>
        )
      })}
      <p className="xs muted">
        Una ayuda certifica como máximo {REGLAS.topeAyuda} horas. Los certificados los firman {junta.directiva.filter((d) => d.cargo !== 'Tesorería').map((d) => `${d.nombre} (${d.cargo.toLowerCase()})`).join(' y ')}.
      </p>
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
