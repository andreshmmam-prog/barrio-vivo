import { useState } from 'react'
import { AREAS, AREA_BY_ID, type AreaId } from '../../data/areas'
import { HOY } from '../../data/demo'
import { Icon } from '../../components/Icon'
import { Comentarios } from '../../components/comunidad'
import { BarrioMapa } from '../../components/barrio'
import type { Punto } from '../../data/types'
import { Bar, Chip, Modal, PageTitle, PasosSemaforo, Semaforo, Tabs, cerrada } from '../../components/ui'
import { useVecino } from '../../lib/hooks'
import { diasEntre, fechaCorta } from '../../lib/scoring'
import { useStore } from '../../state/store'

type Vista = 'consultas' | 'necesidades'

export default function Participa() {
  const [vista, setVista] = useState<Vista>('consultas')
  return (
    <>
      <PageTitle title="Participa" sub="Tu voz en las decisiones del barrio" />
      <div className="pad stack" style={{ paddingTop: 6 }}>
        <Tabs
          label="Secciones"
          value={vista}
          onChange={setVista}
          options={[
            { value: 'consultas', label: 'Consultas' },
            { value: 'necesidades', label: 'Necesidades' },
          ]}
        />
        {vista === 'consultas' ? <Consultas /> : <Necesidades />}
      </div>
    </>
  )
}

