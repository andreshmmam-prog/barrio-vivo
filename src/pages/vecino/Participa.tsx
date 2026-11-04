import { useState } from 'react'
import { AREAS, AREA_BY_ID, type AreaId } from '../../data/areas'
import { HOY, VECINO_DEMO } from '../../data/demo'
import { Icon } from '../../components/Icon'
import { Bar, Chip, Modal, PageTitle, PasosSemaforo, Semaforo, Tabs } from '../../components/ui'
import { diasEntre, fechaCorta } from '../../lib/scoring'
import { useStore } from '../../state/store'

type Vista = 'votaciones' | 'necesidades' | 'conversa'

export default function Participa() {
  const [vista, setVista] = useState<Vista>('votaciones')
  return (
    <>
      <PageTitle title="Participa" sub="Tu voz en las decisiones del barrio" />
      <div className="pad stack" style={{ paddingTop: 6 }}>
        <Tabs
          label="Secciones"
          value={vista}
          onChange={setVista}
          options={[
            { value: 'votaciones', label: 'Votaciones' },
            { value: 'necesidades', label: 'Necesidades' },
            { value: 'conversa', label: 'Conversa' },
          ]}
        />
        {vista === 'votaciones' && <Votaciones />}
        {vista === 'necesidades' && <Necesidades />}
        {vista === 'conversa' && <Conversa />}
      </div>
    </>
  )
}

function Votaciones() {
  const { s, dispatch, toast } = useStore()
  const junta = s.juntas.find((j) => j.id === VECINO_DEMO.juntaId)!
  const lista = s.votaciones.filter((v) => v.juntaId === junta.id)
  const [eleccion, setEleccion] = useState<Record<string, number>>({})

  return (
    <>
      {lista.map((v) => {
        const total = v.opciones.reduce((s, o) => s + o.votos, 0)
        const pct = Math.round((total / junta.socios) * 100)
        const quorum = pct >= v.quorum
        const abierta = v.cierre >= HOY
        return (
          <section key={v.id} className="card stack" style={{ border: v.miVoto === undefined && abierta ? '2px solid var(--verde)' : undefined }}>
            <div className="between">
              <Chip tone={abierta ? 'sol' : 'gris'}>{abierta ? `Abierta · cierra ${fechaCorta(v.cierre)}` : 'Cerrada'}</Chip>
              <span className="xs muted">Quórum {v.quorum}%</span>
            </div>
            <h3 style={{ fontSize: 19 }}>{v.pregunta}</h3>
            {v.miVoto === undefined && abierta ? (
              <form
                className="stack-sm"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (eleccion[v.id] === undefined) return
                  dispatch({ t: 'votar', id: v.id, opcion: eleccion[v.id] })
                  toast('Tu voto quedó registrado en el acta')
                }}
              >
                <fieldset style={{ border: 'none', padding: 0, margin: 0 }} className="stack-sm">
                  <legend className="sr-only">{v.pregunta}</legend>
                  {v.opciones.map((o, i) => (
                    <label key={i} className="opcion">
                      <input type="radio" name={v.id} checked={eleccion[v.id] === i} onChange={() => setEleccion({ ...eleccion, [v.id]: i })} />
                      {o.texto}
                    </label>
                  ))}
                </fieldset>
                <button className="btn btn-block" disabled={eleccion[v.id] === undefined}>
                  Confirmar mi voto
                </button>
                <p className="xs muted" style={{ textAlign: 'center' }}>
                  Un voto por socio. La consulta orienta a la directiva y queda en el acta de la asamblea.
                </p>
              </form>
            ) : (
              <div className="stack-sm">
                {v.opciones.map((o, i) => {
                  const p = total ? Math.round((o.votos / total) * 100) : 0
                  return (
                    <div key={i} className="resultado">
                      <div className="between">
                        <span style={{ fontWeight: v.miVoto === i ? 700 : 500 }}>
                          {o.texto} {v.miVoto === i && <Chip>Tu voto</Chip>}
                        </span>
                        <b>{p}%</b>
                      </div>
                      <Bar value={p} />
                    </div>
                  )
                })}
              </div>
            )}
            <p className="xs muted">
              {total} de {junta.socios} socios votaron ({pct}%) · {quorum ? 'quórum alcanzado' : `faltan ${Math.ceil((v.quorum / 100) * junta.socios) - total} votos para el quórum`}
            </p>
          </section>
        )
      })}
    </>
  )
}

