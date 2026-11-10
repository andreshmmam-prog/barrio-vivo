import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ENCUESTA, ENCUESTA_JUNTA, ENCUESTA_SECTOR, HOY, RECURSOS, esJoven } from '../../data/demo'
import type { Recuerdo, Reserva } from '../../data/types'
import { Icon } from '../../components/Icon'
import { EncuestaModal, ResultadoEncuesta } from '../../components/barrio'
import { Chip, Empty, Modal, PageTitle, Tabs } from '../../components/ui'
import { cuentas, quorumOk, textoActa } from '../../lib/gestion'
import { useMapu, useVecino } from '../../lib/hooks'
import { fechaCorta, fechaLarga, miles } from '../../lib/scoring'
import { useStore } from '../../state/store'

type Tab = 'asambleas' | 'cuentas' | 'sede' | 'memoria'

export default function MiJunta() {
  const { s } = useStore()
  const v = useVecino()
  const m = useMapu()
  const [tab, setTab] = useState<Tab>('asambleas')
  const [encuesta, setEncuesta] = useState(false)
  const respondio = !!s.encuestas[v.id]
  const res = ENCUESTA_JUNTA[v.junta.id] ?? ENCUESTA_SECTOR[v.junta.sector]

  return (
    <>
      <PageTitle title={m.t('Mi junta', 'comunidad')} sub={`JJVV ${v.junta.nombre} · ${v.junta.unidadVecinal}`} />
      <div className="pad stack" style={{ paddingTop: 6 }}>
        <section className="card stack-sm" aria-labelledby="enc-t">
          <div className="between">
            <h2 id="enc-t" className="card-titulo" style={{ fontSize: 17 }}>Cómo ven el barrio los vecinos</h2>
            <span className="xs muted">{res.respuestas + (respondio ? 1 : 0)} respuestas</span>
          </div>
          <ResultadoEncuesta y2025={res.y2025} y2026={res.y2026} />
          {!respondio && HOY <= ENCUESTA.cierre && (
            <button className="btn btn-sol btn-block" onClick={() => setEncuesta(true)}>
              Responder la {ENCUESTA.nombre.toLowerCase()} · 2 minutos
            </button>
          )}
        </section>

        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          label="Secciones de mi junta"
          options={[
            { value: 'asambleas', label: m.on ? 'Trawün' : 'Asambleas' },
            { value: 'cuentas', label: 'Cuentas' },
            { value: 'sede', label: 'Sede' },
            { value: 'memoria', label: m.on ? 'Kuyfi' : 'Memoria' },
          ]}
        />
        {tab === 'asambleas' && <Asambleas />}
        {tab === 'cuentas' && <Cuentas />}
        {tab === 'sede' && <Sede />}
        {tab === 'memoria' && <Memoria />}
      </div>
      <EncuestaModal open={encuesta} onClose={() => setEncuesta(false)} vecinoId={v.id} />
    </>
  )
}

function Asambleas() {
  const { s, dispatch, toast } = useStore()
  const v = useVecino()
  const [acta, setActa] = useState<string | null>(null)
  const lista = s.asambleas.filter((a) => a.juntaId === v.junta.id)
  const proximas = lista.filter((a) => a.estado !== 'realizada')
  const realizadas = lista.filter((a) => a.estado === 'realizada').reverse()
  const ver = lista.find((a) => a.id === acta)

  return (
    <>
      {proximas.map((a) => {
        const voy = a.vanIds.includes(v.id)
        return (
          <article key={a.id} className="card stack-sm" style={{ borderColor: 'var(--verde)', borderWidth: 2 }}>
            <div className="between">
              <Chip>{a.estado === 'en_curso' ? 'En curso ahora' : `Asamblea ${a.tipo}`}</Chip>
              <span className="xs muted">{a.confirmados} vecinos van</span>
            </div>
            <p className="titulo" style={{ fontSize: 17 }}>{fechaLarga(a.fecha)} · {a.hora}</p>
            <p className="small muted">{a.lugar}</p>
            <p className="small bold">Tabla</p>
            <ol className="small" style={{ margin: 0, paddingLeft: 18 }}>
              {a.tabla.map((t) => <li key={t}>{t}</li>)}
            </ol>
            <button
              className={`btn btn-block ${voy ? 'btn-borde' : ''}`}
              onClick={() => { dispatch({ t: 'irAsamblea', id: a.id, vecinoId: v.id }); if (!voy) toast('Te esperamos. Te recordaremos el día antes') }}
            >
              <Icon name={voy ? 'check' : 'calendario'} size={18} /> {voy ? 'Confirmaste que vas' : 'Voy a ir'}
            </button>
            <p className="xs muted">Se necesitan {a.quorum} socios para tomar acuerdos.</p>
          </article>
        )
      })}
      <div className="seccion"><h2>Actas</h2></div>
      {realizadas.length === 0 && <Empty>Aún no hay actas en la app.</Empty>}
      {realizadas.map((a) => (
        <article key={a.id} className="card stack-sm">
          <div className="between">
            <p className="titulo">Asamblea {a.tipo} · {fechaCorta(a.fecha)}</p>
            <span className="xs muted">{a.asistentes} socios</span>
          </div>
          <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>
            {a.acuerdos.map((x) => <li key={x.texto}>{x.texto} <span className="muted">({x.favor} a favor)</span></li>)}
          </ul>
          <button className="link-btn" onClick={() => setActa(a.id)}><Icon name="documento" size={16} /> Ver acta</button>
        </article>
      ))}
      <Modal open={!!ver} onClose={() => setActa(null)} title="Acta">
        {ver && (
          <div className="modal-body">
            {!quorumOk(ver) && <p className="small" style={{ color: 'var(--rojo-tinta)' }}>Sin quórum: los acuerdos quedaron como propuestas.</p>}
            <pre className="acta">{textoActa(ver, v.junta.nombre, v.junta.directiva)}</pre>
          </div>
        )}
      </Modal>
    </>
  )
}

