import { useState } from 'react'
import { LECCIONES, LEYES } from '../../data/demo'
import { Icon } from '../../components/Icon'
import { Bar, Modal, PageTitle } from '../../components/ui'
import { useMapu } from '../../lib/hooks'
import { useStore } from '../../state/store'

export default function Aprende() {
  const m = useMapu()
  const { s, dispatch, toast } = useStore()
  const [leccion, setLeccion] = useState<string | null>(null)
  const [ley, setLey] = useState<string | null>(LEYES[0].id)
  const hechas = s.leccionesHechas.length
  const actual = LECCIONES.find((l) => l.id === leccion)

  return (
    <>
      <PageTitle title={m.t('Aprende', 'aprender')} sub="Para entender cómo funciona tu barrio" back="/vecino/perfil" />
      <div className="pad stack" style={{ paddingTop: 6 }}>
        <div className="card stack-sm" style={{ background: 'var(--verde-claro)', border: 'none' }}>
          <div className="between">
            <span className="num" style={{ fontSize: 26, color: 'var(--verde)' }}>{hechas}/{LECCIONES.length}</span>
            <span className="small" style={{ flex: 1 }}>
              Lecciones completadas. Termina el curso y gana la insignia <b>Vecino Informado</b>.
            </span>
          </div>
          <Bar value={(hechas / LECCIONES.length) * 100} track="#cfe3d7" />
        </div>

        <div className="seccion"><h2>Educación cívica en video</h2></div>
        <div className="stack-sm">
          {LECCIONES.map((l, i) => {
            const hecha = s.leccionesHechas.includes(l.id)
            return (
              <button key={l.id} className="lista-item" onClick={() => setLeccion(l.id)} style={{ textAlign: 'left', cursor: 'pointer' }}>
                <span className="area-icon" style={{ width: 48, height: 48, background: i % 2 ? 'var(--sol)' : 'var(--verde)', color: i % 2 ? 'var(--tinta)' : '#fff', borderRadius: 14 }}>
                  <Icon name={hecha ? 'check' : 'play'} size={22} />
                </span>
                <span className="grow">
                  <span className="titulo" style={{ display: 'block' }}>{l.titulo}</span>
                  <span className="small muted">{l.minutos} min{hecha ? ' · vista' : ''}</span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="seccion"><h2>Leyes explicadas simple</h2></div>
        {LEYES.map((l) => {
          const open = ley === l.id
          return (
            <article key={l.id} className="card stack-sm">
              <button onClick={() => setLey(open ? null : l.id)} aria-expanded={open} className="lista-item" style={{ border: 'none', padding: 0, background: 'none', textAlign: 'left' }}>
                <span style={{ width: 54, height: 54, borderRadius: 12, background: 'var(--tinta)', color: 'var(--sol)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: 'var(--display)', fontWeight: 800, fontSize: 12.5, lineHeight: 1.05, flexShrink: 0, whiteSpace: 'pre-line' }}>
                  {l.nombre.replace('Ley ', 'Ley\n')}
                </span>
                <span className="grow">
                  <span className="titulo" style={{ display: 'block' }}>{l.titulo}</span>
                  <span className="small muted">{l.nombre}</span>
                </span>
              </button>
              {open && (
                <ul className="small" style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {l.puntos.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}
            </article>
          )
        })}
        <p className="xs muted">Resúmenes de orientación. Para casos concretos consulta el texto de la ley o a Organizaciones Comunitarias de tu municipio.</p>
      </div>

      <Modal open={!!actual} onClose={() => setLeccion(null)} title={actual?.titulo ?? ''}>
        {actual && (
          <div className="modal-body">
            <div style={{ aspectRatio: '16 / 9', background: 'var(--verde)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexDirection: 'column', gap: 8 }}>
              <span style={{ width: 64, height: 64, borderRadius: 32, background: 'var(--sol)', color: 'var(--tinta)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="play" size={28} />
              </span>
              <span className="small">[Video de {actual.minutos} minutos]</span>
            </div>
            <p>{actual.resumen}</p>
            <button
              className="btn btn-block"
              onClick={() => {
                dispatch({ t: 'leccion', id: actual.id })
                setLeccion(null)
                toast(s.leccionesHechas.includes(actual.id) ? 'Lección repasada' : 'Lección completada')
              }}
            >
              Marcar como vista
            </button>
          </div>
        )}
      </Modal>
    </>
  )
}