function Consultas() {
  const { s, dispatch, toast } = useStore()
  const v = useVecino()
  const junta = v.junta
  const lista = s.consultas.filter((c) => c.juntaId === junta.id)
  const [eleccion, setEleccion] = useState<Record<string, number>>({})

  return (
    <>
      <p className="xs muted">Las consultas orientan a la directiva y quedan en el acta. Las decisiones que exige la ley se toman en asamblea.</p>
      {lista.map((c) => {
        const total = c.opciones.reduce((n, o) => n + o.votos, 0)
        const pctV = Math.round((total / junta.socios) * 100)
        const quorum = pctV >= c.quorum
        const abierta = c.cierre >= HOY
        const miVoto = c.votoDe[v.id]
        return (
          <section key={c.id} className="card stack" style={miVoto === undefined && abierta ? { border: '2px solid var(--verde)' } : undefined}>
            <div className="between">
              <Chip tone={abierta ? 'sol' : 'gris'}>{abierta ? `Abierta · cierra ${fechaCorta(c.cierre)}` : 'Cerrada'}</Chip>
              <span className="xs muted">Quórum {c.quorum}%</span>
            </div>
            <h3 style={{ fontSize: 19 }}>{c.pregunta}</h3>
            {miVoto === undefined && abierta ? (
              <form
                className="stack-sm"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (eleccion[c.id] === undefined) return
                  dispatch({ t: 'votar', id: c.id, opcion: eleccion[c.id], vecinoId: v.id })
                  toast('Tu respuesta quedó registrada')
                }}
              >
                <fieldset style={{ border: 'none', padding: 0, margin: 0 }} className="stack-sm">
                  <legend className="sr-only">{c.pregunta}</legend>
                  {c.opciones.map((o, i) => (
                    <label key={i} className="opcion">
                      <input type="radio" name={c.id} checked={eleccion[c.id] === i} onChange={() => setEleccion({ ...eleccion, [c.id]: i })} />
                      {o.texto}
                    </label>
                  ))}
                </fieldset>
                <button className="btn btn-block" disabled={eleccion[c.id] === undefined}>Responder</button>
              </form>
            ) : (
              <div className="stack-sm">
                {c.opciones.map((o, i) => {
                  const p = total ? Math.round((o.votos / total) * 100) : 0
                  return (
                    <div key={i} className="resultado">
                      <div className="between">
                        <span style={{ fontWeight: miVoto === i ? 700 : 500 }}>
                          {o.texto} {miVoto === i && <Chip>Tu respuesta</Chip>}
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
              {total} de {junta.socios} socios respondieron ({pctV}%) · {quorum ? 'quórum alcanzado' : `faltan ${Math.ceil((c.quorum / 100) * junta.socios) - total} respuestas para el quórum`}
            </p>
          </section>
        )
      })}
    </>
  )
}

function Necesidades() {
  const { s, dispatch, toast } = useStore()
  const v = useVecino()
  const [abierta, setAbierta] = useState<string | null>(null)
  const [nueva, setNueva] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [detalle, setDetalle] = useState('')
  const [area, setArea] = useState<AreaId>('mejora')
  const [punto, setPunto] = useState<Punto | null>(null)
  const [modo, setModo] = useState<'lista' | 'mapa'>('lista')
  const [pin, setPin] = useState<string | null>(null)
  const lista = s.necesidades.filter((n) => n.juntaId === v.juntaId).sort((a, b) => b.apoyos - a.apoyos)
  // Sugerir necesidades parecidas antes de crear una nueva (evita que los apoyos se dispersen)
  const palabras = titulo.toLowerCase().split(/[^a-záéíóúñü]+/).filter((w) => w.length > 3)
  const parecidas = palabras.length
    ? lista.filter((n) => !cerrada(n.estado) && palabras.filter((w) => n.titulo.toLowerCase().includes(w)).length >= Math.min(2, palabras.length)).slice(0, 2)
    : []

  return (
    <>
      <p className="small muted">Las necesidades con más apoyo se envían al municipio. Aquí ves en qué va cada una y cuántos días lleva esperando.</p>
      <div className="chips" role="group" aria-label="Ver como">
        <button className={`btn btn-chico ${modo === 'lista' ? '' : 'btn-borde'}`} aria-pressed={modo === 'lista'} onClick={() => setModo('lista')}>Lista</button>
        <button className={`btn btn-chico ${modo === 'mapa' ? '' : 'btn-borde'}`} aria-pressed={modo === 'mapa'} onClick={() => setModo('mapa')}><Icon name="mapa" size={16} /> Mapa</button>
      </div>
      {modo === 'mapa' && (() => {
        const sel = lista.find((n) => n.id === pin) ?? s.alertas.find((a) => a.id === pin)
        return (
          <div className="card stack-sm">
            <BarrioMapa necesidades={lista.filter((n) => !cerrada(n.estado))} alertas={s.alertas.filter((a) => a.juntaId === v.juntaId)} seleccion={pin} onSelect={setPin} />
            <p className="xs muted">Círculos: necesidades, del color de su área. Rombos amarillos: avisos recientes. Toca uno para verlo.</p>
            {sel && (
              <div className="regla">
                <p className="small bold">{sel.titulo}</p>
                <p className="xs muted">{'apoyos' in sel ? `${sel.apoyos} apoyos · ${AREA_BY_ID[sel.area].corto}` : `Aviso · ${fechaCorta(sel.fecha)}`}</p>
              </div>
            )}
          </div>
        )
      })()}
      {modo === 'lista' && lista.map((n) => {
        const a = AREA_BY_ID[n.area]
        const dias = diasEntre(n.enviada)
        const open = abierta === n.id
        return (
          <article key={n.id} className="card stack-sm">
            <div className="lista-item" style={{ border: 'none', padding: 0 }}>
              <span className="marca-area" style={{ background: a.color }} />
              <button className="grow" onClick={() => setAbierta(open ? null : n.id)} aria-expanded={open} style={{ background: 'none', border: 'none', textAlign: 'left', padding: 0 }}>
                <span className="titulo" style={{ display: 'block' }}>{n.titulo}</span>
                <span className="small muted">{a.corto} · {cerrada(n.estado) ? 'cerrada' : `${dias} días esperando`}{n.origen === 'asamblea' ? ' · desde la asamblea' : ''}</span>
              </button>
              <button className="apoyo" aria-pressed={!!n.apoyada} aria-label={`Apoyar necesidad, ${n.apoyos} apoyos`} onClick={() => dispatch({ t: 'apoyar', id: n.id })}>
                ▲ {n.apoyos}
                <small>{n.apoyada ? 'Apoyas' : 'Apoyar'}</small>
              </button>
            </div>
            <div className="between">
              <Semaforo estado={n.estado} />
              <span className="xs muted">Enviada el {fechaCorta(n.enviada)}</span>
            </div>
            <PasosSemaforo estado={n.estado} ruta={n.ruta} />
            {n.ruta === 'proyecto' && n.avance !== undefined && (n.estado === 'ejecucion' || n.estado === 'finalizada') && (
              <div className="stack-sm" style={{ gap: 6 }}>
                <div className="foto-ph" style={{ height: 92, background: 'var(--papel-3)', color: 'var(--gris)', borderRadius: 12 }}>
                  <Icon name="camara" size={22} /> <span style={{ marginLeft: 6 }}>[Foto de avance de la obra]</span>
                </div>
                <div className="resultado">
                  <div className="between xs"><span>Avance de la obra</span><b>{n.avance}%</b></div>
                  <Bar value={n.avance} height={8} />
                </div>
              </div>
            )}
            {n.fusionadas && n.fusionadas.length > 0 && <p className="xs muted">Incluye {n.fusionadas.length} necesidad igual que la directiva unió a esta.</p>}
            {open ? (
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
                <Comentarios id={n.id} lista={n.comentarios} onEnviar={(texto) => dispatch({ t: 'comentarNecesidad', id: n.id, autor: v.corto, texto })} />
              </div>
            ) : (
              <button className="link-btn" onClick={() => setAbierta(n.id)}>
                <Icon name="comentario" size={16} /> {n.comentarios.length ? `${n.comentarios.length} ${n.comentarios.length === 1 ? 'comentario' : 'comentarios'} · ver detalle` : 'Ver detalle y comentar'}
              </button>
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
              n: { id: `nn${Date.now()}`, juntaId: v.juntaId, titulo: titulo.trim(), detalle: detalle.trim() || 'Sin detalle', area, apoyos: 1, apoyada: true, estado: 'enviada', enviada: HOY, comentarios: [], punto: punto ?? undefined },
            })
            setTitulo('')
            setDetalle('')
            setPunto(null)
            setNueva(false)
            toast('Necesidad publicada. Invita a tus vecinos a apoyarla')
          }}
        >
          <label className="field">
            ¿Qué problema ves en el barrio?
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: falta un lomo de toro frente a la escuela" required />
          </label>
          {parecidas.length > 0 && (
            <div className="regla">
              <p className="small bold">¿Es igual a alguna de estas?</p>
              <p className="xs muted">Si es la misma, apóyala: juntos suman más fuerza.</p>
              {parecidas.map((n) => (
                <div key={n.id} className="between" style={{ marginTop: 8 }}>
                  <span className="small">{n.titulo} · {n.apoyos} apoyos</span>
                  <button
                    type="button"
                    className="btn btn-chico"
                    onClick={() => {
                      if (!n.apoyada) dispatch({ t: 'apoyar', id: n.id })
                      setTitulo('')
                      setDetalle('')
                      setNueva(false)
                      toast('Sumaste tu apoyo a la necesidad existente')
                    }}
                  >
                    Apoyar esta
                  </button>
                </div>
              ))}
            </div>
          )}
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
          <div className="field">
            <span>¿Dónde? Toca el mapa (opcional)</span>
            <BarrioMapa onPick={setPunto} marca={punto} />
            <small>{punto ? 'Lugar marcado. Toca otro punto para cambiarlo.' : 'Marcar el lugar ayuda al municipio a encontrarlo.'}</small>
          </div>
          <button className="btn btn-block">Publicar necesidad</button>
        </form>
      </Modal>
    </>
  )
}
