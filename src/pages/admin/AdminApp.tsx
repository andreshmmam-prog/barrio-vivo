import { useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { AREAS, AREA_BY_ID } from '../../data/areas'
import { TEMPORADA, HOY } from '../../data/demo'
import type { Junta } from '../../data/types'
import { Icon } from '../../components/Icon'
import { AreaChip, Chip, Empty } from '../../components/ui'
import { WebHead, WebShell } from '../../components/WebShell'
import { useTabla } from '../../lib/hooks'
import { PESOS_IVC, REGLAS, fechaCorta, fechaLarga, miles, pct, premios, puntosActividad, rankingJuventud } from '../../lib/scoring'
import { useStore } from '../../state/store'

const NAV = [
  { to: '/admin', label: 'Resumen', icon: 'panel', end: true },
  { to: '/admin/validar', label: 'Validar actividades', icon: 'check' },
  { to: '/admin/juntas', label: 'Juntas', icon: 'socios' },
  { to: '/admin/premiacion', label: 'Premiación', icon: 'trofeo' },
  { to: '/admin/moderacion', label: 'Moderación', icon: 'escudo' },
  { to: '/admin/reglas', label: 'Reglas de puntaje', icon: 'filtro' },
]

export default function AdminApp() {
  return (
    <WebShell titulo="Administración" items={NAV}>
      <Routes>
        <Route index element={<Resumen />} />
        <Route path="validar" element={<Validar />} />
        <Route path="juntas" element={<Juntas />} />
        <Route path="premiacion" element={<Premiacion />} />
        <Route path="moderacion" element={<Moderacion />} />
        <Route path="reglas" element={<Reglas />} />
      </Routes>
    </WebShell>
  )
}

function Resumen() {
  const { s } = useStore()
  const activas = s.juntas.filter((j) => j.estado === 'activa')
  const vecinos = activas.reduce((n, j) => n + j.sociosActivos, 0)
  const pendientes = s.actividades.filter((a) => a.estado === 'pendiente').length
  const reportes = s.reportes.filter((r) => !r.resuelto).length + s.emprendedores.filter((p) => p.estado === 'revision').length
  const aprobadas = s.actividades.filter((a) => a.estado === 'aprobada').length
  return (
    <>
      <WebHead title="Resumen de la plataforma" sub={`${TEMPORADA.nombre} · datos de ejemplo`} />
      <div className="kpis">
        <div className="kpi"><p className="label">Juntas activas</p><p className="num">{activas.length}</p><p className="sub">de {s.juntas.length} inscritas</p></div>
        <div className="kpi"><p className="label">Vecinos activos</p><p className="num">{miles(vecinos)}</p><p className="sub">participaron esta temporada</p></div>
        <div className="kpi"><p className="label">Actividades aprobadas</p><p className="num">{aprobadas}</p></div>
        <div className="kpi" style={{ background: 'var(--sol-suave)', borderColor: 'var(--sol)' }}><p className="label" style={{ color: 'var(--sol-tinta)' }}>Por validar</p><p className="num">{pendientes}</p></div>
        <div className="kpi"><p className="label">Moderación pendiente</p><p className="num">{reportes}</p></div>
      </div>
      <div className="grid-2">
        <section className="panel">
          <h2>Tareas de hoy</h2>
          <Link to="/admin/validar" className="lista-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="doc-ico" style={{ background: 'var(--sol-suave)', color: 'var(--sol-tinta)' }}><Icon name="check" size={20} /></span>
            <span className="grow"><b>{pendientes} actividades</b> esperan validación</span>
            <Icon name="derecha" size={18} />
          </Link>
          <Link to="/admin/moderacion" className="lista-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="doc-ico" style={{ background: 'var(--rojo-suave)', color: 'var(--rojo)' }}><Icon name="escudo" size={20} /></span>
            <span className="grow"><b>{reportes} elementos</b> por moderar</span>
            <Icon name="derecha" size={18} />
          </Link>
          <Link to="/admin/juntas" className="lista-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="doc-ico" style={{ background: 'var(--verde-claro)', color: 'var(--verde)' }}><Icon name="socios" size={20} /></span>
            <span className="grow"><b>{s.juntas.length - activas.length} juntas</b> en incorporación</span>
            <Icon name="derecha" size={18} />
          </Link>
        </section>
        <section className="panel">
          <h2>Temporada</h2>
          <div className="between small"><span className="muted">Inicio</span><b>{fechaLarga(TEMPORADA.inicio)}</b></div>
          <div className="between small"><span className="muted">Cierre</span><b>{fechaLarga(TEMPORADA.fin)}</b></div>
          <div className="between small"><span className="muted">Premiación</span><b>{fechaLarga(TEMPORADA.premiacion)}</b></div>
          <Link to="/admin/premiacion" className="btn btn-sol">
            <Icon name="trofeo" size={18} /> Ver Premios Barrio Vivo
          </Link>
        </section>
      </div>
    </>
  )
}

function Validar() {
  const { s, dispatch, toast } = useStore()
  const pend = s.actividades.filter((a) => a.estado === 'pendiente')
  const nombre = (id?: string) => s.juntas.find((j) => j.id === id)?.nombre ?? ''
  return (
    <>
      <WebHead title="Validar actividades" sub={`Se revisan las que superan ${REGLAS.umbralRevision} puntos, las que no tienen fotos o QR, y una muestra al azar.`} />
      <section className="panel">
        {pend.length === 0 ? (
          <Empty>No hay actividades por validar. Registra una desde el perfil Directiva para probar el flujo.</Empty>
        ) : (
          <div className="scroll-x">
            <table className="tabla" style={{ minWidth: 720 }}>
              <thead>
                <tr><th>Actividad</th><th>Junta</th><th>Área</th><th>Evidencia</th><th>Puntos</th><th></th></tr>
              </thead>
              <tbody>
                {pend.map((a) => {
                  const p = puntosActividad(a).total
                  const sinFotos = a.fotos === 0 || a.qr === 0
                  return (
                    <tr key={a.id} style={sinFotos ? { background: '#FFF8EC' } : undefined}>
                      <td><b>{a.nombre}</b><div className="xs muted">{fechaCorta(a.fecha)} · {a.lugar}{a.alianzaCon ? ` · con ${nombre(a.alianzaCon)}` : ''}</div></td>
                      <td>{nombre(a.juntaId)}</td>
                      <td><AreaChip area={a.area} /></td>
                      <td>{a.fotos} fotos · {a.qr} QR · {a.jovenes} jóvenes{a.qr > 150 && <div className="xs" style={{ color: 'var(--sol-tinta)' }}>Asistencia inusual</div>}</td>
                      <td className="num">~{p}</td>
                      <td>
                        <div className="row" style={{ gap: 6 }}>
                          <button className="btn btn-chico" onClick={() => { dispatch({ t: 'validar', id: a.id, ok: true }); toast('Actividad aprobada: los puntos ya cuentan') }}>Aprobar</button>
                          <button className="btn btn-chico btn-rojo" onClick={() => { dispatch({ t: 'validar', id: a.id, ok: false }); toast('Actividad rechazada. Se avisa a la directiva') }}>Rechazar</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}

const ETAPAS: { id: Junta['estado']; label: string; uno: string; fondo: string; color: string }[] = [
  { id: 'invitada', label: 'Invitadas', uno: 'Invitada', fondo: 'var(--papel-3)', color: 'var(--gris)' },
  { id: 'documentos', label: 'Subiendo documentos', uno: 'Documentos', fondo: 'var(--sol-suave)', color: 'var(--sol-tinta)' },
  { id: 'activa', label: 'Activas', uno: 'Activa', fondo: 'var(--verde-claro)', color: 'var(--verde)' },
]

function Juntas() {
  const { s, dispatch, toast } = useStore()
  return (
    <>
      <WebHead title="Juntas y comunas" sub="Una junta pasa a activa con estatutos, certificado de vigencia y directiva validados." />
      <div className="pipeline">
        {ETAPAS.map((e) => (
          <div key={e.id} style={{ background: e.fondo }}>
            <p className="num" style={{ fontSize: 26 }}>{s.juntas.filter((j) => j.estado === e.id).length}</p>
            <p className="small bold" style={{ color: e.color }}>{e.label}</p>
          </div>
        ))}
      </div>
      <section className="panel">
        <div className="scroll-x">
          <table className="tabla" style={{ minWidth: 680 }}>
            <thead><tr><th>Junta</th><th>Sector</th><th>Socios</th><th>Directiva vigente hasta</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {s.juntas.map((j) => {
                const e = ETAPAS.find((x) => x.id === j.estado)!
                const sig = j.estado === 'invitada' ? 'documentos' : j.estado === 'documentos' ? 'activa' : null
                return (
                  <tr key={j.id}>
                    <td><b>{j.nombre}</b><div className="xs muted">{j.unidadVecinal} · desde {j.fundacion}</div></td>
                    <td style={{ textTransform: 'capitalize' }}>{j.sector}</td>
                    <td>{j.socios}</td>
                    <td>{fechaCorta(j.periodoHasta)} {j.periodoHasta.slice(0, 4)}</td>
                    <td><span className="chip" style={{ background: e.fondo, color: e.color }}>{e.uno}</span></td>
                    <td>
                      {sig && (
                        <button className="btn btn-chico btn-borde" onClick={() => { dispatch({ t: 'estadoJunta', id: j.id, estado: sig }); toast(sig === 'activa' ? `${j.nombre} ya está activa` : `${j.nombre} pasó a documentos`) }}>
                          {sig === 'activa' ? 'Activar' : 'Avanzar'}
                        </button>
                      )}
                    </td>
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

function Premiacion() {
  const { s, dispatch, toast } = useStore()
  const tabla = useTabla()
  const ps = premios(tabla)
  const juv = rankingJuventud(tabla)[0]
  const cerrada = s.temporadaCerrada
  return (
    <>
      <WebHead
        title="Premios Barrio Vivo"
        sub={`${TEMPORADA.nombre} · ganadores por puntos cada 10 socios. Los premios son reconocimiento, nunca fondos ni recursos municipales.`}
        action={
          <button
            className={`btn ${cerrada ? 'btn-borde' : 'btn-sol'}`}
            onClick={() => {
              dispatch({ t: 'cerrarTemporada', cerrada: !cerrada })
              toast(cerrada ? 'Temporada reabierta' : '¡Temporada cerrada! Los ganadores son oficiales')
            }}
          >
            <Icon name="trofeo" size={18} /> {cerrada ? 'Reabrir temporada' : 'Cerrar temporada y premiar'}
          </button>
        }
      />
      {cerrada && (
        <div className="panel" style={{ background: 'var(--verde)', color: '#fff', border: 'none' }}>
          <h2>Ganadores oficiales {TEMPORADA.nombre}</h2>
          <p className="small" style={{ color: '#CDE5DA' }}>Ceremonia pública el {fechaLarga(TEMPORADA.premiacion)}. Cada junta ganadora recibe su trofeo y el sello del premio para su sede.</p>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {ps.map((p) => (
          <article key={p.area.id} className="panel" style={{ borderTop: `6px solid ${p.area.color}`, gap: 8 }}>
            <div className="between">
              <span className="area-icon" style={{ width: 44, height: 44, background: p.area.color }}><Icon name="trofeo" size={22} /></span>
              {cerrada && p.ganador && <Chip tone="sol">Ganador</Chip>}
            </div>
            <h3 style={{ fontSize: 17, color: p.area.tinta }}>{p.area.premio}</h3>
            <p className="bold" style={{ fontSize: 18 }}>{p.ganador?.junta.nombre ?? 'Desierto'}</p>
            <p className="small muted">{p.ganador ? `${p.valor} puntos cada 10 socios` : 'Ninguna junta tuvo actividades en esta área'}</p>
            {p.segundo && <p className="xs muted">2° lugar: {p.segundo.junta.nombre}</p>}
          </article>
        ))}
        <article className="panel" style={{ borderTop: '6px solid var(--sol)', gap: 8, background: 'var(--tinta)', color: '#fff', border: 'none' }}>
          <div className="between">
            <span className="area-icon" style={{ width: 44, height: 44, background: 'var(--sol)', color: 'var(--tinta)' }}><Icon name="joven" size={22} /></span>
            {cerrada && juv && <Chip tone="sol">Ganador</Chip>}
          </div>
          <h3 style={{ fontSize: 17, color: 'var(--sol)' }}>Premio Juventud Barrio Vivo</h3>
          <p className="bold" style={{ fontSize: 18 }}>{juv?.junta.nombre ?? 'Desierto'}</p>
          <p className="small" style={{ color: 'var(--gris-claro)' }}>{juv ? `${juv.jovenesPorSocio} jóvenes participando cada 10 socios · ${pct(juv.registrados ? juv.jovenes / juv.registrados : 0)} de sus asistentes` : ''}</p>
        </article>
      </div>
    </>
  )
}

function Moderacion() {
  const { s, dispatch, toast } = useStore()
  const reportes = s.reportes.filter((r) => !r.resuelto)
  const productos = s.emprendedores.filter((p) => p.estado === 'revision')
  return (
    <>
      <WebHead title="Moderación" sub="Comentarios, avisos, emprendedores y fotos. Las fotos con menores requieren consentimiento de sus apoderados, y los avisos de seguridad no pueden describir personas." />
      <div className="grid-2">
        <section className="panel">
          <h2>Reportes</h2>
          {reportes.length === 0 && <Empty>Sin reportes pendientes.</Empty>}
          {reportes.map((r) => (
            <div key={r.id} className="lista-item" style={r.critico ? { borderColor: '#E8B4AE', background: '#FFF7F6' } : undefined}>
              <div className="grow">
                <p className="titulo" style={{ fontSize: 14 }}>{r.detalle}</p>
                <p className="xs muted">{r.junta} · {r.tipo}</p>
              </div>
              <button className="btn btn-chico btn-borde" onClick={() => { dispatch({ t: 'moderar', id: r.id }); toast(r.critico ? 'Contenido ocultado y autor notificado' : 'Reporte resuelto') }}>
                {r.critico ? 'Ocultar' : 'Resolver'}
              </button>
            </div>
          ))}
        </section>
        <section className="panel">
          <h2>Emprendedores por revisar</h2>
          {productos.length === 0 && <Empty>Sin publicaciones por revisar.</Empty>}
          {productos.map((p) => (
            <div key={p.id} className="lista-item">
              <div className="grow">
                <p className="titulo" style={{ fontSize: 14 }}>{p.nombre}</p>
                <p className="xs muted">{p.vendedor} · {p.precio} · {p.descripcion}</p>
              </div>
              <button className="btn btn-chico" onClick={() => { dispatch({ t: 'aprobarEmprendedor', id: p.id }); toast('Publicado en el directorio de emprendedores') }}>Aprobar</button>
            </div>
          ))}
        </section>
      </div>
    </>
  )
}

function Reglas() {
  const [ejemplo] = useState(() => puntosActividad({ asistentes: 40, fotos: 4, qr: 34, jovenes: 12, alianzaCon: 'x' }))
  return (
    <>
      <WebHead title="Reglas de puntaje" sub="Públicas, iguales para todas las juntas y verificables. Propuesta inicial a calibrar en el piloto." />
      <div className="grid-2">
        <section className="panel">
          <h2>Puntos por actividad</h2>
          <table className="tabla">
            <tbody>
              <tr><td>Actividad registrada</td><td className="num">+{REGLAS.base}</td></tr>
              <tr><td>Participación (1 punto cada 4 asistentes, tope)</td><td className="num">+{REGLAS.participacionMax}</td></tr>
              <tr><td>Verificada con fotos y QR, o con foto de la lista firmada en papel</td><td className="num">×{String(REGLAS.multVerificada).replace('.', ',')}</td></tr>
              <tr><td>En alianza con otra junta</td><td className="num">+{REGLAS.alianza}</td></tr>
              <tr><td>Bono juvenil: 30% o más de asistentes de 14 a 29 años</td><td className="num">+{REGLAS.juvenil}</td></tr>
              <tr><td>Ayuda cumplida en Manos Vecinas (Social y Solidaridad)</td><td className="num">+{REGLAS.ayuda}</td></tr>
              <tr><td>Hito de Seguridad y Convivencia (sin asistentes)</td><td className="num">+15 part.</td></tr>
            </tbody>
          </table>
          <p className="small muted">En una frase: cada actividad suma; si es verificada, con otra junta o con jóvenes, suma más. Ejemplo: 40 asistentes, verificada, en alianza y con 35% de jóvenes = <b>{ejemplo.total} puntos</b>.</p>
        </section>
        <section className="panel">
          <h2>Índice de Vitalidad Comunitaria</h2>
          <table className="tabla">
            <tbody>
              <tr><td>Participación: socios activos sobre inscritos</td><td className="num">{PESOS_IVC.participacion * 100}%</td></tr>
              <tr><td>Diversidad: áreas con actividad</td><td className="num">{PESOS_IVC.diversidad * 100}%</td></tr>
              <tr><td>Constancia: meses con actividad</td><td className="num">{PESOS_IVC.constancia * 100}%</td></tr>
              <tr><td>Renovación generacional: asistentes jóvenes</td><td className="num">{PESOS_IVC.renovacion * 100}%</td></tr>
              <tr><td>Colaboración: alianzas</td><td className="num">{PESOS_IVC.colaboracion * 100}%</td></tr>
              <tr><td>Gestión: documentos y directiva vigente</td><td className="num">{PESOS_IVC.gestion * 100}%</td></tr>
            </tbody>
          </table>
        </section>
        <section className="panel">
          <h2>Las 7 áreas</h2>
          <div className="stack-sm">
            {AREAS.map((a) => (
              <div key={a.id} className="lista-item" style={{ padding: '8px 12px' }}>
                <span className="area-icon" style={{ width: 36, height: 36, background: a.color, borderRadius: 10 }}><Icon name={a.icono} size={18} /></span>
                <div className="grow"><p className="bold small">{AREA_BY_ID[a.id].nombre}</p><p className="xs muted">{a.ejemplos}</p></div>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <h2>Tramos de edad</h2>
          <table className="tabla">
            <tbody>
              <tr><td>Menos de 14</td><td>Participa a través del perfil de su apoderado</td></tr>
              <tr><td>14 a 17</td><td>Perfil propio con autorización del apoderado; sin emprendimientos; fotos con consentimiento</td></tr>
              <tr><td>18 a 29</td><td>Perfil joven: convocatorias, propuestas juveniles y Premio Juventud</td></tr>
              <tr><td>30 o más</td><td>Perfil adulto</td></tr>
            </tbody>
          </table>
          <p className="xs muted">Se guarda solo el tramo, no la fecha de nacimiento. El municipio ve totales por tramo.</p>
        </section>
        <section className="panel">
          <h2>El Queltehue avisa</h2>
          <ul className="small" style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Se informan hechos: qué pasó, dónde y cuándo.</li>
            <li>Nunca fotos, nombres ni descripciones de personas en avisos de seguridad.</li>
            <li>Los avisos de seguridad de vecinos se eligen de una lista cerrada (luminaria, alarma, infraestructura dañada, simulacro, reunión) con calle y hora; no hay texto libre.</li>
            <li>Ante una emergencia en curso, primero el 133 o el 131: la app muestra el botón de llamada.</li>
            <li>Comentarios de una línea; los avisos que no cumplen se ocultan.</li>
          </ul>
        </section>
        <section className="panel">
          <h2>Competencia sana</h2>
          <ul className="small" style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Premios por área según puntos cada 10 socios, para que una junta pequeña pueda ganar.</li>
            <li>Ligas por tamaño: pequeñas (menos de 80 socios), medianas (80 a 139) y grandes (140 o más).</li>
            <li>Validación de toda actividad sobre {REGLAS.umbralRevision} puntos o sin evidencia, más una muestra al azar.</li>
            <li>Primero se muestran los sellos de avance (Semilla, Brote, Árbol, Bosque), que toda junta puede alcanzar; la tabla se compara solo dentro de cada liga.</li>
            <li>Temporadas semestrales que se reinician; la tabla de hoy es al {fechaCorta(HOY)}.</li>
            <li><b>Los premios nunca son fondos ni recursos municipales.</b> Son reconocimiento: trofeo, diploma, ceremonia y difusión. Así el ranking no condiciona la asignación de recursos públicos.</li>
          </ul>
        </section>
        <section className="panel">
          <h2>Sin celular también se participa</h2>
          <ul className="small" style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>Asistencia: lista firmada en papel; su foto cuenta como verificación.</li>
            <li>Consultas: papeletas en la asamblea; la directiva suma los votos y adjunta el acta.</li>
            <li>Necesidades: las planteadas en asamblea se registran con sus votos y quedan marcadas "desde la asamblea".</li>
            <li>Necesidades iguales se unen para que los apoyos no se dispersen.</li>
          </ul>
        </section>
      </div>
    </>
  )
}