function Cuentas() {
  const { s } = useStore()
  const v = useVecino()
  const c = cuentas(s, v.junta.id)
  return (
    <>
      <div className="card stack-sm" style={{ background: 'var(--tinta)', color: '#fff', border: 'none' }}>
        <p className="small" style={{ color: 'var(--gris-claro)' }}>Saldo de la junta</p>
        <p className="num" style={{ fontSize: 36, color: 'var(--sol)' }}>${miles(c.saldo)}</p>
        <div className="between small">
          <span>Ingresos <b>${miles(c.ingresos)}</b></span>
          <span>Gastos <b>${miles(c.gastos)}</b></span>
        </div>
      </div>
      <p className="xs muted">Lo publica la tesorería. Cada gasto lleva su boleta o factura; si falta, se marca.</p>
      {c.movs.map((mv) => (
        <div key={mv.id} className="lista-item" style={{ padding: '10px 12px' }}>
          <span className="area-icon" style={{ width: 36, height: 36, borderRadius: 10, background: mv.tipo === 'ingreso' ? 'var(--verde-claro)' : 'var(--sol-suave)', color: mv.tipo === 'ingreso' ? 'var(--verde)' : 'var(--sol-tinta)' }}>
            <Icon name={mv.tipo === 'ingreso' ? 'mas' : 'derecha'} size={16} />
          </span>
          <div className="grow">
            <p className="small bold">{mv.concepto}</p>
            <p className="xs muted">{fechaCorta(mv.fecha)}{mv.tipo === 'gasto' && !mv.respaldo ? ' · falta respaldo' : mv.tipo === 'gasto' ? ' · con boleta' : ''}</p>
          </div>
          <b className="small" style={{ whiteSpace: 'nowrap', color: mv.tipo === 'ingreso' ? 'var(--verde)' : 'var(--tinta)' }}>
            {mv.tipo === 'ingreso' ? '+' : '−'}${miles(mv.monto)}
          </b>
        </div>
      ))}
    </>
  )
}

function Sede() {
  const { s, dispatch, toast } = useStore()
  const v = useVecino()
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ recurso: RECURSOS[0], fecha: '2026-11-22', bloque: 'Tarde' as Reserva['bloque'], motivo: '' })
  const lista = s.reservas.filter((r) => r.juntaId === v.junta.id && r.fecha >= HOY && r.estado !== 'rechazada').sort((a, b) => a.fecha.localeCompare(b.fecha))
  const ocupado = lista.some((r) => r.recurso === f.recurso && r.fecha === f.fecha && r.bloque === f.bloque)

  return (
    <>
      <button className="btn btn-block" onClick={() => setOpen(true)}><Icon name="calendario" size={18} /> Reservar la sede o un bien común</button>
      <p className="xs muted">Salón, toldo, mesas y sillas, amplificación. La directiva confirma.</p>
      {lista.map((r) => (
        <div key={r.id} className="lista-item" style={{ padding: '10px 12px' }}>
          <div className="fecha-mini"><b>{Number(r.fecha.slice(8))}</b><span>{fechaCorta(r.fecha).split(' ')[1]}</span></div>
          <div className="grow">
            <p className="small bold">{r.recurso} · {r.bloque}</p>
            <p className="xs muted">{r.quien === v.corto ? 'Tu reserva' : r.motivo}</p>
          </div>
          {r.estado === 'pendiente' ? <Chip tone="sol">Por confirmar</Chip> : <Chip>Confirmada</Chip>}
        </div>
      ))}
      <Modal open={open} onClose={() => setOpen(false)} title="Reservar">
        <form
          className="modal-body"
          onSubmit={(e) => {
            e.preventDefault()
            if (ocupado || !f.motivo.trim()) return
            dispatch({ t: 'reservar', r: { id: `rs${Date.now()}`, juntaId: v.junta.id, quien: v.corto, estado: 'pendiente', ...f, motivo: f.motivo.trim() } })
            setOpen(false)
            toast('Reserva enviada. La directiva la confirma')
          }}
        >
          <label className="field">Qué necesitas
            <select value={f.recurso} onChange={(e) => setF({ ...f, recurso: e.target.value })}>{RECURSOS.map((r) => <option key={r}>{r}</option>)}</select>
          </label>
          <div className="row">
            <label className="field">Fecha<input type="date" min={HOY} value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} /></label>
            <label className="field">Horario
              <select value={f.bloque} onChange={(e) => setF({ ...f, bloque: e.target.value as Reserva['bloque'] })}>{['Mañana', 'Tarde', 'Noche'].map((b) => <option key={b}>{b}</option>)}</select>
            </label>
          </div>
          <label className="field">Para qué<input value={f.motivo} onChange={(e) => setF({ ...f, motivo: e.target.value })} placeholder="Ej: cumpleaños, taller, reunión" required /></label>
          {ocupado && <p className="small" style={{ color: 'var(--rojo-tinta)' }}>Ese horario ya está tomado. Elige otro.</p>}
          <button className="btn btn-block" disabled={ocupado}>Pedir reserva</button>
        </form>
      </Modal>
    </>
  )
}

