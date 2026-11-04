import { Link } from 'react-router-dom'
import { AREAS, AREA_BY_ID } from '../../data/areas'
import { TEMPORADA, VECINO_DEMO } from '../../data/demo'
import { Icon } from '../../components/Icon'
import { AreaChip, CambiarPerfil, Chip, Logo } from '../../components/ui'
import { useTabla } from '../../lib/hooks'
import { areaMasDebil, esVerificada, fechaCorta, miles, ordenar, puntosPorActividad } from '../../lib/scoring'
import { useStore } from '../../state/store'

export default function Inicio() {
  const { s } = useStore()
  const tabla = useTabla()
  const junta = s.juntas.find((j) => j.id === VECINO_DEMO.juntaId)!
  const fila = tabla.find((f) => f.junta.id === junta.id)!
  const pos = ordenar(tabla, 'porSocio').findIndex((f) => f.junta.id === junta.id) + 1
  const debil = areaMasDebil(fila)
  const fuertes = [...AREAS].sort((a, b) => fila.porArea[b.id] - fila.porArea[a.id]).slice(0, 2)
  const pts = puntosPorActividad(s.actividades)
  const recientes = s.actividades.filter((a) => (a.juntaId === junta.id || a.alianzaCon === junta.id) && a.estado === 'aprobada').slice(0, 3)
  const votacion = s.votaciones.find((v) => v.juntaId === junta.id && v.miVoto === undefined)
  const aviso = s.avisos.find((a) => a.juntaId === junta.id)
  const nombre = (id?: string) => s.juntas.find((j) => j.id === id)?.nombre

  return (
    <>
      <div className="hero">
        <div className="between">
          <span className="marca">
            <Logo size={28} mono /> Barrio Vivo
          </span>
          <Link to="/vecino/perfil" className="icon-btn" style={{ background: 'var(--verde-medio)', color: '#fff' }} aria-label="Mi perfil">
            <Icon name="perfil" size={22} />
          </Link>
        </div>
        <div>
          <p className="saludo">Hola, {VECINO_DEMO.nombre.split(' ')[0]}</p>
          <h1>JJVV {junta.nombre}</h1>
        </div>
      </div>

      <Link to="/vecino/tabla" className="flotante stack" style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
        <div className="between">
          <div>
            <p className="small muted">Puntos de tu junta · {TEMPORADA.nombre}</p>
            <p className="num" style={{ fontSize: 30 }}>{miles(fila.total)}</p>
          </div>
          <div style={{ background: 'var(--sol)', borderRadius: 14, padding: '8px 12px', textAlign: 'center' }}>
            <p className="xs bold">Tabla general</p>
            <p className="num" style={{ fontSize: 20 }}>{pos}° lugar</p>
          </div>
        </div>
        <div className="franja" aria-hidden="true">
          {AREAS.map((a) => (
            <span key={a.id} style={{ flex: Math.max(1, fila.porArea[a.id]), background: a.color }} />
          ))}
        </div>
        <p className="small muted">
          Fuertes en {fuertes.map((f) => f.corto.toLowerCase()).join(' y ')}.{' '}
          <b style={{ color: debil.tinta }}>{debil.corto} es el área a reforzar.</b>
        </p>
      </Link>

      <div className="pad stack">
        <div className="accesos">
          <Link className="acceso" to="/vecino/participa">
            <span><Icon name="voto" /></span>
            <span>Votar</span>
          </Link>
          <Link className="acceso" to="/vecino/avisos">
            <span><Icon name="megafono" /></span>
            <span>Avisos</span>
          </Link>
          <Link className="acceso" to="/vecino/mercado">
            <span><Icon name="mercado" /></span>
            <span>Mercado</span>
          </Link>
          <Link className="acceso" to="/vecino/aprende#emergencias">
            <span style={{ background: 'var(--rojo-suave)', color: 'var(--rojo)' }}><Icon name="telefono" /></span>
            <span>Emergencia</span>
          </Link>
        </div>

        {votacion && (
          <Link to="/vecino/participa" className="lista-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="area-icon" style={{ width: 44, height: 44, background: 'var(--verde)' }}>
              <Icon name="voto" size={22} />
            </span>
            <div className="grow">
              <p className="titulo">Votación abierta: {votacion.pregunta}</p>
              <p className="small muted">
                Cierra el {fechaCorta(votacion.cierre)} · {votacion.opciones.reduce((s, o) => s + o.votos, 0)} de {junta.socios} socios votaron
              </p>
            </div>
            <Icon name="derecha" size={18} />
          </Link>
        )}

        {aviso && (
          <Link to="/vecino/avisos" className="lista-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="area-icon" style={{ width: 44, height: 44, background: 'var(--sol)', color: 'var(--tinta)' }}>
              <Icon name="megafono" size={22} />
            </span>
            <div className="grow">
              <p className="titulo">{aviso.titulo}</p>
              <p className="small muted">Aviso de la directiva · {fechaCorta(aviso.fecha)}</p>
            </div>
            <Icon name="derecha" size={18} />
          </Link>
        )}

        <div className="seccion">
          <h2>Lo que pasa en tu barrio</h2>
        </div>
        {recientes.map((a) => {
          const area = AREA_BY_ID[a.area]
          const p = pts.get(a.id)
          return (
            <article key={a.id} className="actividad-card">
              <div className="foto-ph" style={{ height: 110, background: area.suave, color: area.tinta }}>
                <Icon name={area.icono} size={40} stroke={1.5} />
              </div>
              <div className="cuerpo">
                <div className="chips">
                  <AreaChip area={a.area} />
                  {esVerificada(a) && p && <Chip>Verificada · +{p.total}</Chip>}
                </div>
                <p className="bold" style={{ fontSize: 16 }}>{a.nombre}</p>
                <p className="small muted">
                  {fechaCorta(a.fecha)} · {a.asistentes} asistentes
                  {a.juntaId !== junta.id ? ` · organizada por ${nombre(a.juntaId)}` : a.alianzaCon ? ` · junto a ${nombre(a.alianzaCon)}` : ''}
                </p>
              </div>
            </article>
          )
        })}
        <div style={{ textAlign: 'center', paddingTop: 4 }}>
          <CambiarPerfil />
        </div>
      </div>
    </>
  )
}
