import { Link } from 'react-router-dom'
import { AREA_BY_ID } from '../../data/areas'
import { Icon } from '../../components/Icon'
import { AreaChip, Chip, PageTitle } from '../../components/ui'
import { esVerificada, fechaCorta, puntosPorActividad } from '../../lib/scoring'
import { useStore } from '../../state/store'
import { JUNTA_DIRECTIVA } from './config'

export default function Actividades() {
  const { s } = useStore()
  const pts = puntosPorActividad(s.actividades)
  const lista = s.actividades.filter((a) => a.juntaId === JUNTA_DIRECTIVA || a.alianzaCon === JUNTA_DIRECTIVA)
  const nombre = (id?: string) => s.juntas.find((j) => j.id === id)?.nombre

  return (
    <>
      <PageTitle title="Actividades" sub={`${lista.length} esta temporada`} />
      <div className="pad stack" style={{ paddingTop: 6 }}>
        <Link to="/directiva/actividades/nueva" className="btn btn-block">
          <Icon name="mas" size={18} /> Registrar actividad
        </Link>
        {lista.map((a) => {
          const p = pts.get(a.id)
          const area = AREA_BY_ID[a.area]
          const propia = a.juntaId === JUNTA_DIRECTIVA
          return (
            <article key={a.id} className="lista-item">
              <span className="marca-area" style={{ background: area.color }} />
              <div className="grow stack-sm" style={{ gap: 4 }}>
                <div className="row" style={{ gap: 6, flexWrap: 'wrap', flex: 'none' }}>
                  <AreaChip area={a.area} solid={false} />
                  {a.estado === 'pendiente' && <Chip tone="sol">En validación</Chip>}
                  {a.estado === 'rechazada' && <Chip tone="rojo">Rechazada</Chip>}
                  {a.estado === 'aprobada' && esVerificada(a) && <Chip>Verificada</Chip>}
                </div>
                <p className="titulo">{a.nombre}</p>
                <p className="xs muted">
                  {fechaCorta(a.fecha)} · {a.hito ? 'hito logrado' : `${a.asistentes} asistentes`}
                  {!propia ? ` · organizó ${nombre(a.juntaId)}` : a.alianzaCon ? ` · con ${nombre(a.alianzaCon)}` : ''}
                </p>
              </div>
              <span className="num" style={{ fontSize: 17, color: propia && p ? 'var(--verde)' : 'var(--gris)' }}>
                {propia && p ? `+${p.total}` : propia ? '—' : 'aliada'}
              </span>
            </article>
          )
        })}
      </div>
    </>
  )
}