function Necesidades() {
  const { s, dispatch, toast } = useStore()
  const [abierta, setAbierta] = useState<string | null>(null)
  const [nueva, setNueva] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [detalle, setDetalle] = useState('')
  const [area, setArea] = useState<AreaId>('mejora')
  const lista = s.necesidades.filter((n) => n.juntaId === VECINO_DEMO.juntaId).sort((a, b) => b.apoyos - a.apoyos)

  return (
    <>
      <p className="small muted">
        Las necesidades con más apoyo se envían al municipio. Aquí ves en qué va cada una y cuántos días lleva esperando.
      </p>
      {lista.map((n) => {
        const a = AREA_BY_ID[n.area]
        const dias = diasEntre(n.enviada)
        const open = abierta === n.id
        return (
          <article key={n.id} className="card stack-sm">
            <div className="lista-item" style={{ border: 'none', padding: 0 }}>
              <span className="marca-area" style={{ background: a.color }} />
              <button
                className="grow"
                onClick={() => setAbierta(open ? null : n.id)}
                aria-expanded={open}
                style={{ background: 'none', border: 'none', textAlign: 'left', padding: 0 }}
              >
                <span className="titulo" style={{ display: 'block' }}>{n.titulo}</span>
                <span className="small muted">{a.corto} · {n.estado === 'resuelta' ? 'resuelta' : `${dias} días esperando`}</span>
              </button>
              <button
                className="apoyo"
                aria-pressed={!!n.apoyada}
                aria-label={`Apoyar necesidad, ${n.apoyos} apoyos`}
                onClick={() => dispatch({ t: 'apoyar', id: n.id })}
              >
                ▲ {n.apoyos}
                <small>{n.apoyada ? 'Apoyas' : 'Apoyar'}</small>
              </button>
            </div>
            <div className="between">
              <Semaforo estado={n.estado} />
              <span className="xs muted">Enviada el {fechaCorta(n.enviada)}</span>
            </div>
            <PasosSemaforo estado={n.estado} />
            {open && (
              <div className="stack-sm" style={{ paddingTop: 4 }}>
                <p className="small">{n.detalle}</p>
                {n.respuesta ? (
                  <div style={{ background: 'var(--papel-3)', borderRadius: 12, padding: '10px 12px' }}>
                    <p className="xs bold muted">Respuesta del municipio · {n.actualizada && fechaCorta(n.actualizada)}</p>
                    <p className="small">{n.respuesta}</p>
                  </div>
                ) : (
                  <p className="xs muted">El municipio aún no responde.</p>
                )}
              </div>
            )}
          </article>
        )
      })}
      <button className="btn btn-punteado btn-block" onClick={() => setNueva(true)}>
        <Icon name="mas" size={18} /> Plantear una necesidad del barrio
      </button>

      <Modal open={nueva} onClose={() => setNueva(false)} title="Nueva necesidad">
        <form
          className="modal-body"
          onSubmit={(e) => {
            e.preventDefault()
            if (!titulo.trim()) return
            dispatch({
              t: 'nuevaNecesidad',
              n: { id: `nn${Date.now()}`, juntaId: VECINO_DEMO.juntaId, titulo: titulo.trim(), detalle: detalle.trim() || 'Sin detalle', area, apoyos: 1, apoyada: true, estado: 'enviada', enviada: HOY },
            })
            setTitulo('')
            setDetalle('')
            setNueva(false)
            toast('Necesidad publicada. Invita a tus vecinos a apoyarla')
          }}
        >
          <label className="field">
            ¿Qué problema ves en el barrio?
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: falta un lomo de toro frente a la escuela" required />
          </label>
          <label className="field">
            Cuéntanos más
            <textarea value={detalle} onChange={(e) => setDetalle(e.target.value)} placeholder="Dónde, desde cuándo, a quién afecta" />
          </label>
          <label className="field">
            Área
            <select value={area} onChange={(e) => setArea(e.target.value as AreaId)}>
              {AREAS.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </label>
          <button className="btn btn-block">Publicar necesidad</button>
        </form>
      </Modal>
    </>
  )
}

function Conversa() {
  const { s, dispatch, toast } = useStore()
  const hilos = s.hilos.filter((h) => h.juntaId === VECINO_DEMO.juntaId)
  const [abierto, setAbierto] = useState<string | null>(hilos[0]?.id ?? null)
  const [texto, setTexto] = useState('')
  const [nuevo, setNuevo] = useState('')
  const autor = VECINO_DEMO.nombre.split(' ')[0] + ' ' + VECINO_DEMO.nombre.split(' ')[1][0] + '.'

  return (
    <>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault()
          if (!nuevo.trim()) return
          const id = `h${Date.now()}`
          dispatch({ t: 'nuevoHilo', h: { id, juntaId: VECINO_DEMO.juntaId, titulo: nuevo.trim(), autor, comentarios: [] } })
          setNuevo('')
          setAbierto(id)
          toast('Conversación publicada')
        }}
      >
        <label className="sr-only" htmlFor="nuevo-hilo">Nueva conversación</label>
        <input
          id="nuevo-hilo"
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          placeholder="Pregunta o propone algo a tus vecinos"
          style={{ minHeight: 48, border: '1.5px solid var(--linea-2)', borderRadius: 12, padding: '0 12px', flex: 1 }}
        />
        <button className="btn" style={{ flex: 'none' }} aria-label="Publicar conversación">
          <Icon name="enviar" size={18} />
        </button>
      </form>
      {hilos.map((h) => {
        const open = abierto === h.id
        return (
          <article key={h.id} className="card stack-sm">
            <button onClick={() => setAbierto(open ? null : h.id)} aria-expanded={open} style={{ background: 'none', border: 'none', textAlign: 'left', padding: 0 }}>
              <span className="bold" style={{ display: 'block', fontSize: 15 }}>{h.titulo}</span>
              <span className="xs muted">{h.autor} · {h.comentarios.length} respuestas</span>
            </button>
            {open && (
              <div className="stack-sm">
                {h.comentarios.map((c, i) => (
                  <div key={i} style={{ background: 'var(--papel-3)', borderRadius: 12, padding: '8px 12px' }}>
                    <p className="xs bold">{c.autor}</p>
                    <p className="small">{c.texto}</p>
                  </div>
                ))}
                <form
                  className="row"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!texto.trim()) return
                    dispatch({ t: 'comentar', hiloId: h.id, autor, texto: texto.trim() })
                    setTexto('')
                  }}
                >
                  <label className="sr-only" htmlFor={`r-${h.id}`}>Responder</label>
                  <input id={`r-${h.id}`} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe una respuesta" style={{ minHeight: 44, border: '1.5px solid var(--linea-2)', borderRadius: 12, padding: '0 12px', flex: 1 }} />
                  <button className="btn btn-chico" style={{ flex: 'none', minHeight: 44 }}>Responder</button>
                </form>
              </div>
            )}
          </article>
        )
      })}
      <p className="xs muted" style={{ textAlign: 'center' }}>Espacio moderado. Trata a tus vecinos con respeto.</p>
    </>
  )
}