const TIPO_RECUERDO: Record<Recuerdo['tipo'], { label: string; icono: string }> = {
  foto: { label: 'Foto', icono: 'camara' },
  relato: { label: 'Relato', icono: 'comentario' },
  entrevista: { label: 'Entrevista', icono: 'joven' },
}

function Memoria() {
  const { s, dispatch, toast } = useStore()
  const v = useVecino()
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ tipo: 'foto' as Recuerdo['tipo'], titulo: '', epoca: '', relato: '' })
  const lista = s.recuerdos.filter((r) => r.juntaId === v.junta.id).sort((a, b) => a.epoca.localeCompare(b.epoca))
  return (
    <>
      <p className="small">La historia de la villa contada por sus vecinos. Fotos antiguas, relatos y entrevistas a quienes la fundaron.</p>
      <button className="btn btn-block" onClick={() => setOpen(true)}><Icon name="mas" size={18} /> Compartir un recuerdo</button>
      {esJoven(v.tramo) && (
        <Link to="/vecino/manos" className="lista-item" style={{ textDecoration: 'none', color: 'inherit', background: 'var(--sol-suave)', borderColor: 'var(--sol)' }}>
          <span className="area-icon" style={{ width: 40, height: 40, background: 'var(--sol)', color: 'var(--tinta)' }}><Icon name="joven" size={20} /></span>
          <div className="grow"><p className="small bold">Entrevista a un vecino mayor</p><p className="xs muted">Propónlo como actividad de Cultura y suma horas</p></div>
          <Icon name="derecha" size={18} />
        </Link>
      )}
      <ol className="linea-tiempo">
        {lista.map((r) => (
          <li key={r.id}>
            <span className="epoca">{r.epoca}</span>
            <article className="card stack-sm">
              {r.tipo === 'foto' && (
                <div className="foto-ph foto-antigua"><Icon name="camara" size={28} stroke={1.5} /></div>
              )}
              <div className="chips"><span className="chip" style={{ background: 'var(--papel-3)' }}><Icon name={TIPO_RECUERDO[r.tipo].icono} size={13} /> {TIPO_RECUERDO[r.tipo].label}</span></div>
              <p className="titulo">{r.titulo}</p>
              <p className="small">{r.relato}</p>
              <p className="xs muted">{r.autor}</p>
            </article>
          </li>
        ))}
      </ol>
      <Modal open={open} onClose={() => setOpen(false)} title="Compartir un recuerdo">
        <form
          className="modal-body"
          onSubmit={(e) => {
            e.preventDefault()
            if (!f.titulo.trim()) return
            dispatch({ t: 'nuevoRecuerdo', r: { id: `r${Date.now()}`, juntaId: v.junta.id, autor: v.corto, fecha: HOY, ...f, titulo: f.titulo.trim(), epoca: f.epoca.trim() || 'Sin fecha', relato: f.relato.trim() } })
            setF({ tipo: 'foto', titulo: '', epoca: '', relato: '' })
            setOpen(false)
            toast('Gracias. Tu recuerdo ya es parte de la memoria del barrio')
          }}
        >
          <div className="chips">
            {(Object.keys(TIPO_RECUERDO) as Recuerdo['tipo'][]).map((t) => (
              <button type="button" key={t} className={`btn btn-chico ${f.tipo === t ? '' : 'btn-borde'}`} aria-pressed={f.tipo === t} onClick={() => setF({ ...f, tipo: t })}>{TIPO_RECUERDO[t].label}</button>
            ))}
          </div>
          {f.tipo === 'foto' && (
            <label className="btn btn-borde" style={{ minHeight: 64, borderStyle: 'dashed' }}>
              <Icon name="camara" size={20} /> Subir foto
              <input type="file" accept="image/*" className="sr-only" />
            </label>
          )}
          <label className="field">Título<input value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} required /></label>
          <label className="field">Año o época<input value={f.epoca} onChange={(e) => setF({ ...f, epoca: e.target.value })} placeholder="Ej: 1990" /></label>
          <label className="field">Cuéntalo<textarea value={f.relato} onChange={(e) => setF({ ...f, relato: e.target.value })} /></label>
          <p className="xs muted">Si aparecen otras personas en la foto, pídeles permiso antes de subirla.</p>
          <button className="btn btn-block">Compartir</button>
        </form>
      </Modal>
    </>
  )
}
