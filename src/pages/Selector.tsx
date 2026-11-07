import { Link, useNavigate } from 'react-router-dom'
import { AREAS } from '../data/areas'
import { COMUNA, TEMPORADA, VECINOS } from '../data/demo'
import { Icon } from '../components/Icon'
import { Logo } from '../components/ui'
import { useStore } from '../state/store'

const PERFILES = [
  {
    to: '/directiva', tipo: 'App móvil', titulo: 'Directiva', icono: 'panel', fondo: '#E8F1EC', color: '#1D6B4E',
    texto: 'Entra como la presidenta de Villa Los Aromos. Registra actividades, aprueba propuestas juveniles y envía el resumen semanal.',
  },
  {
    to: '/admin', tipo: 'Panel web', titulo: 'Administración', icono: 'escudo', fondo: '#E5E6F0', color: '#2E3259',
    texto: 'Valida actividades, incorpora juntas, modera avisos y realiza la premiación de la temporada.',
  },
  {
    to: '/municipio', tipo: 'Panel web', titulo: 'Municipio', icono: 'mapa', fondo: '#E4ECFA', color: '#1D4688',
    texto: 'Mira la vitalidad de cada sector, la participación juvenil y responde las necesidades de los vecinos.',
  },
]

export default function Selector() {
  const { dispatch, toast } = useStore()
  const nav = useNavigate()
  return (
    <div className="selector">
      <div className="selector-hero">
        <div className="selector-inner">
          <div className="marca" style={{ fontSize: 16, marginBottom: 22 }}>
            <Logo size={34} mono /> Prototipo · {COMUNA}
          </div>
          <h1>Barrio Vivo</h1>
          <div className="lema">Tu junta, tu barrio, tu voz.</div>
          <p className="intro">
            Plataforma comunitaria para juntas de vecinos. Los vecinos se avisan, se ayudan y participan; cada actividad suma puntos
            en una de las 7 áreas y compite por los Premios Barrio Vivo de la {TEMPORADA.nombre.toLowerCase()}. Elige un perfil para recorrerla.
          </p>
          <div className="areas-strip">
            {AREAS.map((a) => (
              <span key={a.id}>
                <i className="dot" style={{ background: a.color, width: 10, height: 10, borderRadius: 5 }} />
                {a.corto}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="perfiles">
        <div className="perfil-card" style={{ cursor: 'default' }}>
          <span className="perfil-ico" style={{ background: '#FBEADF', color: '#8F3A14' }}>
            <Icon name="perfil" size={26} />
          </span>
          <span className="tipo">App móvil</span>
          <h2>Vecino</h2>
          <p>Avisos del barrio, Manos Vecinas, consultas, tabla y tu perfil con horas de voluntariado. Elige con quién entrar:</p>
          <div className="stack-sm">
            {VECINOS.map((v) => (
              <button
                key={v.id}
                className="btn btn-borde"
                style={{ justifyContent: 'space-between' }}
                onClick={() => {
                  dispatch({ t: 'setVecino', id: v.id })
                  nav('/vecino')
                }}
              >
                <span style={{ textAlign: 'left' }}>
                  {v.nombre.split(' ')[0]}, {v.edad} años
                  <span className="xs muted" style={{ display: 'block', fontWeight: 500 }}>{v.embajador ? 'Joven · embajadora digital' : 'Socia de la junta'}</span>
                </span>
                <Icon name="derecha" size={18} />
              </button>
            ))}
          </div>
        </div>
        {PERFILES.map((p) => (
          <Link key={p.to} to={p.to} className="perfil-card">
            <span className="perfil-ico" style={{ background: p.fondo, color: p.color }}>
              <Icon name={p.icono} size={26} />
            </span>
            <span className="tipo">{p.tipo}</span>
            <h2>{p.titulo}</h2>
            <p>{p.texto}</p>
            <span className="ir">
              Entrar <Icon name="derecha" size={18} />
            </span>
          </Link>
        ))}
      </div>

      <div className="selector-pie">
        <span>Datos de ejemplo. Lo que hagas en la demo queda guardado en este navegador.</span>
        <button
          className="btn btn-borde btn-chico"
          onClick={() => {
            dispatch({ t: 'reset' })
            toast('La demo volvió a los datos iniciales')
          }}
        >
          Reiniciar demo
        </button>
      </div>
    </div>
  )
}
