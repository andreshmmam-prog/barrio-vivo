import { useState } from 'react'
import { AREAS, AREA_BY_ID, type AreaId } from '../../data/areas'
import { TEMPORADA, VECINO_DEMO } from '../../data/demo'
import { Icon } from '../../components/Icon'
import { PageTitle, Tabs } from '../../components/ui'
import { useTabla } from '../../lib/hooks'
import { fechaLarga, miles, ordenar, premios, type ModoRanking } from '../../lib/scoring'

export default function Tabla() {
  const tabla = useTabla()
  const [modo, setModo] = useState<ModoRanking>('porSocio')
  const [area, setArea] = useState<AreaId | 'todas'>('todas')
  const filtro = area === 'todas' ? undefined : area
  const orden = ordenar(tabla, modo, filtro)
  const ps = premios(tabla, modo)
  const valor = (f: (typeof tabla)[number]) =>
    filtro ? (modo === 'porSocio' ? f.porAreaSocio[filtro] : f.porArea[filtro]) : modo === 'porSocio' ? f.porSocio : f.total

  return (
    <>
      <PageTitle title="Tabla general" sub={`${TEMPORADA.nombre} · premiación el ${fechaLarga(TEMPORADA.premiacion)}`} />
      <div className="pad stack" style={{ paddingTop: 6 }}>
        <Tabs
          label="Cómo se cuentan los puntos"
          value={modo}
          onChange={setModo}
          options={[
            { value: 'porSocio', label: 'Cada 10 socios' },
            { value: 'total', label: 'Puntos totales' },
          ]}
        />
        <p className="xs muted">
          {modo === 'porSocio'
            ? 'Se comparan puntos cada 10 socios para que una junta pequeña pueda ganarle a una grande. Así se definen los premios.'
            : 'Suma simple de puntos. Las juntas grandes suelen sumar más.'}
        </p>

        <div className="seccion">
          <h2>Premios Barrio Vivo</h2>
          <span className="xs muted">Va ganando</span>
        </div>
        <div className="podio">
          {ps.map((p) => (
            <button
              key={p.area.id}
              className="premio"
              onClick={() => setArea(area === p.area.id ? 'todas' : p.area.id)}
              aria-pressed={area === p.area.id}
              style={{
                background: p.area.suave,
                color: p.area.tinta,
                border: `2px solid ${area === p.area.id ? p.area.color : 'transparent'}`,
                textAlign: 'left',
              }}
            >
              <span className="between" style={{ width: '100%' }}>
                <span className="area-icon" style={{ width: 34, height: 34, background: p.area.color, borderRadius: 10 }}>
                  <Icon name="trofeo" size={18} />
                </span>
                <span className="xs bold">{p.ganador ? `${p.valor} pts` : ''}</span>
              </span>
              <span className="xs bold" style={{ lineHeight: 1.25 }}>{p.area.premio}</span>
              <span className="ganador" style={{ color: 'var(--tinta)' }}>{p.ganador ? p.ganador.junta.nombre : 'Sin actividades aún'}</span>
              {p.segundo && <span className="xs" style={{ color: 'var(--gris)' }}>Le sigue {p.segundo.junta.nombre}</span>}
            </button>
          ))}
        </div>

        <div className="seccion">
          <h2>{filtro ? `Ranking ${AREA_BY_ID[filtro].corto}` : 'Ranking general'}</h2>
          <label className="xs bold" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Área
            <select
              value={area}
              onChange={(e) => setArea(e.target.value as AreaId | 'todas')}
              style={{ minHeight: 36, borderRadius: 10, border: '1.5px solid var(--linea-2)', padding: '0 8px', background: '#fff' }}
            >
              <option value="todas">Todas</option>
              {AREAS.map((a) => (
                <option key={a.id} value={a.id}>{a.corto}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="card" style={{ padding: '4px 8px' }}>
          <table className="tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>Junta</th>
                <th style={{ textAlign: 'right' }}>{modo === 'porSocio' ? 'Pts/10 socios' : 'Puntos'}</th>
              </tr>
            </thead>
            <tbody>
              {orden.map((f, i) => (
                <tr key={f.junta.id} className={f.junta.id === VECINO_DEMO.juntaId ? 'yo' : ''}>
                  <td className="pos">{i + 1}</td>
                  <td>
                    <div className="bold">{f.junta.nombre}</div>
                    <div className="franja" style={{ height: 6, marginTop: 4, maxWidth: 160 }} aria-hidden="true">
                      {AREAS.map((a) => (
                        <span key={a.id} style={{ flex: Math.max(0.5, f.porArea[a.id]), background: a.color }} />
                      ))}
                    </div>
                    <div className="xs muted" style={{ marginTop: 3 }}>
                      {f.liga} · {f.actividades} actividades
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }} className="num">{miles(valor(f))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="xs muted">Tu junta está marcada en amarillo. La tabla se actualiza con cada actividad verificada.</p>
      </div>
    </>
  )
}
