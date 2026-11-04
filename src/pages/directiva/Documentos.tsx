import { Icon } from '../../components/Icon'
import { Bar, PageTitle } from '../../components/ui'
import { diasEntre, fechaCorta } from '../../lib/scoring'
import { useStore } from '../../state/store'
import { JUNTA_DIRECTIVA } from './config'
import type { Documento } from '../../data/types'

const ESTADO: Record<Documento['estado'], { label: string; color: string; fondo: string }> = {
  vigente: { label: 'Vigente', color: 'var(--verde)', fondo: 'var(--verde-claro)' },
  al_dia: { label: 'Al día', color: 'var(--verde)', fondo: 'var(--verde-claro)' },
  por_vencer: { label: 'Por vencer', color: 'var(--sol-tinta)', fondo: 'var(--sol-suave)' },
  pendiente: { label: 'Pendiente', color: 'var(--rojo-tinta)', fondo: 'var(--rojo-suave)' },
}

export default function Documentos() {
  const { s, dispatch, toast } = useStore()
  const docs = s.documentos.filter((d) => d.juntaId === JUNTA_DIRECTIVA)
  const ok = docs.filter((d) => d.estado === 'vigente' || d.estado === 'al_dia').length
  const porVencer = docs.find((d) => d.estado === 'por_vencer')

  return (
    <>
      <PageTitle title="Documentos" sub="Todo a mano cuando te lo pidan" />
      <div className="pad stack" style={{ paddingTop: 6 }}>
        <div className="card stack-sm" style={{ background: 'var(--verde)', color: '#fff', border: 'none' }}>
          <div className="between">
            <h2 style={{ fontSize: 18 }}>Carpeta de la junta</h2>
            <span className="num" style={{ fontSize: 22 }}>{ok} de {docs.length}</span>
          </div>
          <Bar value={(ok / docs.length) * 100} color="var(--sol)" track="var(--verde-medio)" />
          <p className="small" style={{ color: '#CDE5DA' }}>
            {ok === docs.length ? 'Carpeta completa: lista para postular a fondos.' : `Faltan ${docs.length - ok} documentos para tener la carpeta al día.`}
          </p>
        </div>

        {porVencer?.vence && (
          <div className="lista-item" style={{ background: 'var(--sol-suave)', borderColor: 'var(--sol)' }}>
            <span style={{ color: 'var(--sol-tinta)' }}><Icon name="alerta" size={22} /></span>
            <p className="small grow">
              <b>{porVencer.tipo} vence en {diasEntre('2026-11-04', porVencer.vence)} días</b> ({fechaCorta(porVencer.vence)}). Te avisaremos de nuevo a los 7 días.
            </p>
          </div>
        )}

        <div className="stack-sm">
          {docs.map((d) => {
            const e = ESTADO[d.estado]
            const necesita = d.estado === 'pendiente' || d.estado === 'por_vencer'
            return (
              <div key={d.id} className="lista-item" style={necesita && d.estado === 'pendiente' ? { borderStyle: 'dashed', borderWidth: 2 } : undefined}>
                <span className="doc-ico" style={{ background: e.fondo, color: e.color }}>
                  <Icon name={d.estado === 'pendiente' ? 'mas' : 'documento'} size={20} />
                </span>
                <div className="grow">
                  <p className="titulo">{d.tipo}</p>
                  <p className="xs muted">{d.archivo ? `${d.detalle} · ${d.archivo}` : d.detalle}</p>
                </div>
                {necesita ? (
                  <label className="btn btn-chico" style={{ fontSize: 13 }}>
                    {d.estado === 'pendiente' ? 'Subir' : 'Renovar'}
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      className="sr-only"
                      onChange={(ev) => {
                        const f = ev.target.files?.[0]
                        if (!f) return
                        dispatch({ t: 'subirDoc', id: d.id, archivo: f.name })
                        toast(`${d.tipo} guardado en la carpeta`)
                      }}
                    />
                  </label>
                ) : (
                  <span className="xs bold" style={{ color: e.color }}>{e.label}</span>
                )}
              </div>
            )
          })}
        </div>

        <button className="btn btn-tinta btn-block" onClick={() => toast('Enlace de solo lectura copiado. Vence en 7 días')}>
          <Icon name="compartir" size={18} /> Compartir carpeta con el municipio
        </button>
        <p className="xs muted" style={{ textAlign: 'center' }}>
          Los documentos son de la junta. Si cambia la directiva, la carpeta pasa completa a la nueva.
        </p>
      </div>
    </>
  )
}
