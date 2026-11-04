import { VECINO_DEMO } from '../../data/demo'
import { Empty, PageTitle } from '../../components/ui'
import { fechaCorta } from '../../lib/scoring'
import { useStore } from '../../state/store'

export default function Avisos() {
  const { s } = useStore()
  const avisos = s.avisos.filter((a) => a.juntaId === VECINO_DEMO.juntaId)
  return (
    <>
      <PageTitle title="Avisos" sub="Comunicados oficiales de tu directiva" back="/vecino" />
      <div className="pad stack" style={{ paddingTop: 6 }}>
        {avisos.length === 0 && <Empty>No hay avisos por ahora.</Empty>}
        {avisos.map((a) => (
          <article key={a.id} className="card stack-sm">
            <p className="xs bold muted">{fechaCorta(a.fecha)}</p>
            <h2 style={{ fontSize: 18 }}>{a.titulo}</h2>
            <p className="small">{a.texto}</p>
          </article>
        ))}
      </div>
    </>
  )
}
