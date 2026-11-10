import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LECCIONES, TRAMOS, esJoven } from '../../data/demo'
import { Icon } from '../../components/Icon'
import { CambiarPerfil, Chip, Modal, PageTitle } from '../../components/ui'
import { useVecino } from '../../lib/hooks'
import { useStore } from '../../state/store'
import { AVISO_MAPU } from '../../data/mapudungun'
import { Certificado, codigoCertificado } from '../../components/certificado'

export default function Perfil() {
  const { s, dispatch } = useStore()
  const v = useVecino()
  const [cert, setCert] = useState(false)
  const respondidas = s.consultas.filter((c) => c.votoDe[v.id] !== undefined).length
  const apoyos = s.necesidades.filter((n) => n.apoyada).length
  // Ayudas en que esta persona fue quien ayudó
  const ayudo = s.ayudas.filter((a) => a.estado === 'cumplida' && ((a.tipo === 'pide' && a.conId === v.id) || (a.tipo === 'ofrece' && a.autorId === v.id)))
  const informado = s.leccionesHechas.length >= LECCIONES.length
  const joven = esJoven(v.tramo)

  const insignias = [
    { nombre: 'Vecino Activo', icono: 'estrella', on: v.actividades >= 5, color: '#F2B632' },
    { nombre: 'Manos Vecinas', icono: 'manos', on: ayudo.length > 0, color: '#C2366B' },
    { nombre: 'Voz del Barrio', icono: 'voto', on: respondidas > 0 || apoyos > 0, color: '#1D6B4E' },
    { nombre: 'Joven Activo', icono: 'joven', on: joven && v.actividades >= 5, color: '#C9541F' },
    { nombre: '50 horas', icono: 'reloj', on: v.horas >= 50, color: '#7B44A8' },
    { nombre: 'Embajador Digital', icono: 'socios', on: !!v.embajador, color: '#157F70' },
    { nombre: 'Vecino Informado', icono: 'aprende', on: informado, color: '#2B63C0' },
  ]

  return (
    <>
      <PageTitle title="Mi perfil" />
      <div className="pad stack" style={{ paddingTop: 6 }}>
        <div className="card between">
          <div className="stack-sm" style={{ gap: 4 }}>
            <p className="bold" style={{ fontSize: 18 }}>{v.nombre}</p>
            <div className="chips">
              <Chip tone={joven ? 'sol' : 'gris'}>{TRAMOS[v.tramo]}</Chip>
              {v.embajador && <Chip>Embajadora digital</Chip>}
            </div>
          </div>
          <span className="area-icon" style={{ width: 52, height: 52, borderRadius: 26, background: 'var(--sol)', color: 'var(--tinta)' }}>
            <Icon name="perfil" size={26} />
          </span>
        </div>

        <div className="card stack-sm" style={{ background: 'var(--tinta)', color: '#fff', border: 'none' }}>
          <p className="small" style={{ color: 'var(--gris-claro)' }}>Horas de voluntariado certificadas</p>
          <p className="num" style={{ fontSize: 44, color: 'var(--sol)' }}>{v.horas} h</p>
          <p className="small" style={{ color: 'var(--gris-claro)' }}>Las certifica tu junta. Las convocatorias con QR cuentan de inmediato; las ayudas, cuando la directiva las revisa.</p>
          {v.porRevisar > 0 && <p className="small" style={{ color: 'var(--sol)' }}>{v.porRevisar} h por revisar este mes</p>}
          <button className="btn btn-sol btn-block" onClick={() => setCert(true)}>
            <Icon name="descargar" size={18} /> Ver mi certificado
          </button>
        </div>

        <section className="card stack-sm" aria-labelledby="com-t">
          <h2 id="com-t" className="card-titulo" style={{ fontSize: 17 }}>Mis comunidades</h2>
          {v.membresias.map((m) => (
            <div key={m.organizacion} className="between small" style={{ borderTop: '1px solid var(--linea)', paddingTop: 8 }}>
              <b>{m.organizacion}</b>
              <span className="muted">{m.rol}</span>
            </div>
          ))}
          <p className="xs muted">Tu perfil es tuyo: si te cambias de barrio, tus horas e insignias te acompañan.</p>
        </section>

        {ayudo.length > 0 && (
          <section className="card stack-sm" aria-labelledby="gr-t">
            <h2 id="gr-t" className="card-titulo" style={{ fontSize: 17 }}>Agradecimientos de tus vecinos</h2>
            {ayudo.map((a) => (
              <div key={a.id} className="stack-sm" style={{ gap: 4 }}>
                <p className="gracias">{a.gracias}</p>
                <p className="xs muted">{a.tipo === 'pide' ? a.autor : a.con} · {a.titulo}</p>
              </div>
            ))}
          </section>
        )}

        <div className="seccion"><h2>Mis insignias</h2></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
          {insignias.map((i) => (
            <div key={i.nombre} className="insignia" data-off={!i.on}>
              <span style={{ background: i.on ? i.color : 'var(--papel-3)', color: i.on ? '#fff' : 'var(--gris)', width: 54, height: 54 }}>
                <Icon name={i.icono} size={24} />
              </span>
              <span>{i.nombre}</span>
            </div>
          ))}
        </div>

        <div className="card stack-sm">
          <div className="between small"><span>Ayudas que di en Manos Vecinas</span><b>{ayudo.length}</b></div>
          <div className="between small"><span>Consultas respondidas</span><b>{respondidas}</b></div>
          <div className="between small"><span>Necesidades que apoyo</span><b>{apoyos}</b></div>
        </div>

        <section className="card stack-sm" aria-labelledby="ver-t">
          <h2 id="ver-t" className="card-titulo" style={{ fontSize: 17 }}>Cómo ves la app</h2>
          <label className="ajuste">
            <span><b>Letra grande</b><small>Todo se ve más grande y fácil de leer</small></span>
            <input type="checkbox" checked={s.prefs.letraGrande} onChange={(e) => dispatch({ t: 'prefs', p: { letraGrande: e.target.checked } })} />
          </label>
          <label className="ajuste">
            <span><b>Mapudungun</b><small>Saludos y secciones también en mapudungun</small></span>
            <input type="checkbox" checked={s.prefs.mapudungun} onChange={(e) => dispatch({ t: 'prefs', p: { mapudungun: e.target.checked } })} />
          </label>
          <p className="xs muted">Los avisos tienen el botón "Escuchar" para oírlos en voz alta. {s.prefs.mapudungun && AVISO_MAPU}</p>
        </section>

        <Link to="/vecino/aprende" className="lista-item" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="area-icon" style={{ width: 44, height: 44, background: 'var(--sol)', color: 'var(--tinta)' }}><Icon name="aprende" size={22} /></span>
          <div className="grow">
            <p className="titulo">Aprende</p>
            <p className="small muted">Educación cívica y leyes explicadas · {s.leccionesHechas.length} de {LECCIONES.length} lecciones</p>
          </div>
          <Icon name="derecha" size={18} />
        </Link>
        <div style={{ textAlign: 'center' }}><CambiarPerfil /></div>
      </div>

      <Modal open={cert} onClose={() => setCert(false)} title="Certificado de voluntariado">
        <div className="modal-body">
          <Certificado v={v} junta={v.junta} horas={v.horas} base={v.horasBase} aprobadas={v.aprobadas} />
          <Link to={`/verificar/${codigoCertificado(v)}`} className="btn btn-borde btn-block">Ver cómo lo verifica quien lo recibe</Link>
          <button className="btn btn-block" onClick={() => window.print()}>
            <Icon name="descargar" size={18} /> Imprimir o guardar en PDF
          </button>
        </div>
      </Modal>
    </>
  )
}
