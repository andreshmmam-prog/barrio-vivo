import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AREAS } from '../../data/areas'
import { ENCUESTA, ENCUESTA_JUNTA, HOY } from '../../data/demo'
import { ResultadoEncuesta } from '../../components/barrio'
import { vencimientos } from '../../lib/gestion'
import { Icon } from '../../components/Icon'
import { NuevaAlertaModal } from '../../components/comunidad'
import { Bar, CambiarPerfil, Chip, Modal, Radar, SelloNivel } from '../../components/ui'
import { useIVC, useNiveles, useTabla } from '../../lib/hooks'
import { REGLAS, areaMasDebil, diasEntre, fechaCorta, ordenar, pct, rankingJuventud } from '../../lib/scoring'
import { useStore } from '../../state/store'
import { JUNTA_DIRECTIVA } from './config'

export default function Panel() {
  const { s, toast } = useStore()
  const tabla = useTabla()
  const ivcs = useIVC()
  const junta = s.juntas.find((j) => j.id === JUNTA_DIRECTIVA)!
  const fila = tabla.find((f) => f.junta.id === junta.id)!
  const ivc = ivcs.get(junta.id)!
  const debil = areaMasDebil(fila)
  const aliada = ordenar(tabla.filter((f) => f.junta.id !== junta.id), 'total', debil.id)[0]
  const nivel = useNiveles().get(junta.id)!
  const posJuv = rankingJuventud(tabla).findIndex((f) => f.junta.id === junta.id) + 1
  const pendientes = s.actividades.filter((a) => a.juntaId === junta.id && a.estado === 'pendiente').length
  const propuestas = s.propuestas.filter((p) => p.juntaId === junta.id && p.estado === 'pendiente').length
  const docsAlerta = s.documentos.filter((d) => d.juntaId === junta.id && (d.estado === 'por_vencer' || d.estado === 'pendiente')).length
  const presidencia = junta.directiva.find((c) => c.cargo === 'Presidencia')

  const venc = vencimientos(s, junta.id).slice(0, 5)
  const horasPend = s.horas.filter((h) => h.juntaId === junta.id && h.estado === 'por_revisar')
  const enc = ENCUESTA_JUNTA[junta.id]
  const [aviso, setAviso] = useState(false)
  const [resumen, setResumen] = useState(false)

  // Resumen semanal para el grupo de WhatsApp de la junta
  const textoResumen = useMemo(() => {
    const semana = (f: string) => diasEntre(f) <= 7
    const avisos = s.alertas.filter((a) => a.juntaId === junta.id && semana(a.fecha)).slice(0, 3)
    const consulta = s.consultas.find((c) => c.juntaId === junta.id && c.cierre >= HOY)
    const ayudas = s.ayudas.filter((a) => a.juntaId === junta.id && a.tipo === 'pide' && a.estado === 'abierta')
    const resuelta = s.necesidades.find((n) => n.juntaId === junta.id && n.respuesta)
    const conv = s.convocatorias.filter((c) => c.juntaId === junta.id && c.inscritos < c.cupos).slice(0, 2)
    const l: string[] = []
    l.push(`*Barrio Vivo · JJVV ${junta.nombre}*`)
    l.push(`Resumen de la semana al ${fechaCorta(HOY)}`)
    l.push('')
    l.push(`*Sello de la junta:* nivel ${nivel.nivel}.`)
    if (consulta) l.push(`*Consulta abierta:* ${consulta.pregunta} Cierra el ${fechaCorta(consulta.cierre)}.`)
    if (avisos.length) {
      l.push('')
      l.push('*El Queltehue avisa*')
      avisos.forEach((a) => l.push(`- ${a.titulo}`))
    }
    if (ayudas.length) {
      l.push('')
      l.push(`*Manos Vecinas:* ${ayudas.length} vecinos necesitan una mano.`)
      ayudas.slice(0, 2).forEach((a) => l.push(`- ${a.titulo}`))
    }
    if (conv.length) {
      l.push('')
      l.push('*Se buscan voluntarios*')
      conv.forEach((c) => l.push(`- ${c.titulo} (${fechaCorta(c.fecha)}, ${c.cupos - c.inscritos} cupos)`))
    }
    if (resuelta) {
      l.push('')
      l.push(`*Respuesta del municipio:* ${resuelta.titulo}. ${resuelta.respuesta}`)
    }
    l.push('')
    l.push('Entra a Barrio Vivo para participar.')
    return l.join('\n')
  }, [s, junta, nivel.nivel])

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
          <Link to="/directiva/participacion" className="card" style={{ padding: 10, textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
            <p className="xs muted">Sello</p>
            <SelloNivel nivel={nivel.nivel} size={30} />
            <p className="xs bold">{nivel.nivel}</p>
          </Link>
        </div>

        <div className="row">
          <button className="btn btn-sol" onClick={() => setResumen(true)}>
            <Icon name="enviar" size={18} /> Resumen semanal
          </button>
          <button className="btn btn-borde" onClick={() => setAviso(true)}>
            <Icon name="megafono" size={18} /> Publicar aviso
          </button>
        </div>

        {(pendientes > 0 || docsAlerta > 0 || propuestas > 0 || horasPend.length > 0) && (
          <div className="stack-sm">
            {horasPend.length > 0 && (
              <Link to="/directiva/gestion?tab=horas" className="lista-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="doc-ico" style={{ background: 'var(--verde-claro)', color: 'var(--verde)' }}><Icon name="reloj" size={20} /></span>
                <span className="grow small"><b>{horasPend.reduce((n, h) => n + h.horas, 0)} horas de voluntariado</b> por revisar antes de certificarlas.</span>
              </Link>
            )}
            {propuestas > 0 && (
              <Link to="/directiva/actividades" className="lista-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="doc-ico" style={{ background: 'var(--sol)', color: 'var(--tinta)' }}><Icon name="joven" size={20} /></span>
                <span className="grow small"><b>{propuestas} propuestas juveniles</b> esperan tu respuesta.</span>
              </Link>
            )}
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

        <section className="card stack-sm" aria-labelledby="venc-t">
          <h2 id="venc-t" className="card-titulo" style={{ fontSize: 17 }}>Lo que viene</h2>
          {venc.map((v) => (
            <Link key={v.titulo + v.fecha} to={v.to ?? '/directiva'} className="vence" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span className="vence-dias" data-nivel={v.dias <= 15 ? 'alta' : v.dias <= 45 ? 'media' : 'baja'}>
                <b>{v.dias}</b>{v.dias === 1 ? 'día' : 'días'}
              </span>
              <span className="grow">
                <span className="small bold" style={{ display: 'block' }}>{v.titulo}</span>
                <span className="xs muted">{fechaCorta(v.fecha)} · {v.detalle}</span>
              </span>
              <Icon name="derecha" size={16} />
            </Link>
          ))}
        </section>

        {nivel.falta.length > 0 && (
          <div className="card stack-sm" style={{ background: 'var(--verde-claro)', border: 'none' }}>
            <p className="bold small">Para subir al siguiente sello</p>
            <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>
              {nivel.falta.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </div>
        )}

        {enc && (
          <section className="card stack-sm" aria-labelledby="enc-t">
            <div className="between">
              <h2 id="enc-t" className="card-titulo" style={{ fontSize: 17 }}>Encuesta de barrio</h2>
              <span className="xs muted">{enc.respuestas} respuestas · cierra {fechaCorta(ENCUESTA.cierre)}</span>
            </div>
            <ResultadoEncuesta y2025={enc.y2025} y2026={enc.y2026} />
          </section>
        )}

        <section className="card" aria-labelledby="radar-t">
          <div className="between">
            <h2 id="radar-t" className="card-titulo" style={{ fontSize: 17 }}>Radar de la junta</h2>
            <span className="xs muted">{fila.actividades} actividades · {fila.ayudas} ayudas</span>
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
            Una actividad en alianza suma +{REGLAS.alianza}, y si un 30% de los asistentes son jóvenes, +{REGLAS.juvenil} más. Te acerca al {debil.premio}.
          </p>
        </div>

        <section className="card stack-sm" aria-labelledby="joven-t" style={{ background: 'var(--tinta)', color: '#fff', border: 'none' }}>
          <h2 id="joven-t" className="card-titulo" style={{ fontSize: 17 }}>Jóvenes en tu junta</h2>
          <div className="between">
            <div>
              <p className="num" style={{ fontSize: 30, color: 'var(--sol)' }}>{fila.registrados ? pct(fila.jovenes / fila.registrados) : '0%'}</p>
              <p className="xs" style={{ color: 'var(--gris-claro)' }}>de los asistentes tiene entre 14 y 29 años</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="num" style={{ fontSize: 30 }}>{posJuv}°</p>
              <p className="xs" style={{ color: 'var(--gris-claro)' }}>Premio Juventud</p>
            </div>
          </div>
          <Bar value={fila.registrados ? (fila.jovenes / fila.registrados / 0.3) * 100 : 0} color="var(--sol)" track="var(--tinta-2)" height={8} />
          <p className="xs" style={{ color: 'var(--gris-claro)' }}>La meta de renovación es que al menos un 30% de los asistentes sean jóvenes.</p>
        </section>

        <section className="card stack-sm" aria-labelledby="ivc-t">
          <h2 id="ivc-t" className="card-titulo" style={{ fontSize: 17 }}>Índice de vitalidad</h2>
          <p className="xs muted">Solo lo ven la directiva y el municipio.</p>
          {[
            ['Participación', ivc.participacion],
            ['Diversidad de áreas', ivc.diversidad],
            ['Constancia mensual', ivc.constancia],
            ['Renovación generacional', ivc.renovacion],
            ['Colaboración', ivc.colaboracion],
            ['Gestión y documentos', ivc.gestion],
          ].map(([l, v]) => (
            <div key={l as string} className="resultado">
              <div className="between small"><span>{l}</span><b>{v}</b></div>
              <Bar value={v as number} height={8} />
            </div>
          ))}
        </section>

        <Link to="/directiva/actividades/nueva" className="btn btn-block">
          <Icon name="mas" size={18} /> Registrar actividad
        </Link>
        <p className="xs muted" style={{ textAlign: 'center' }}>Las áreas: {AREAS.map((a) => a.corto).join(' · ')}</p>
      </div>

      <NuevaAlertaModal open={aviso} onClose={() => setAviso(false)} juntaId={junta.id} autor="Directiva" oficial />

      <Modal open={resumen} onClose={() => setResumen(false)} title="Resumen semanal">
        <div className="modal-body">
          <p className="small muted">Se arma solo con lo de la semana. Cópialo y pégalo en el grupo de WhatsApp de la junta.</p>
          <div className="whatsapp-box" id="resumen-texto">{textoResumen}</div>
          <button
            className="btn btn-block"
            onClick={() => {
              navigator.clipboard
                ?.writeText(textoResumen)
                .then(() => toast('Resumen copiado. Pégalo en WhatsApp'))
                .catch(() => {
                  const el = document.getElementById('resumen-texto')
                  if (el) window.getSelection()?.selectAllChildren(el)
                  toast('Texto seleccionado: cópialo con Ctrl + C')
                })
            }}
          >
            <Icon name="copiar" size={18} /> Copiar resumen
          </button>
          <p className="xs muted">En la versión final se envía solo cada lunes a quienes lo activen.</p>
        </div>
      </Modal>
    </>
  )
}

function radarDe(fila: ReturnType<typeof useTabla>[number]) {
  const max = Math.max(1, ...AREAS.map((a) => fila.porArea[a.id]))
  return AREAS.map((a) => fila.porArea[a.id] / max)
}
