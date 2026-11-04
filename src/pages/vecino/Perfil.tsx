import { useState } from 'react'
import { LECCIONES, VECINO_DEMO } from '../../data/demo'
import { Icon } from '../../components/Icon'
import { CambiarPerfil, Modal, PageTitle } from '../../components/ui'
import { fechaLarga } from '../../lib/scoring'
import { useStore } from '../../state/store'
import { HOY } from '../../data/demo'

export default function Perfil() {
  const { s } = useStore()
  const [cert, setCert] = useState(false)
  const junta = s.juntas.find((j) => j.id === VECINO_DEMO.juntaId)!
  const votos = s.votaciones.filter((v) => v.juntaId === junta.id && v.miVoto !== undefined).length
  const apoyos = s.necesidades.filter((n) => n.apoyada).length
  const informado = s.leccionesHechas.length >= LECCIONES.length

  const insignias = [
    { nombre: 'Vecino Activo', icono: 'estrella', on: VECINO_DEMO.actividades >= 5, color: '#F2B632' },
    { nombre: 'Voz del Barrio', icono: 'voto', on: votos > 0 || apoyos > 0, color: '#1D6B4E' },
    { nombre: 'Vecino Informado', icono: 'aprende', on: informado, color: '#2B63C0' },
    { nombre: '20 horas', icono: 'reloj', on: VECINO_DEMO.horas >= 20, color: '#C2366B' },
    { nombre: '50 horas', icono: 'trofeo', on: VECINO_DEMO.horas >= 50, color: '#7B44A8' },
    { nombre: 'Embajador Digital', icono: 'socios', on: false, color: '#157F70' },
  ]

  return (
    <>
      <PageTitle title="Mi perfil" back="/vecino" />
      <div className="pad stack" style={{ paddingTop: 6 }}>
        <div className="card between">
          <div>
            <p className="bold" style={{ fontSize: 18 }}>{VECINO_DEMO.nombre}</p>
            <p className="small muted">Socia de JJVV {junta.nombre}</p>
          </div>
          <span className="area-icon" style={{ width: 52, height: 52, borderRadius: 26, background: 'var(--sol)', color: 'var(--tinta)' }}>
            <Icon name="perfil" size={26} />
          </span>
        </div>

        <div className="card stack-sm" style={{ background: 'var(--tinta)', color: '#fff', border: 'none' }}>
          <p className="small" style={{ color: 'var(--gris-claro)' }}>Horas de voluntariado certificadas</p>
          <p className="num" style={{ fontSize: 44, color: 'var(--sol)' }}>{VECINO_DEMO.horas} h</p>
          <p className="small" style={{ color: 'var(--gris-claro)' }}>En {VECINO_DEMO.actividades} actividades verificadas con QR esta temporada.</p>
          <button className="btn btn-sol btn-block" onClick={() => setCert(true)}>
            <Icon name="descargar" size={18} /> Ver mi certificado
          </button>
        </div>

        <div className="seccion"><h2>Mis insignias</h2></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
          {insignias.map((i) => (
            <div key={i.nombre} className="insignia" data-off={!i.on}>
              <span style={{ background: i.on ? i.color : 'var(--papel-3)', color: i.on ? '#fff' : 'var(--gris)' }}>
                <Icon name={i.icono} size={26} />
              </span>
              <span>{i.nombre}</span>
            </div>
          ))}
        </div>

        <div className="card stack-sm">
          <div className="between small"><span>Votaciones en que participé</span><b>{votos}</b></div>
          <div className="between small"><span>Necesidades que apoyo</span><b>{apoyos}</b></div>
          <div className="between small"><span>Lecciones cívicas</span><b>{s.leccionesHechas.length} de {LECCIONES.length}</b></div>
        </div>
        <div style={{ textAlign: 'center' }}><CambiarPerfil /></div>
      </div>

      <Modal open={cert} onClose={() => setCert(false)} title="Certificado de voluntariado">
        <div className="modal-body">
          <div className="certificado">
            <Icon name="trofeo" size={36} />
            <p className="xs bold muted" style={{ letterSpacing: 1 }}>BARRIO VIVO CERTIFICA QUE</p>
            <h3>{VECINO_DEMO.nombre}</h3>
            <p className="small">realizó voluntariado comunitario en la Junta de Vecinos {junta.nombre} por</p>
            <p className="num">{VECINO_DEMO.horas} horas</p>
            <p className="small muted">en {VECINO_DEMO.actividades} actividades verificadas con registro de asistencia.</p>
            <p className="xs muted">Emitido el {fechaLarga(HOY)} · Código de verificación BV-{junta.id.toUpperCase()}-0426</p>
          </div>
          <button className="btn btn-block" onClick={() => window.print()}>
            <Icon name="descargar" size={18} /> Imprimir o guardar en PDF
          </button>
        </div>
      </Modal>
    </>
  )
}
