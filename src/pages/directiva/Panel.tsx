import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AREAS } from '../../data/areas'
import { HOY } from '../../data/demo'
import { Icon } from '../../components/Icon'
import { Bar, CambiarPerfil, Chip, Modal, Radar } from '../../components/ui'
import { useIVC, useTabla } from '../../lib/hooks'
import { areaMasDebil, fechaCorta, ordenar } from '../../lib/scoring'
import { useStore } from '../../state/store'
import { JUNTA_DIRECTIVA } from './config'

export default function Panel() {
  const { s, dispatch, toast } = useStore()
  const tabla = useTabla()
  const ivcs = useIVC()
  const junta = s.juntas.find((j) => j.id === JUNTA_DIRECTIVA)!
  const fila = tabla.find((f) => f.junta.id === junta.id)!
  const ivc = ivcs.get(junta.id)!
  const debil = areaMasDebil(fila)
  // Junta que más puntos tiene en el área débil: aliada sugerida
  const aliada = ordenar(tabla.filter((f) => f.junta.id !== junta.id), 'total', debil.id)[0]
  const pos = ordenar(tabla, 'porSocio').findIndex((f) => f.junta.id === junta.id) + 1
  const pendientes = s.actividades.filter((a) => a.juntaId === junta.id && a.estado === 'pendiente').length
  const docsAlerta = s.documentos.filter((d) => d.juntaId === junta.id && (d.estado === 'por_vencer' || d.estado === 'pendiente')).length
  const presidencia = junta.directiva.find((c) => c.cargo === 'Presidencia')

  const [aviso, setAviso] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [texto, setTexto] = useState('')

  return (
    <>
      <div className="hero hero-tinta">
        <div className="between">
          <Chip tone="sol">Modo directiva</Chip>
          <CambiarPerfil claro />
        </div>
        <div>
          <p className="saludo" style={{ color: 'var(--gris-claro)' }}>
            {presidencia?.nombre} · Presidencia hasta {fechaCorta(junta.periodoHasta)} {junta.periodoHasta.slice(0, 4)}
          </p>
          <h1>JJVV {junta.nombre}</h1>
        </div>
      </div>

      <div className="pad stack">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
          <div className="card" style={{ padding: 10 }}>
            <p className="xs muted">Vitalidad</p>
            <p className="num" style={{ fontSize: 26, color: 'var(--verde)' }}>{ivc.total}</p>
            <p className="xs muted">de 100</p>
          </div>
          <div className="card" style={{ padding: 10 }}>
            <p className="xs muted">Socios activos</p>
            <p className="num" style={{ fontSize: 26 }}>{junta.sociosActivos}</p>
            <p className="xs muted">de {junta.socios}</p>
          </div>
          <div className="card" style={{ padding: 10 }}>
            <p className="xs muted">Tabla general</p>
            <p className="num" style={{ fontSize: 26 }}>{pos}°</p>
            <p className="xs muted">{fila.liga.replace('Barrios ', '')}</p>
          </div>
        </div>

        <section className="card" aria-labelledby="radar-t">
          <div className="between">
            <h2 id="radar-t" className="card-titulo" style={{ fontSize: 17 }}>Radar de la junta</h2>
            <span className="xs muted">{fila.actividades} actividades</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Radar values={radarDe(fila)} label={`Radar de ${junta.nombre}: ${debil.corto} es el área más baja`} size={330} />
          </div>
        </section>

        <div className="card stack-sm" style={{ background: debil.suave, border: 'none' }}>
          <p className="bold" style={{ color: debil.tinta }}>
            {debil.corto}: {fila.porArea[debil.id] === 0 ? 'sin actividades esta temporada' : 'tu área más baja'}
          </p>
          <p className="small">
            {aliada ? `JJVV ${aliada.junta.nombre} es la más fuerte en ${debil.corto.toLowerCase()}. ` : ''}
            Una actividad en alianza suma +40 y, si es la primera en el área, +30 más. Te acerca al {debil.premio}.
          </p>
        </div>

        <section className="card stack-sm" aria-labelledby="ivc-t">
          <h2 id="ivc-t" className="card-titulo" style={{ fontSize: 17 }}>Índice de vitalidad</h2>
          {[
            ['Participación', ivc.participacion],
            ['Diversidad de áreas', ivc.diversidad],
            ['Constancia mensual', ivc.constancia],
            ['Colaboración', ivc.colaboracion],
            ['Gestión y documentos', ivc.gestion],
          ].map(([l, v]) => (
            <div key={l as string} className="resultado">
              <div className="between small"><span>{l}</span><b>{v}</b></div>
              <Bar value={v as number} height={8} />
            </div>
          ))}
        </section>

        {(pendientes > 0 || docsAlerta > 0) && (
          <div className="stack-sm">
            {pendientes > 0 && (
              <Link to="/directiva/actividades" className="lista-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="doc-ico" style={{ background: 'var(--sol-suave)', color: 'var(--sol-tinta)' }}><Icon name="reloj" size={20} /></span>
                <span className="grow small"><b>{pendientes} actividad en validación.</b> Sus puntos se suman al aprobarse.</span>
              </Link>
            )}
            {docsAlerta > 0 && (
              <Link to="/directiva/documentos" className="lista-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="doc-ico" style={{ background: 'var(--rojo-suave)', color: 'var(--rojo)' }}><Icon name="alerta" size={20} /></span>
                <span className="grow small"><b>{docsAlerta} documentos requieren atención.</b></span>
              </Link>
            )}
          </div>
        )}

        <Link to="/directiva/actividades/nueva" className="btn btn-block">
          <Icon name="mas" size={18} /> Registrar actividad
        </Link>
        <button className="btn btn-borde btn-block" onClick={() => setAviso(true)}>
          <Icon name="megafono" size={18} /> Publicar aviso a los vecinos
        </button>
        <p className="xs muted" style={{ textAlign: 'center' }}>
          Las áreas: {AREAS.map((a) => a.corto).join(' · ')}
        </p>
      </div>

      <Modal open={aviso} onClose={() => setAviso(false)} title="Nuevo aviso">
        <form
          className="modal-body"
          onSubmit={(e) => {
            e.preventDefault()
            if (!titulo.trim()) return
            dispatch({ t: 'nuevoAviso', a: { id: `av${Date.now()}`, juntaId: junta.id, titulo: titulo.trim(), texto: texto.trim(), fecha: HOY } })
            setTitulo('')
            setTexto('')
            setAviso(false)
            toast('Aviso publicado para todos los socios')
          }}
        >
          <label className="field">
            Título
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          </label>
          <label className="field">
            Mensaje
            <textarea value={texto} onChange={(e) => setTexto(e.target.value)} />
          </label>
          <button className="btn btn-block">Publicar aviso</button>
        </form>
      </Modal>
    </>
  )
}

function radarDe(fila: ReturnType<typeof useTabla>[number]) {
  const max = Math.max(1, ...AREAS.map((a) => fila.porArea[a.id]))
  return AREAS.map((a) => fila.porArea[a.id] / max)
}
