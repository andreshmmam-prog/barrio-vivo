import { useState } from 'react'
import { AREAS, AREA_BY_ID, type AreaId } from '../../data/areas'
import { HOY } from '../../data/demo'
import { Icon } from '../../components/Icon'
import { Modal, PageTitle, Semaforo, cerrada } from '../../components/ui'
import { useStore } from '../../state/store'
import { JUNTA_DIRECTIVA } from './config'

/**
 * Participación desde la directiva:
 * - consolidar necesidades iguales para que los apoyos no se dispersen;
 * - cargar lo recogido en papel en la asamblea (consultas y necesidades).
 */
export default function Participacion() {
  const { s, dispatch, toast } = useStore()
  const necesidades = s.necesidades.filter((n) => n.juntaId === JUNTA_DIRECTIVA && !cerrada(n.estado)).sort((a, b) => b.apoyos - a.apoyos)
  const consultas = s.consultas.filter((c) => c.juntaId === JUNTA_DIRECTIVA && c.cierre >= HOY)
  const [unir, setUnir] = useState<string | null>(null)
  const [destino, setDestino] = useState('')
  const [papel, setPapel] = useState<string | null>(null)
  const [votos, setVotos] = useState<number[]>([])
  const [asamblea, setAsamblea] = useState(false)
  const [form, setForm] = useState({ titulo: '', detalle: '', area: 'mejora' as AreaId, apoyos: 10 })
  const origen = necesidades.find((n) => n.id === unir)
  const consulta = consultas.find((c) => c.id === papel)

  return (
    <>
      <PageTitle title="Participación" sub="Ordena las necesidades y carga lo de la asamblea" />
      <div className="pad stack" style={{ paddingTop: 6 }}>
        <section className="card stack-sm" aria-labelledby="nec-t">
          <h2 id="nec-t" className="card-titulo" style={{ fontSize: 17 }}>Necesidades abiertas</h2>
          <p className="xs muted">Si dos necesidades son la misma, únelas: los apoyos se suman y el municipio recibe una sola, más fuerte.</p>
          {necesidades.map((n) => (
            <div key={n.id} className="stack-sm" style={{ borderTop: '1px solid var(--linea)', paddingTop: 10, gap: 6 }}>
              <div className="between">
                <p className="titulo" style={{ fontSize: 14 }}>{n.titulo}</p>
                <span className="num" style={{ fontSize: 15, whiteSpace: 'nowrap' }}>▲ {n.apoyos}</span>
              </div>
              <div className="between">
                <span className="chips"><span className="chip" style={{ background: AREA_BY_ID[n.area].suave, color: AREA_BY_ID[n.area].tinta }}>{AREA_BY_ID[n.area].corto}</span><Semaforo estado={n.estado} /></span>
                <button className="btn btn-chico btn-borde" onClick={() => { setUnir(n.id); setDestino(necesidades.find((x) => x.id !== n.id)?.id ?? '') }}>Unir con…</button>
              </div>
            </div>
          ))}
        </section>

        <section className="card stack-sm" aria-labelledby="papel-t" style={{ background: 'var(--sol-suave)', borderColor: 'var(--sol)' }}>
          <h2 id="papel-t" className="card-titulo" style={{ fontSize: 17 }}>Lo que llegó en papel</h2>
          <p className="small">Todo lo que se hace en la app tiene su versión en papel. La secretaría o el embajador digital lo carga aquí después de la asamblea.</p>
          {consultas.map((c) => (
            <button key={c.id} className="btn btn-borde btn-chico" style={{ justifyContent: 'flex-start' }} onClick={() => { setPapel(c.id); setVotos(c.opciones.map(() => 0)) }}>
              <Icon name="voto" size={16} /> Cargar respuestas en papel: {c.pregunta}
            </button>
          ))}
          <button className="btn btn-borde btn-chico" style={{ justifyContent: 'flex-start' }} onClick={() => setAsamblea(true)}>
            <Icon name="megafono" size={16} /> Registrar una necesidad planteada en la asamblea
          </button>
        </section>
      </div>

      <Modal open={!!origen} onClose={() => setUnir(null)} title="Unir necesidades iguales">
        {origen && (
          <form
            className="modal-body"
            onSubmit={(e) => {
              e.preventDefault()
              if (!destino) return
              dispatch({ t: 'fusionar', origen: origen.id, destino })
              setUnir(null)
              toast(`Unidas: ${origen.apoyos} apoyos se sumaron`)
            }}
          >
            <p className="small"><b>{origen.titulo}</b> · {origen.apoyos} apoyos</p>
            <label className="field">
              Unir con
              <select value={destino} onChange={(e) => setDestino(e.target.value)}>
                {necesidades.filter((n) => n.id !== origen.id).map((n) => (
                  <option key={n.id} value={n.id}>{n.titulo} ({n.apoyos})</option>
                ))}
              </select>
              <small>Se mantiene la del destino, con su estado. Los apoyos y comentarios se suman.</small>
            </label>
            <button className="btn btn-block">Unir</button>
          </form>
        )}
      </Modal>

      <Modal open={!!consulta} onClose={() => setPapel(null)} title="Respuestas en papel">
        {consulta && (
          <form
            className="modal-body"
            onSubmit={(e) => {
              e.preventDefault()
              dispatch({ t: 'cargarVotos', id: consulta.id, votos })
              setPapel(null)
              toast(`Se sumaron ${votos.reduce((a, b) => a + b, 0)} respuestas en papel`)
            }}
          >
            <p className="small bold">{consulta.pregunta}</p>
            {consulta.opciones.map((o, i) => (
              <label key={i} className="field">
                {o.texto}
                <input type="number" min={0} max={999} value={votos[i] ?? 0} onChange={(e) => setVotos(votos.map((v, k) => (k === i ? Math.max(0, Number(e.target.value) || 0) : v)))} />
              </label>
            ))}
            <p className="xs muted">Adjunta la foto del acta o de las papeletas en Documentos.</p>
            <button className="btn btn-block">Sumar respuestas</button>
          </form>
        )}
      </Modal>

      <Modal open={asamblea} onClose={() => setAsamblea(false)} title="Necesidad de la asamblea">
        <form
          className="modal-body"
          onSubmit={(e) => {
            e.preventDefault()
            if (!form.titulo.trim()) return
            dispatch({
              t: 'nuevaNecesidad',
              n: { id: `na${Date.now()}`, juntaId: JUNTA_DIRECTIVA, titulo: form.titulo.trim(), detalle: form.detalle.trim() || 'Planteada en asamblea', area: form.area, apoyos: form.apoyos, estado: 'enviada', enviada: HOY, comentarios: [], origen: 'asamblea' },
            })
            setForm({ titulo: '', detalle: '', area: 'mejora', apoyos: 10 })
            setAsamblea(false)
            toast('Necesidad registrada desde la asamblea')
          }}
        >
          <label className="field">
            Necesidad
            <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
          </label>
          <label className="field">
            Detalle
            <textarea value={form.detalle} onChange={(e) => setForm({ ...form, detalle: e.target.value })} />
          </label>
          <div className="row">
            <label className="field">
              Área
              <select value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value as AreaId })}>
                {AREAS.map((a) => <option key={a.id} value={a.id}>{a.corto}</option>)}
              </select>
            </label>
            <label className="field">
              Votos a favor
              <input type="number" min={1} value={form.apoyos} onChange={(e) => setForm({ ...form, apoyos: Math.max(1, Number(e.target.value) || 1) })} />
            </label>
          </div>
          <button className="btn btn-block">Registrar</button>
        </form>
      </Modal>
    </>
  )
}
