import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AREAS, AREA_BY_ID } from '../../data/areas'
import { EMERGENCIAS, TEMPORADA } from '../../data/demo'
import { Icon } from '../../components/Icon'
import { AlertaCard, NuevaAlertaModal } from '../../components/comunidad'
import { AreaChip, Chip, Logo, SelloNivel } from '../../components/ui'
import { useNiveles, useTabla, useVecino } from '../../lib/hooks'
import { areaMasDebil, esVerificada, fechaCorta, miles, puntosPorActividad } from '../../lib/scoring'
import { useStore } from '../../state/store'

export default function Inicio() {
  const { s } = useStore()
  const tabla = useTabla()
  const v = useVecino()
  const junta = v.junta
  const fila = tabla.find((f) => f.junta.id === junta.id)!
  const nivel = useNiveles().get(junta.id)!
  const debil = areaMasDebil(fila)
  const fuertes = [...AREAS].sort((a, b) => fila.porArea[b.id] - fila.porArea[a.id]).slice(0, 2)
  const pts = puntosPorActividad(s.actividades)
  const recientes = s.actividades.filter((a) => (a.juntaId === junta.id || a.alianzaCon === junta.id) && a.estado === 'aprobada').slice(0, 3)
  const consulta = s.consultas.find((c) => c.juntaId === junta.id && c.votoDe[v.id] === undefined)
  const alertas = s.alertas.filter((a) => a.juntaId === junta.id).sort((a, b) => b.fecha.localeCompare(a.fecha))
  const piden = s.ayudas.filter((a) => a.juntaId === junta.id && a.tipo === 'pide' && a.estado === 'abierta').length
  const nombre = (id?: string) => s.juntas.find((j) => j.id === id)?.nombre
  const [avisar, setAvisar] = useState(false)
  const [verTodas, setVerTodas] = useState(false)

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
          <p className="saludo">Hola, {v.nombre.split(' ')[0]}</p>
          <h1>JJVV {junta.nombre}</h1>
        </div>
      </div>

      <Link to="/vecino/tabla" className="flotante stack" style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}>
        <div className="between">
          <div>
            <p className="small muted">Puntos de tu junta · {TEMPORADA.nombre}</p>
            <p className="num" style={{ fontSize: 30 }}>{miles(fila.total)}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <SelloNivel nivel={nivel.nivel} size={52} />
            <p className="xs bold">Nivel {nivel.nivel}</p>
          </div>
        </div>
        <div className="franja" aria-hidden="true">
          {AREAS.map((a) => (
            <span key={a.id} style={{ flex: Math.max(1, fila.porArea[a.id]), background: a.color }} />
          ))}
        </div>
        <p className="small muted">
          Fuertes en {fuertes.map((f) => f.corto.toLowerCase()).join(' y ')}. <b style={{ color: debil.tinta }}>{debil.corto} es el área a reforzar.</b>
        </p>
      </Link>

      <div className="pad stack">
        <nav className="emergencias-fila" aria-label="Números de emergencia">
          {EMERGENCIAS.map((e) => (
            <a key={e.numero} href={`tel:${e.numero}`}>
              <span className="num">{e.numero}</span>
              <span>{e.nombre}</span>
            </a>
          ))}
        </nav>

        <div className="accesos">
          <Link className="acceso" to="/vecino/manos">
            <span><Icon name="manos" /></span>
            <span>Pedir ayuda</span>
          </Link>
          <Link className="acceso" to="/vecino/participa">
            <span><Icon name="voto" /></span>
            <span>Consultas</span>
          </Link>
          <Link className="acceso" to="/vecino/emprendedores">
            <span><Icon name="mercado" /></span>
            <span>Emprendedores</span>
          </Link>
          <button className="acceso" onClick={() => setAvisar(true)}>
            <span style={{ background: 'var(--sol-suave)', color: 'var(--sol-tinta)' }}><Icon name="megafono" /></span>
            <span>Avisar</span>
          </button>
        </div>

        {consulta && (
          <Link to="/vecino/participa" className="lista-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="area-icon" style={{ width: 44, height: 44, background: 'var(--verde)' }}>
              <Icon name="voto" size={22} />
            </span>
            <div className="grow">
              <p className="titulo">Consulta abierta: {consulta.pregunta}</p>
              <p className="small muted">Cierra el {fechaCorta(consulta.cierre)}</p>
            </div>
            <Icon name="derecha" size={18} />
          </Link>
        )}

        {piden > 0 && (
          <Link to="/vecino/manos" className="lista-item" style={{ textDecoration: 'none', color: 'inherit', background: 'var(--sol-suave)', borderColor: 'var(--sol)' }}>
            <span className="area-icon" style={{ width: 44, height: 44, background: 'var(--sol)', color: 'var(--tinta)' }}>
              <Icon name="manos" size={22} />
            </span>
            <div className="grow">
              <p className="titulo">{piden} vecinos necesitan una mano</p>
              <p className="small muted">Ayudar suma horas de voluntariado certificadas</p>
            </div>
            <Icon name="derecha" size={18} />
          </Link>
        )}

        <div className="seccion">
          <h2>El Queltehue avisa</h2>
          <button className="link-btn" onClick={() => setAvisar(true)}>
            <Icon name="mas" size={16} /> Avisar
          </button>
        </div>
        {(verTodas ? alertas : alertas.slice(0, 4)).map((a) => (
          <AlertaCard key={a.id} a={a} autor={v.corto} />
        ))}
        {alertas.length > 4 && !verTodas && (
          <button className="btn btn-borde btn-chico" onClick={() => setVerTodas(true)}>
            Ver los {alertas.length} avisos
          </button>
        )}

        <div className="seccion">
          <h2>Lo que hizo tu barrio</h2>
        </div>
        {recientes.map((a) => {
          const area = AREA_BY_ID[a.area]
          const p = pts.get(a.id)
          return (
            <article key={a.id} className="actividad-card">
              <div className="foto-ph" style={{ height: 96, background: area.suave, color: area.tinta }}>
                <Icon name={area.icono} size={36} stroke={1.5} />
              </div>
              <div className="cuerpo">
                <div className="chips">
                  <AreaChip area={a.area} />
                  {a.publico === 'jovenes' && <Chip tone="sol">Para jóvenes</Chip>}
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
      </div>

      <NuevaAlertaModal open={avisar} onClose={() => setAvisar(false)} juntaId={junta.id} autor={v.corto} />
    </>
  )
}
