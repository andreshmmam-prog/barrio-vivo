import { useMemo, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { AREAS, AREA_BY_ID, type AreaId } from '../../data/areas'
import { COMUNA, ENCUESTA, ENCUESTA_SECTOR, HOY, SECTORES, TEMPORADA, VULNERABILIDAD } from '../../data/demo'
import { coma } from '../../components/barrio'
import { CatalogoFondos } from '../../components/fondos'
import type { EstadoNecesidad, RutaNecesidad, SectorId } from '../../data/types'
import { Icon } from '../../components/Icon'
import { Bar, CAMINOS, Chip, Empty, Modal, PasosSemaforo, SEMAFORO, Semaforo, cerrada } from '../../components/ui'
import { WebHead, WebShell } from '../../components/WebShell'
import { useIVC, useTabla } from '../../lib/hooks'
import { diasEntre, fechaCorta, miles, pct } from '../../lib/scoring'
import { CATEGORIAS } from '../vecino/Manos'
import { useStore } from '../../state/store'

const NAV = [
  { to: '/municipio', label: 'Panel territorial', icon: 'mapa', end: true },
  { to: '/municipio/necesidades', label: 'Necesidades', icon: 'megafono' },
  { to: '/municipio/juntas', label: 'Juntas', icon: 'socios' },
  { to: '/municipio/fondos', label: 'Fondos municipales', icon: 'trofeo' },
  { to: '/municipio/informe', label: 'Informe al concejo', icon: 'libro' },
]

export default function MunicipioApp() {
  return (
    <WebShell titulo={`Municipalidad · ${COMUNA}`} items={NAV}>
      <Routes>
        <Route index element={<PanelTerritorial />} />
        <Route path="necesidades" element={<Necesidades />} />
        <Route path="juntas" element={<Juntas />} />
        <Route path="fondos" element={<><WebHead title="Fondos municipales" sub="Carga tus fondos desde las bases y publica los resultados de cada postulación." /><CatalogoFondos modo="municipio" /></>} />
        <Route path="informe" element={<Informe />} />
      </Routes>
    </WebShell>
  )
}

// Escala secuencial verde (de menor a mayor)
const ESCALA = ['#F3F1EA', '#CFE3D7', '#9DC8AE', '#5FA27E', '#1D6B4E']
const nivel = (v: number, cortes: number[]) => cortes.filter((c) => v >= c).length
const colorTexto = (i: number) => (i >= 4 ? '#FFFFFF' : '#1E2B25')

function useDatosMunicipio() {
  const { s } = useStore()
  const ivcs = useIVC()
  return useMemo(() => {
    const activas = s.juntas.filter((j) => j.estado === 'activa')
    const aprobadas = s.actividades.filter((a) => a.estado === 'aprobada')
    const sectorDe = (juntaId: string) => s.juntas.find((j) => j.id === juntaId)?.sector
    const ivcSector = Object.fromEntries(
      SECTORES.map((sec) => {
        const js = activas.filter((j) => j.sector === sec.id)
        const prom = js.length ? Math.round(js.reduce((n, j) => n + (ivcs.get(j.id)?.total ?? 0), 0) / js.length) : 0
        return [sec.id, prom]
      }),
    ) as Record<SectorId, number>
    const cruce = Object.fromEntries(
      SECTORES.map((sec) => [
        sec.id,
        Object.fromEntries(AREAS.map((a) => [a.id, aprobadas.filter((x) => x.area === a.id && sectorDe(x.juntaId) === sec.id).length])),
      ]),
    ) as Record<SectorId, Record<AreaId, number>>
    const brechas = AREAS.map((a) => ({
      area: a,
      pct: Math.round((activas.filter((j) => aprobadas.some((x) => x.juntaId === j.id && x.area === a.id)).length / Math.max(1, activas.length)) * 100),
    })).sort((x, y) => y.pct - x.pct)
    const ivcComunal = Math.round([...ivcs.values()].reduce((n, v) => n + v.total, 0) / Math.max(1, ivcs.size))

    const alertas: { nivel: 'alta' | 'media'; titulo: string; detalle: string }[] = []
    const inactivas = activas.filter((j) => {
      const ult = aprobadas.filter((a) => a.juntaId === j.id).map((a) => a.fecha).sort().at(-1)
      return !ult || diasEntre(ult) > 60
    })
    if (inactivas.length) alertas.push({ nivel: 'alta', titulo: `${inactivas.length} juntas sin actividad en 60 días`, detalle: inactivas.map((j) => j.nombre).join(', ') })
    const sinRespuesta = s.necesidades.filter((n) => n.estado === 'enviada' && diasEntre(n.enviada) > 45)
    if (sinRespuesta.length) alertas.push({ nivel: 'alta', titulo: `${sinRespuesta.length} necesidades sin respuesta hace más de 45 días`, detalle: 'Los vecinos ven los días de espera en su app' })
    const vencen = activas.filter((j) => j.periodoHasta <= '2027-03-31')
    if (vencen.length) alertas.push({ nivel: 'media', titulo: `${vencen.length} directivas vencen antes de abril`, detalle: `Apoyar procesos eleccionarios: ${vencen.map((j) => j.nombre).join(', ')}` })
    const baja = activas.filter((j) => j.sociosActivos / j.socios < 0.3)
    if (baja.length) alertas.push({ nivel: 'media', titulo: `Participación baja en ${baja.length} juntas`, detalle: `Menos del 30% de socios activos: ${baja.map((j) => j.nombre).join(', ')}` })

    const respondidas = s.necesidades.filter((n) => n.actualizada)
    const tiempo = respondidas.length ? Math.round(respondidas.reduce((n, x) => n + diasEntre(x.enviada, x.actualizada), 0) / respondidas.length) : 0
    // Participación juvenil por sector: jóvenes registrados con QR sobre el total registrado
    const juvSector = SECTORES.map((sec) => {
      const xs = aprobadas.filter((x) => sectorDe(x.juntaId) === sec.id)
      const qr = xs.reduce((n, x) => n + x.qr, 0)
      const jov = xs.reduce((n, x) => n + x.jovenes, 0)
      return { sector: sec, share: qr ? jov / qr : 0, jovenes: jov }
    })
    const qrTotal = aprobadas.reduce((n, x) => n + x.qr, 0)
    const juvComunal = qrTotal ? aprobadas.reduce((n, x) => n + x.jovenes, 0) / qrTotal : 0
    const cumplidas = s.ayudas.filter((a) => a.estado === 'cumplida')
    const porCategoria = (Object.keys(CATEGORIAS) as (keyof typeof CATEGORIAS)[])
      .map((c) => ({ categoria: CATEGORIAS[c], n: cumplidas.filter((a) => a.categoria === c).length, mayores: cumplidas.filter((a) => a.categoria === c && a.autorTramo === '60+').length }))
      .sort((a, b) => b.n - a.n)
    const horasAyuda = cumplidas.reduce((n, a) => n + a.horas, 0)
    return { activas, ivcSector, cruce, brechas, ivcComunal, alertas, tiempo, juvSector, juvComunal, cumplidas, porCategoria, horasAyuda }
  }, [s, ivcs])
}

function PanelTerritorial() {
  const { s } = useStore()
  const ivcs = useIVC()
  const d = useDatosMunicipio()
  const [sector, setSector] = useState<SectorId | null>(null)
  const abiertas = s.necesidades.filter((n) => !cerrada(n.estado))
  const top = [...abiertas].sort((a, b) => b.apoyos - a.apoyos).slice(0, 4)
  const masBaja = d.brechas.at(-1)!
  const juntasSector = sector ? d.activas.filter((j) => j.sector === sector) : []

  return (
    <>
      <WebHead
        title="Panel territorial"
        sub={`${TEMPORADA.nombre} · solo datos agregados, nunca datos personales de vecinos`}
        action={<Link to="/municipio/informe" className="btn btn-borde"><Icon name="libro" size={18} /> Informe al concejo</Link>}
      />
      <div className="kpis">
        <div className="kpi"><p className="label">Vitalidad comunal (IVC)</p><p className="num" style={{ color: 'var(--verde)' }}>{d.ivcComunal}</p><p className="sub">de 100</p></div>
        <div className="kpi"><p className="label">Juntas activas</p><p className="num">{d.activas.length}</p><p className="sub">de {s.juntas.length} en la plataforma</p></div>
        <div className="kpi"><p className="label">Necesidades abiertas</p><p className="num">{abiertas.length}</p><p className="sub">{miles(abiertas.reduce((n, x) => n + x.apoyos, 0))} apoyos de vecinos</p></div>
        <div className="kpi"><p className="label">Tiempo de respuesta</p><p className="num">{d.tiempo} días</p><p className="sub">promedio · meta: menos de 30</p></div>
        <div className="kpi"><p className="label">Ayudas entre vecinos</p><p className="num">{d.cumplidas.length}</p><p className="sub">{d.horasAyuda} horas de voluntariado</p></div>
        <div className="kpi"><p className="label">Participación juvenil</p><p className="num">{pct(d.juvComunal)}</p><p className="sub">asistentes de 14 a 29 años</p></div>
        <div className="kpi" style={{ background: 'var(--rojo-suave)', borderColor: '#E8B4AE' }}><p className="label" style={{ color: 'var(--rojo-tinta)' }}>Alertas</p><p className="num" style={{ color: 'var(--rojo-tinta)' }}>{d.alertas.length}</p><p className="sub" style={{ color: 'var(--rojo-tinta)' }}>requieren acción</p></div>
      </div>

      <div className="grid-2">
        <section className="panel">
          <div>
            <h2>Vitalidad por sector</h2>
            <p className="small muted">Mapa esquemático · toca un sector para ver sus juntas</p>
          </div>
          <div className="mapa">
            {(['norte', 'centro', 'rural', 'sur', 'poniente'] as SectorId[]).map((id) => {
              const v = d.ivcSector[id]
              const i = nivel(v, [40, 52, 62, 72])
              const sec = SECTORES.find((x) => x.id === id)!
              return (
                <button
                  key={id}
                  aria-pressed={sector === id}
                  onClick={() => setSector(sector === id ? null : id)}
                  style={{ background: ESCALA[i], color: colorTexto(i), gridRow: id === 'rural' ? 'span 2' : undefined, outline: v < 45 ? '2px solid var(--rojo)' : undefined }}
                >
                  <span className="bold">{sec.nombre}</span>
                  <span>
                    <span className="num" style={{ fontSize: 30, display: 'block' }}>{v}</span>
                    {v < 45 && <span className="xs bold" style={{ color: 'var(--rojo-tinta)' }}>Sector prioritario</span>}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="leyenda">Baja {ESCALA.slice(1).map((c) => <i key={c} style={{ background: c }} />)} Alta</div>
          {sector && (
            <div className="stack-sm">
              {juntasSector.map((j) => (
                <div key={j.id} className="between small" style={{ borderTop: '1px solid var(--linea)', paddingTop: 8 }}>
                  <span><b>{j.nombre}</b> · {j.socios} socios</span>
                  <span>IVC <b>{ivcs.get(j.id)?.total}</b></span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div>
            <h2>Brechas por área</h2>
            <p className="small muted">% de juntas con al menos una actividad en la temporada</p>
          </div>
          <div className="stack-sm">
            {d.brechas.map((b, i) => {
              const ultima = i === d.brechas.length - 1
              return (
                <div key={b.area.id} className="brecha" style={ultima ? { fontWeight: 700, color: b.area.tinta } : undefined}>
                  <span>{b.area.corto}</span>
                  <Bar value={b.pct} color={ultima ? b.area.color : '#9DA8A2'} track="var(--papel-3)" height={14} />
                  <b style={{ textAlign: 'right' }}>{b.pct}%</b>
                </div>
              )
            })}
          </div>
          <div style={{ background: masBaja.area.suave, borderRadius: 12, padding: '10px 12px' }} className="small">
            <b>Lectura:</b> {masBaja.area.corto.toLowerCase()} es la mayor brecha comunal: solo el {masBaja.pct}% de las juntas tuvo actividad.
            Un programa municipal en esta área con las juntas podría cerrarla en una temporada.
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="between" style={{ flexWrap: 'wrap' }}>
          <h2>Actividades por sector y área</h2>
          <span className="small muted">Número de actividades verificadas · los ceros marcados son vacíos de atención</span>
        </div>
        <div className="scroll-x">
          <table className="heat">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Sector</th>
                {AREAS.map((a) => <th key={a.id} scope="col">{a.corto}</th>)}
              </tr>
            </thead>
            <tbody>
              {SECTORES.map((sec) => (
                <tr key={sec.id}>
                  <th scope="row">{sec.nombre}</th>
                  {AREAS.map((a) => {
                    const v = d.cruce[sec.id][a.id]
                    const i = nivel(v, [1, 3, 5, 7])
                    return v === 0 ? (
                      <td key={a.id} style={{ background: '#F3F1EA', border: '2px dashed var(--rojo)', color: 'var(--rojo-tinta)' }}>0</td>
                    ) : (
                      <td key={a.id} style={{ background: ESCALA[i], color: colorTexto(i) }}>{v}</td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid-2">
        <section className="panel">
          <div>
            <h2>Participación juvenil por sector</h2>
            <p className="small muted">% de asistentes de 14 a 29 años, registrados con QR</p>
          </div>
          <div className="stack-sm">
            {d.juvSector.map((x) => (
              <div key={x.sector.id} className="brecha" style={x.share < 0.15 ? { fontWeight: 700, color: 'var(--rojo-tinta)' } : undefined}>
                <span>{x.sector.nombre}</span>
                <Bar value={Math.min(100, (x.share / 0.4) * 100)} color={x.share < 0.15 ? 'var(--rojo)' : '#C9541F'} track="var(--papel-3)" height={14} />
                <b style={{ textAlign: 'right' }}>{pct(x.share)}</b>
              </div>
            ))}
          </div>
          <p className="xs muted">Escala hasta 40%. Meta de renovación: 30%. Información para la Oficina de la Juventud.</p>
        </section>
        <section className="panel">
          <div>
            <h2>Manos Vecinas</h2>
            <p className="small muted">Ayudas cumplidas entre vecinos por tipo · de ellas, pedidas por adultos mayores</p>
          </div>
          <div className="stack-sm">
            {d.porCategoria.map((c) => (
              <div key={c.categoria} className="brecha">
                <span>{c.categoria}</span>
                <Bar value={(c.n / Math.max(1, d.porCategoria[0].n)) * 100} color="#C2366B" track="var(--papel-3)" height={14} />
                <b style={{ textAlign: 'right' }}>{c.n}</b>
              </div>
            ))}
          </div>
          <p className="xs muted">{d.cumplidas.filter((a) => a.autorTramo === '60+').length} de {d.cumplidas.length} ayudas fueron para adultos mayores.</p>
        </section>
      </div>

      <PrioridadTerritorial ivcSector={d.ivcSector} />

      <PercepcionBarrio />

      <div className="grid-2">
        <section className="panel">
          <h2>Alertas tempranas</h2>
          {d.alertas.length === 0 && <Empty>Sin alertas.</Empty>}
          {d.alertas.map((a) => (
            <div key={a.titulo} className="alerta">
              <span className="dot" style={{ background: a.nivel === 'alta' ? 'var(--rojo)' : 'var(--sol)' }} />
              <div className="small"><b>{a.titulo}</b><br /><span className="muted">{a.detalle}</span></div>
            </div>
          ))}
        </section>
        <section className="panel">
          <div className="between"><h2>Lo que más piden los vecinos</h2><Link to="/municipio/necesidades" className="small bold">Responder</Link></div>
          {top.map((n) => (
            <div key={n.id} className="between small" style={{ borderBottom: '1px solid var(--linea)', paddingBottom: 8, alignItems: 'flex-start' }}>
              <span>
                <span className="chip" style={{ background: AREA_BY_ID[n.area].color, color: '#fff', marginRight: 8 }}>{AREA_BY_ID[n.area].corto}</span>
                {n.titulo}
                <span className="xs muted" style={{ display: 'block', marginTop: 4 }}>{s.juntas.find((j) => j.id === n.juntaId)?.nombre} · {diasEntre(n.enviada)} días</span>
              </span>
              <b style={{ whiteSpace: 'nowrap' }}>{n.apoyos} apoyos</b>
            </div>
          ))}
        </section>
      </div>
    </>
  )
}

const ORDEN_ESTADOS: EstadoNecesidad[] = ['enviada', 'recibida', 'evaluacion', 'aprobada', 'licitacion', 'ejecucion', 'respondida', 'resuelta', 'finalizada']

const NIVEL_VULN = { baja: 1, media: 2, alta: 3 } as const

/** Encuesta anual de barrio: el mismo set de preguntas cada año, para medir impacto. */
export function cambioEncuesta() {
  return SECTORES.map((sec) => {
    const r = ENCUESTA_SECTOR[sec.id]
    const prom = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
    return { sector: sec, r, antes: prom(r.y2025), ahora: prom(r.y2026), delta: prom(r.y2026) - prom(r.y2025) }
  })
}

function PercepcionBarrio() {
  const filas = cambioEncuesta()
  const total = filas.reduce((n, f) => n + f.r.respuestas, 0)
  const celda = (d: number) => ({ color: d > 0.05 ? 'var(--verde)' : d < -0.05 ? 'var(--rojo-tinta)' : 'var(--gris)', fontWeight: 700 })
  return (
    <section className="panel">
      <div className="between" style={{ flexWrap: 'wrap' }}>
        <h2>Cómo ven su barrio los vecinos</h2>
        <span className="small muted">{ENCUESTA.nombre} · {total} respuestas anónimas · promedio de 1 a 5 y cambio desde 2025</span>
      </div>
      <div className="scroll-x">
        <table className="tabla" style={{ minWidth: 720 }}>
          <thead><tr><th>Sector</th>{ENCUESTA.preguntas.map((p) => <th key={p.id}>{p.corto}</th>)}<th>Promedio</th></tr></thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.sector.id}>
                <td><b>{f.sector.nombre}</b><div className="xs muted">{f.r.respuestas} respuestas</div></td>
                {f.r.y2026.map((v, i) => {
                  const d = v - f.r.y2025[i]
                  return <td key={i}>{coma(v)} <span className="xs" style={celda(d)}>{d > 0.05 ? `+${coma(d)}` : d < -0.05 ? coma(d) : '='}</span></td>
                })}
                <td><b>{coma(f.ahora)}</b> <span className="xs" style={celda(f.delta)}>{f.delta > 0.05 ? '▲' : f.delta < -0.05 ? '▼' : '='}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="xs muted">Resultados de ejemplo. Cruzado con la vitalidad, permite ver si donde hay más vida comunitaria la gente se siente más segura y confía más.</p>
    </section>
  )
}

/** Mapa esquemático de la comuna con las necesidades abiertas ubicadas por los vecinos. */
function MapaNecesidades() {
  const { s } = useStore()
  const abiertas = s.necesidades.filter((n) => !cerrada(n.estado))
  const sectorDe = (juntaId: string) => s.juntas.find((j) => j.id === juntaId)?.sector
  const hash = (id: string) => [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 997, 7)
  return (
    <section className="panel">
      <div className="between" style={{ flexWrap: 'wrap' }}>
        <h2>Mapa de necesidades abiertas</h2>
        <span className="small muted">Cada punto lo marcó un vecino · el tamaño es el número de apoyos</span>
      </div>
      <div className="mapa mapa-puntos">
        {(['norte', 'centro', 'rural', 'sur', 'poniente'] as SectorId[]).map((id) => {
          const sec = SECTORES.find((x) => x.id === id)!
          const aqui = abiertas.filter((n) => sectorDe(n.juntaId) === id)
          return (
            <div key={id} style={{ gridRow: id === 'rural' ? 'span 2' : undefined }} aria-label={`${sec.nombre}: ${aqui.length} necesidades abiertas`} role="img">
              <span className="bold small">{sec.nombre} · {aqui.length}</span>
              {aqui.map((n) => {
                const p = n.punto ?? { x: 15 + (hash(n.id) % 70), y: 15 + (hash(n.id + 'y') % 45) }
                const tam = Math.round(10 + Math.min(18, n.apoyos / 6))
                return (
                  <i
                    key={n.id}
                    title={`${n.titulo} · ${n.apoyos} apoyos`}
                    style={{ left: `${Math.min(92, Math.max(4, p.x))}%`, top: `${Math.min(88, 34 + (p.y / 70) * 54)}%`, width: tam, height: tam, background: AREA_BY_ID[n.area].color }}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
      <div className="leyenda">
        {[...new Set(abiertas.map((n) => n.area))].map((a) => (
          <span key={a} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 8 }}><i style={{ width: 10, height: 10, borderRadius: 5, background: AREA_BY_ID[a].color }} /> {AREA_BY_ID[a].corto}</span>
        ))}
      </div>
    </section>
  )
}

/** Cruza la vitalidad de cada sector con su vulnerabilidad social: baja vitalidad + alta vulnerabilidad = prioridad. */
export function prioridades(ivcSector: Record<string, number>) {
  return SECTORES.map((sec) => {
    const vit = ivcSector[sec.id] ?? 0
    const vuln = VULNERABILIDAD[sec.id] ?? 'media'
    const puntaje = (100 - vit) * NIVEL_VULN[vuln]
    const nivel: 'alta' | 'media' | 'baja' = vuln === 'alta' && vit < 55 ? 'alta' : (vuln !== 'baja' && vit < 60) || (vuln === 'alta') ? 'media' : 'baja'
    return { sector: sec, vit, vuln, puntaje, nivel }
  }).sort((a, b) => b.puntaje - a.puntaje)
}

function PrioridadTerritorial({ ivcSector }: { ivcSector: Record<string, number> }) {
  const filas = prioridades(ivcSector)
  const color = { alta: 'var(--rojo-tinta)', media: 'var(--sol-tinta)', baja: 'var(--verde)' }
  return (
    <section className="panel">
      <h2>Prioridad territorial</h2>
      <p className="small muted">Cruza la vitalidad comunitaria con la vulnerabilidad social de cada sector. Donde hay poca vida comunitaria y más vulnerabilidad, conviene llegar primero.</p>
      <div className="scroll-x">
        <table className="tabla" style={{ minWidth: 560 }}>
          <thead><tr><th>Sector</th><th>Vitalidad</th><th>Vulnerabilidad</th><th>Prioridad</th></tr></thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.sector.id}>
                <td><b>{f.sector.nombre}</b></td>
                <td><span className="num">{f.vit}</span><span className="xs muted"> / 100</span></td>
                <td style={{ textTransform: 'capitalize' }}>{f.vuln}</td>
                <td><span className="chip" style={{ color: color[f.nivel], background: 'var(--fondo)', border: `1px solid ${color[f.nivel]}`, textTransform: 'capitalize' }}>{f.nivel}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="xs muted">Vulnerabilidad de ejemplo. En el piloto se usa la fuente oficial por unidad vecinal (por ejemplo, Registro Social de Hogares agregado), cargada por el municipio.</p>
    </section>
  )
}

function Necesidades() {
  const { s, dispatch, toast } = useStore()
  const [filtro, setFiltro] = useState<EstadoNecesidad | 'todas'>('todas')
  const [area, setArea] = useState<AreaId | 'todas'>('todas')
  const [editar, setEditar] = useState<string | null>(null)
  const [estado, setEstado] = useState<EstadoNecesidad>('recibida')
  const [respuesta, setRespuesta] = useState('')
  const [ruta, setRuta] = useState<RutaNecesidad>('respuesta')
  const [avance, setAvance] = useState(0)
  const lista = s.necesidades
    .filter((n) => (filtro === 'todas' || n.estado === filtro) && (area === 'todas' || n.area === area))
    .sort((a, b) => b.apoyos - a.apoyos)
  const actual = s.necesidades.find((n) => n.id === editar)
  const nombre = (id: string) => s.juntas.find((j) => j.id === id)?.nombre

  return (
    <>
      <WebHead title="Necesidades de los vecinos" sub="Cada cambio de estado lo ven los vecinos en su app, junto a los días de espera." />
      <MapaNecesidades />
      <div className="pipeline">
        {ORDEN_ESTADOS.filter((e) => s.necesidades.some((n) => n.estado === e) || CAMINOS.respuesta.estados.includes(e)).map((e) => (
          <button
            key={e}
            onClick={() => setFiltro(filtro === e ? 'todas' : e)}
            aria-pressed={filtro === e}
            style={{ background: SEMAFORO[e].fondo, color: SEMAFORO[e].color, border: filtro === e ? `2px solid ${SEMAFORO[e].color}` : '2px solid transparent', borderRadius: 12, padding: 12, textAlign: 'left', flex: '1 1 120px' }}
          >
            <span className="num" style={{ fontSize: 24, display: 'block' }}>{s.necesidades.filter((n) => n.estado === e).length}</span>
            <span className="small bold">{SEMAFORO[e].label}</span>
          </button>
        ))}
      </div>
      <div className="filtros">
        <label className="small bold" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          Área
          <select value={area} onChange={(e) => setArea(e.target.value as AreaId | 'todas')}>
            <option value="todas">Todas</option>
            {AREAS.map((a) => <option key={a.id} value={a.id}>{a.corto}</option>)}
          </select>
        </label>
        {(filtro !== 'todas' || area !== 'todas') && <button className="btn btn-chico btn-borde" onClick={() => { setFiltro('todas'); setArea('todas') }}>Quitar filtros</button>}
      </div>
      <section className="panel">
        {lista.length === 0 && <Empty>No hay necesidades con estos filtros.</Empty>}
        <div className="scroll-x">
          <table className="tabla" style={{ minWidth: 760 }}>
            <thead><tr><th>Necesidad</th><th>Junta</th><th>Apoyos</th><th>Espera</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {lista.map((n) => {
                const dias = diasEntre(n.enviada)
                return (
                  <tr key={n.id}>
                    <td><span className="chip" style={{ background: AREA_BY_ID[n.area].color, color: '#fff', marginRight: 6 }}>{AREA_BY_ID[n.area].corto}</span><b>{n.titulo}</b></td>
                    <td>{nombre(n.juntaId)}</td>
                    <td className="num">{n.apoyos}</td>
                    <td style={{ color: n.estado === 'enviada' && dias > 45 ? 'var(--rojo-tinta)' : undefined, fontWeight: n.estado === 'enviada' && dias > 45 ? 700 : 400 }}>
                      {cerrada(n.estado) ? '—' : `${dias} días`}{n.ruta === 'proyecto' && n.avance !== undefined && !cerrada(n.estado) ? <div className="xs muted">obra {n.avance}%</div> : null}
                    </td>
                    <td><Semaforo estado={n.estado} /></td>
                    <td>
                      <button className="btn btn-chico" onClick={() => {
                        const r = n.ruta ?? 'respuesta'
                        const est = CAMINOS[r].estados
                        const i = est.indexOf(n.estado)
                        setEditar(n.id); setRuta(r); setAvance(n.avance ?? 0)
                        setEstado(cerrada(n.estado) ? n.estado : est[Math.min(est.length - 1, i + 1)] ?? est[1]); setRespuesta(n.respuesta ?? '')
                      }}>
                        Actualizar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={!!actual} onClose={() => setEditar(null)} title="Responder a los vecinos">
        {actual && (
          <form
            className="modal-body"
            onSubmit={(e) => {
              e.preventDefault()
              dispatch({ t: 'estadoNecesidad', id: actual.id, estado, respuesta: respuesta.trim() || undefined, ruta, avance: ruta === 'proyecto' ? (estado === 'finalizada' ? 100 : avance) : undefined })
              setEditar(null)
              toast('Actualizado. Los vecinos ya lo ven en su app')
            }}
          >
            <div>
              <p className="bold">{actual.titulo}</p>
              <p className="small muted">{nombre(actual.juntaId)} · {actual.apoyos} apoyos · enviada el {fechaCorta(actual.enviada)}</p>
            </div>
            <p className="small">{actual.detalle}</p>
            <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="bold small">¿Qué camino sigue?</legend>
              <div className="chips">
                {(['respuesta', 'proyecto'] as RutaNecesidad[]).map((r) => (
                  <button key={r} type="button" className={`btn btn-chico ${ruta === r ? '' : 'btn-borde'}`} aria-pressed={ruta === r}
                    onClick={() => { setRuta(r); if (!CAMINOS[r].estados.includes(estado)) setEstado(CAMINOS[r].estados[1]) }}>
                    {r === 'respuesta' ? 'Respuesta o gestión' : 'Proyecto u obra'}
                  </button>
                ))}
              </div>
              <small>Una obra pasa por aprobación, licitación y ejecución; los vecinos ven el avance.</small>
            </fieldset>
            <label className="field">
              Nuevo estado
              <select value={estado} onChange={(e) => setEstado(e.target.value as EstadoNecesidad)}>
                {CAMINOS[ruta].estados.map((e) => <option key={e} value={e}>{SEMAFORO[e].label}</option>)}
              </select>
            </label>
            <PasosSemaforo estado={estado} ruta={ruta} />
            {ruta === 'proyecto' && ['ejecucion', 'licitacion', 'aprobada'].includes(estado) && (
              <label className="field">
                Avance de la obra: {avance}%
                <input type="range" min={0} max={100} step={5} value={avance} onChange={(e) => setAvance(Number(e.target.value))} />
              </label>
            )}
            <label className="field">
              Respuesta visible para los vecinos
              <textarea value={respuesta} onChange={(e) => setRespuesta(e.target.value)} placeholder="Qué se hará, quién lo hará y cuándo" />
            </label>
            <button className="btn btn-block">Guardar y avisar</button>
          </form>
        )}
      </Modal>
    </>
  )
}

function Juntas() {
  const tabla = useTabla()
  const ivcs = useIVC()
  const { s } = useStore()
  const filas = [...tabla].sort((a, b) => (ivcs.get(b.junta.id)?.total ?? 0) - (ivcs.get(a.junta.id)?.total ?? 0))
  return (
    <>
      <WebHead title="Juntas de la comuna" sub="Ordenadas por Índice de Vitalidad Comunitaria" />
      <section className="panel">
        <div className="scroll-x">
          <table className="tabla" style={{ minWidth: 820 }}>
            <thead>
              <tr><th>Junta</th><th>Sector</th><th>IVC</th><th>Socios activos</th><th>Perfil de áreas</th><th>Área más débil</th><th>Jóvenes</th><th>Documentos</th></tr>
            </thead>
            <tbody>
              {filas.map((f) => {
                const v = ivcs.get(f.junta.id)!
                const debil = AREAS.reduce((m, a) => (f.porArea[a.id] < f.porArea[m.id] ? a : m), AREAS[0])
                const docs = s.documentos.filter((d) => d.juntaId === f.junta.id)
                const ok = docs.filter((d) => d.estado !== 'pendiente').length
                return (
                  <tr key={f.junta.id}>
                    <td><b>{f.junta.nombre}</b><div className="xs muted">{f.junta.unidadVecinal}</div></td>
                    <td style={{ textTransform: 'capitalize' }}>{f.junta.sector}</td>
                    <td>
                      <span className="num" style={{ fontSize: 18, color: v.total < 45 ? 'var(--rojo-tinta)' : 'var(--verde)' }}>{v.total}</span>
                    </td>
                    <td>{f.junta.sociosActivos} de {f.junta.socios}</td>
                    <td style={{ minWidth: 150 }}>
                      <div className="franja" style={{ height: 10 }} aria-label={AREAS.map((a) => `${a.corto} ${f.porArea[a.id]}`).join(', ')} role="img">
                        {AREAS.map((a) => <span key={a.id} style={{ flex: Math.max(0.4, f.porArea[a.id]), background: a.color }} />)}
                      </div>
                    </td>
                    <td><span className="chip" style={{ background: debil.suave, color: debil.tinta }}>{debil.corto}</span></td>
                    <td>{f.registrados ? pct(f.jovenes / f.registrados) : '—'}</td>
                    <td>{ok === docs.length ? <Chip>Al día</Chip> : <Chip tone="sol">{docs.length - ok} pendientes</Chip>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function Informe() {
  const { s } = useStore()
  const d = useDatosMunicipio()
  const tabla = useTabla()
  const aprobadas = s.actividades.filter((a) => a.estado === 'aprobada')
  const asistencia = aprobadas.reduce((n, a) => n + a.asistentes, 0)
  const resueltas = s.necesidades.filter((n) => cerrada(n.estado)).length
  const prio = prioridades(d.ivcSector).filter((p) => p.nivel === 'alta')
  const enc = cambioEncuesta()
  const mejor = [...enc].sort((a, b) => b.delta - a.delta)[0]
  const peor = [...enc].sort((a, b) => a.ahora - b.ahora)[0]
  const masBaja = d.brechas.at(-1)!
  const sectorBajo = SECTORES.reduce((m, x) => (d.ivcSector[x.id] < d.ivcSector[m.id] ? x : m), SECTORES[0])
  const lider = [...tabla].sort((a, b) => b.porSocio - a.porSocio)[0]
  return (
    <>
      <WebHead
        title="Informe al concejo municipal"
        sub={`${TEMPORADA.nombre} · generado el ${fechaCorta(HOY)} con datos agregados`}
        action={<button className="btn" onClick={() => window.print()}><Icon name="descargar" size={18} /> Imprimir o guardar PDF</button>}
      />
      <section className="panel" style={{ maxWidth: 820 }}>
        <h2>Resumen</h2>
        <p>
          Esta temporada, {d.activas.length} juntas de vecinos registraron {aprobadas.length} actividades verificadas con una asistencia
          acumulada de {miles(asistencia)} personas. La vitalidad comunal es de {d.ivcComunal} sobre 100.
        </p>
        <h2 style={{ fontSize: 17 }}>Hallazgos</h2>
        <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li><b>Mayor brecha:</b> {masBaja.area.nombre}. Solo el {masBaja.pct}% de las juntas realizó actividades en esta área.</li>
          <li><b>Sector prioritario:</b> {sectorBajo.nombre}, con vitalidad {d.ivcSector[sectorBajo.id]} sobre 100.</li>
          <li><b>Prioridad territorial:</b> {prio.length ? `${prio.map((p) => p.sector.nombre).join(' y ')}: baja vitalidad comunitaria y alta vulnerabilidad social (datos de vulnerabilidad de ejemplo).` : 'ningún sector combina baja vitalidad y alta vulnerabilidad.'}</li>
          <li><b>Percepción del barrio:</b> el sector {mejor.sector.nombre.toLowerCase()} es el que más mejoró desde 2025 (+{coma(mejor.delta)} sobre 5); el sector {peor.sector.nombre.toLowerCase()} tiene la percepción más baja ({coma(peor.ahora)} sobre 5), sobre todo en seguridad.</li>
          <li><b>Respuesta municipal:</b> {resueltas} necesidades resueltas o finalizadas; el tiempo promedio de respuesta es de {d.tiempo} días.</li>
          <li><b>Juventud:</b> el {pct(d.juvComunal)} de los asistentes tiene entre 14 y 29 años; el sector con menos jóvenes es {[...d.juvSector].sort((a, b) => a.share - b.share)[0].sector.nombre}.</li>
          <li><b>Manos Vecinas:</b> {d.cumplidas.length} ayudas cumplidas entre vecinos, {d.horasAyuda} horas de voluntariado; la más pedida es {d.porCategoria[0].categoria.toLowerCase()}.</li>
          <li><b>Junta destacada:</b> {lider.junta.nombre}, primer lugar de la tabla general por puntos cada 10 socios.</li>
        </ul>
        <h2 style={{ fontSize: 17 }}>Recomendaciones</h2>
        <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li>Priorizar un programa de {masBaja.area.corto.toLowerCase()} en alianza con las juntas durante la próxima temporada.</li>
          <li>Acompañar en terreno a las juntas del sector {sectorBajo.nombre.toLowerCase()}.</li>
          <li>Responder en menos de 30 días las necesidades con más de 50 apoyos.</li>
        </ol>
        <p className="xs muted">Informe elaborado con datos agregados de Barrio Vivo. No incluye datos personales de vecinos.</p>
      </section>
    </>
  )
}
