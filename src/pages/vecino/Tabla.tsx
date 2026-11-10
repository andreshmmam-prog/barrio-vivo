import { useState } from 'react'
import { AREAS, AREA_BY_ID, type AreaId } from '../../data/areas'
import { TEMPORADA } from '../../data/demo'
import { Icon } from '../../components/Icon'
import { PageTitle, SelloNivel } from '../../components/ui'
import { useNiveles, useTabla, useVecino } from '../../lib/hooks'
import { NIVELES, REGLAS, fechaLarga, miles, ordenar, pct, premios, rankingJuventud } from '../../lib/scoring'

/**
 * Logros del barrio. Primero los sellos de avance (logros absolutos que toda junta puede alcanzar),
 * después los premios de la temporada y, al final, la tabla por liga.
 */
export default function Tabla() {
  const tabla = useTabla()
  const niveles = useNiveles()
  const v = useVecino()
  const mio = niveles.get(v.juntaId)!
  const fila = tabla.find((f) => f.junta.id === v.juntaId)!
  const juv = rankingJuventud(tabla)
  const lider = juv[0]
  const [area, setArea] = useState<AreaId | 'todas'>('todas')
  const [soloLiga, setSoloLiga] = useState(true)
  const filtro = area === 'todas' ? undefined : area
  const base = soloLiga ? tabla.filter((f) => f.liga === fila.liga) : tabla
  const orden = ordenar(base, 'porSocio', filtro)
  const ps = premios(tabla)
  const valor = (f: (typeof tabla)[number]) => (filtro ? f.porAreaSocio[filtro] : f.porSocio)
  const idx = NIVELES.findIndex((n) => n.nivel === mio.nivel)
  const siguiente = NIVELES.at(idx + 1)

  return (
    <>
      <PageTitle title="Comunidades Vivas" sub={`${TEMPORADA.nombre} · premiación el ${fechaLarga(TEMPORADA.premiacion)}`} />
      <div className="pad stack" style={{ paddingTop: 6 }}>
        <section className="card stack-sm" aria-labelledby="sello-t" style={{ borderColor: 'var(--verde)', borderWidth: 2 }}>
          <div className="lista-item" style={{ border: 'none', padding: 0 }}>
            <SelloNivel nivel={mio.nivel} size={64} />
            <div className="grow">
              <p className="xs bold muted">SELLO DE TU JUNTA</p>
              <h2 id="sello-t" style={{ fontSize: 22 }}>Junta Viva · Nivel {mio.nivel}</h2>
              <p className="small muted">{v.junta.nombre}</p>
            </div>
          </div>
          <ol className="niveles" aria-label="Niveles">
            {NIVELES.map((n, i) => (
              <li key={n.nivel} data-on={i <= idx ? 'true' : 'false'}>
                <span />
                {n.nivel}
              </li>
            ))}
          </ol>
          {siguiente ? (
            <div className="regla" style={{ background: 'var(--verde-claro)', borderColor: '#BFD9CA' }}>
              <p className="small bold">Para llegar a {siguiente.nivel}</p>
              <ul className="small">
                {mio.falta.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>
          ) : (
            <p className="small bold" style={{ color: 'var(--verde)' }}>Tu junta alcanzó el nivel más alto.</p>
          )}
          <p className="xs muted">Los sellos son logros: todas las juntas pueden alcanzarlos sin quitárselos a nadie.</p>
        </section>

        <div className="seccion"><h2>Las juntas de la comuna</h2></div>
        <div className="stack-sm">
          {[...NIVELES].reverse().map((n) => {
            const juntas = tabla.filter((f) => niveles.get(f.junta.id)?.nivel === n.nivel)
            if (!juntas.length) return null
            return (
              <div key={n.nivel} className="lista-item" style={{ alignItems: 'flex-start' }}>
                <SelloNivel nivel={n.nivel} size={40} />
                <div className="grow">
                  <p className="titulo">{n.nivel}</p>
                  <p className="small">{juntas.map((f) => f.junta.nombre).join(' · ')}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="seccion">
          <h2>Premios Barrio Vivo</h2>
          <span className="xs muted">Va ganando</span>
        </div>
        <p className="xs muted">
          Reconocimiento público en la premiación: trofeo y sello para la sede. Los premios nunca son fondos ni recursos municipales.
        </p>
        <div className="podio">
          {ps.map((p) => (
            <button
              key={p.area.id}
              className="premio"
              onClick={() => setArea(area === p.area.id ? 'todas' : p.area.id)}
              aria-pressed={area === p.area.id}
              style={{ background: p.area.suave, color: p.area.tinta, border: `2px solid ${area === p.area.id ? p.area.color : 'transparent'}`, textAlign: 'left' }}
            >
              <span className="area-icon" style={{ width: 34, height: 34, background: p.area.color, borderRadius: 10 }}>
                <Icon name="trofeo" size={18} />
              </span>
              <span className="xs bold" style={{ lineHeight: 1.25 }}>{p.area.premio}</span>
              <span className="ganador" style={{ color: 'var(--tinta)' }}>{p.ganador ? p.ganador.junta.nombre : 'Sin actividades aún'}</span>
            </button>
          ))}
        </div>
        <div className="premio-joven">
          <span className="area-icon" style={{ width: 48, height: 48 }}><Icon name="joven" size={24} /></span>
          <div className="grow">
            <p className="xs bold" style={{ color: 'var(--sol)' }}>PREMIO JUVENTUD BARRIO VIVO</p>
            <p className="bold" style={{ fontSize: 16 }}>{lider ? lider.junta.nombre : 'Sin datos aún'}</p>
            <p className="xs" style={{ color: 'var(--gris-claro)' }}>
              {lider ? `${pct(lider.registrados ? lider.jovenes / lider.registrados : 0)} de sus asistentes tiene entre 14 y 29 años` : ''}
            </p>
          </div>
        </div>

        <div className="seccion">
          <h2>{filtro ? `Tabla ${AREA_BY_ID[filtro].corto}` : 'Tabla de la temporada'}</h2>
          <label className="xs bold" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Área
            <select value={area} onChange={(e) => setArea(e.target.value as AreaId | 'todas')} style={{ minHeight: 36, borderRadius: 10, border: '1.5px solid var(--linea-2)', padding: '0 8px', background: '#fff' }}>
              <option value="todas">Todas</option>
              {AREAS.map((a) => <option key={a.id} value={a.id}>{a.corto}</option>)}
            </select>
          </label>
        </div>
        <div className="filtro-chips" role="group" aria-label="Qué juntas mostrar">
          <button aria-pressed={soloLiga} onClick={() => setSoloLiga(true)}>{fila.liga}</button>
          <button aria-pressed={!soloLiga} onClick={() => setSoloLiga(false)}>Todas las juntas</button>
        </div>
        <div className="card" style={{ padding: '4px 8px' }}>
          <table className="tabla">
            <thead>
              <tr><th>#</th><th>Junta</th><th style={{ textAlign: 'right' }}>Pts/10 socios</th></tr>
            </thead>
            <tbody>
              {orden.map((f, i) => (
                <tr key={f.junta.id} className={f.junta.id === v.juntaId ? 'yo' : ''}>
                  <td className="pos">{i + 1}</td>
                  <td>
                    <div className="bold">{f.junta.nombre}</div>
                    <div className="franja" style={{ height: 6, marginTop: 4, maxWidth: 160 }} aria-hidden="true">
                      {AREAS.map((a) => <span key={a.id} style={{ flex: Math.max(0.5, f.porArea[a.id]), background: a.color }} />)}
                    </div>
                    <div className="xs muted" style={{ marginTop: 3 }}>Nivel {niveles.get(f.junta.id)?.nivel} · {f.actividades} actividades</div>
                  </td>
                  <td style={{ textAlign: 'right' }} className="num">{miles(valor(f))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="xs muted">
          Se compara cada 10 socios y por liga de tamaño. Hacer actividades con otra junta suma +{REGLAS.alianza}: colaborar vale más que competir.
        </p>
      </div>
    </>
  )
}
