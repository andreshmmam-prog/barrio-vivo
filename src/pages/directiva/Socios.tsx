import { useState } from 'react'
import { SOCIOS, TRAMOS, esJoven } from '../../data/demo'
import type { Cargo } from '../../data/types'
import { Icon } from '../../components/Icon'
import { Chip, Modal, PageTitle } from '../../components/ui'
import { fechaLarga } from '../../lib/scoring'
import { useStore } from '../../state/store'
import { JUNTA_DIRECTIVA } from './config'

export default function Socios() {
  const { s, dispatch, toast } = useStore()
  const junta = s.juntas.find((j) => j.id === JUNTA_DIRECTIVA)!
  const [q, setQ] = useState('')
  const [traspaso, setTraspaso] = useState(false)
  const [nueva, setNueva] = useState<Cargo[]>(junta.directiva)
  const [hasta, setHasta] = useState('2029-03-31')
  const lista = SOCIOS.filter((x) => x.nombre.toLowerCase().includes(q.toLowerCase()))
  const jovenes = SOCIOS.filter((x) => esJoven(x.tramo)).length
  const mayores = SOCIOS.filter((x) => x.tramo === '60+').length

  return (
    <>
      <PageTitle title="Socios" back="/directiva/gestion" sub={`${junta.socios} inscritos · ${junta.sociosActivos} activos esta temporada`} />
      <div className="pad stack" style={{ paddingTop: 6 }}>
        <section className="card stack-sm" aria-labelledby="dir-t">
          <div className="between">
            <h2 id="dir-t" className="card-titulo" style={{ fontSize: 17 }}>Directiva actual</h2>
            <span className="xs muted">hasta {fechaLarga(junta.periodoHasta)}</span>
          </div>
          {junta.directiva.map((c) => (
            <div key={c.cargo} className="between small">
              <span className="muted">{c.cargo}</span>
              <b>{c.nombre}</b>
            </div>
          ))}
          <button className="btn btn-borde btn-chico" onClick={() => { setNueva(junta.directiva); setTraspaso(true) }}>
            <Icon name="llave" size={16} /> Traspasar a nueva directiva
          </button>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
          <div className="card" style={{ padding: 10, background: 'var(--sol-suave)', border: 'none' }}>
            <p className="xs muted">Jóvenes 14 a 29</p>
            <p className="num" style={{ fontSize: 24 }}>{Math.round((jovenes / SOCIOS.length) * 100)}%</p>
          </div>
          <div className="card" style={{ padding: 10 }}>
            <p className="xs muted">Adultos mayores</p>
            <p className="num" style={{ fontSize: 24 }}>{Math.round((mayores / SOCIOS.length) * 100)}%</p>
          </div>
        </div>

        <label className="field">
          <span className="sr-only">Buscar socio</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar socio por nombre" />
        </label>

        <div className="card" style={{ padding: '4px 10px' }}>
          <table className="tabla">
            <thead>
              <tr><th>Socio</th><th style={{ textAlign: 'right' }}>Actividades</th></tr>
            </thead>
            <tbody>
              {lista.map((x) => (
                <tr key={x.nombre}>
                  <td>
                    <div className="bold">{x.nombre}</div>
                    <div className="xs muted">Socio desde {x.desde} · {TRAMOS[x.tramo]}</div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {x.participaciones === 0 ? <Chip tone="rojo">Sin participar</Chip> : <span className="num">{x.participaciones}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="xs muted" style={{ padding: '8px 6px' }}>Mostrando {lista.length} de {junta.socios} socios (datos de ejemplo).</p>
        </div>
        <button className="btn btn-punteado btn-block" onClick={() => toast('Se envió una invitación para inscribirse en la app')}>
          <Icon name="mas" size={18} /> Inscribir nuevo socio
        </button>
      </div>

      <Modal open={traspaso} onClose={() => setTraspaso(false)} title="Traspaso de directiva">
        <form
          className="modal-body"
          onSubmit={(e) => {
            e.preventDefault()
            dispatch({ t: 'traspaso', juntaId: junta.id, directiva: nueva, hasta })
            setTraspaso(false)
            toast('Traspaso listo: la nueva directiva recibe sus accesos y toda la carpeta')
          }}
        >
          <p className="small">
            La información es de la junta, no de las personas. Al confirmar, la nueva directiva recibe los accesos y encuentra documentos,
            socios e historial completos.
          </p>
          {nueva.map((c, i) => (
            <label key={c.cargo} className="field">
              {c.cargo}
              <input value={c.nombre} onChange={(e) => setNueva(nueva.map((x, k) => (k === i ? { ...x, nombre: e.target.value } : x)))} required />
            </label>
          ))}
          <label className="field">
            Periodo hasta
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
            <small>Adjunta el acta de elección en Documentos.</small>
          </label>
          <button className="btn btn-block">Confirmar traspaso</button>
        </form>
      </Modal>
    </>
  )
}
