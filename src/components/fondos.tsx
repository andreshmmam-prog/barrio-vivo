// Catálogo de fondos: lo mantienen el equipo de Barrio Vivo (fondos del Estado y privados)
// y el municipio (sus propios fondos), siempre desde las bases oficiales.
import { useState } from 'react'
import { AREAS, AREA_BY_ID, type AreaId } from '../data/areas'
import { HOY, REQUISITOS } from '../data/demo'
import type { Fondo } from '../data/types'
import { diasEntre, fechaCorta } from '../lib/scoring'
import { useStore } from '../state/store'
import { Chip, Modal } from './ui'

const JUNTA_DEMO = 'aromos'
const ESTADO = { postulado: 'Postulado', adjudicado: 'Adjudicado', no_adjudicado: 'No adjudicado' } as const

export function CatalogoFondos({ modo }: { modo: 'admin' | 'municipio' }) {
  const { s, dispatch, toast } = useStore()
  const [nuevo, setNuevo] = useState(false)
  const lista = s.fondos.filter((f) => (modo === 'municipio' ? f.cargadoPor === 'municipio' : true)).sort((a, b) => a.cierre.localeCompare(b.cierre))
  const atrasados = lista.filter((f) => f.cierre >= HOY && diasEntre(f.revisado) > 30)
  const vacio = { nombre: '', fuente: modo === 'municipio' ? 'Municipalidad' : '', monto: '', apertura: '', cierre: '', quienes: '', bases: '', portal: '', antiguedad: 90, areas: [] as AreaId[], requisitos: [] as Fondo['requisitos'] }
  const [f, setF] = useState(vacio)
  const nombreJunta = s.juntas.find((j) => j.id === JUNTA_DEMO)?.nombre

  return (
    <>
      <section className="panel">
        <div className="between" style={{ flexWrap: 'wrap', gap: 8 }}>
          <div>
            <p className="small muted">
              {modo === 'municipio'
                ? 'Los fondos que carga el municipio llegan a todas las juntas de la comuna con su carpeta lista para revisar.'
                : 'Cada ficha se arma desde las bases oficiales y muestra cuándo se revisó por última vez.'}
            </p>
          </div>
          <button className="btn" onClick={() => setNuevo(true)}>Cargar un fondo</button>
        </div>
        {modo === 'admin' && atrasados.length > 0 && (
          <p className="small" style={{ color: 'var(--sol-tinta)', fontWeight: 700 }}>⚠ {atrasados.length === 1 ? 'Un fondo abierto lleva' : `${atrasados.length} fondos abiertos llevan`} más de 30 días sin revisar contra sus bases.</p>
        )}
        <div className="scroll-x">
          <table className="tabla" style={{ minWidth: 900 }}>
            <thead><tr><th>Fondo</th><th>Postulación</th><th>Quién puede postular</th><th>Requisitos</th><th>Fuente</th><th>{modo === 'municipio' ? 'Postulaciones' : 'Revisión'}</th></tr></thead>
            <tbody>
              {lista.map((x) => {
                const estado = s.postulaciones[x.id]
                return (
                  <tr key={x.id}>
                    <td style={{ minWidth: 200 }}>
                      <b>{x.nombre}</b>
                      <div className="xs muted">{x.fuente} · {x.monto}</div>
                      <div className="chips" style={{ marginTop: 4 }}>
                        {x.ejemplo && <Chip tone="gris">Ejemplo</Chip>}
                        {x.fechasEstimadas && <Chip tone="sol">Fechas estimadas</Chip>}
                        {x.cierre < HOY && <Chip tone="gris">Cerrado</Chip>}
                      </div>
                    </td>
                    <td className="small" style={{ whiteSpace: 'nowrap' }}>{x.apertura ? `${fechaCorta(x.apertura)} al ` : 'Hasta el '}{fechaCorta(x.cierre)}</td>
                    <td className="small" style={{ minWidth: 200 }}>{x.quienes}</td>
                    <td className="xs" style={{ minWidth: 200 }}>
                      {x.requisitos.join(' · ')}
                      {x.antiguedadMax ? <div className="muted">Certificados de máximo {Math.round(x.antiguedadMax / 30)} meses</div> : null}
                    </td>
                    <td className="small">
                      {x.bases ? <a href={x.bases} target="_blank" rel="noreferrer">Bases</a> : <span className="muted">{x.cargadoPor === 'municipio' ? 'PDF del municipio' : 'Por cargar'}</span>}
                    </td>
                    <td className="small" style={{ minWidth: 150 }}>
                      {modo === 'admin' ? (
                        <>
                          <span style={{ color: diasEntre(x.revisado) > 30 ? 'var(--sol-tinta)' : undefined }}>{fechaCorta(x.revisado)}</span>
                          <div className="xs muted">{x.cargadoPor === 'municipio' ? 'por el municipio' : 'por Barrio Vivo'}</div>
                          <button className="link-btn" onClick={() => { dispatch({ t: 'revisarFondo', id: x.id }); toast('Ficha revisada contra las bases') }}>Revisado hoy</button>
                        </>
                      ) : estado ? (
                        <div className="stack-sm" style={{ gap: 4 }}>
                          <span>{nombreJunta}: <b>{ESTADO[estado]}</b></span>
                          {estado === 'postulado' && (
                            <span className="row">
                              <button className="btn btn-chico" onClick={() => { dispatch({ t: 'resultadoFondo', id: x.id, r: 'adjudicado' }); toast('Resultado publicado para la junta') }}>Adjudicar</button>
                              <button className="btn btn-chico btn-borde" onClick={() => { dispatch({ t: 'resultadoFondo', id: x.id, r: 'no_adjudicado' }); toast('Resultado publicado para la junta') }}>No</button>
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="muted">Sin postulaciones aún</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="xs muted">
          Fuentes para buscar fondos: las bases del municipio, el Portal de Fondos Públicos (portal.fondos.gob.cl), los gobiernos regionales y fundaciones.
          Las juntas reciben aviso 30, 15 y 5 días antes de cada cierre.
        </p>
      </section>

      <Modal open={nuevo} onClose={() => setNuevo(false)} title="Cargar un fondo desde sus bases">
        <form
          className="modal-body"
          onSubmit={(e) => {
            e.preventDefault()
            if (!f.nombre.trim() || !f.cierre || !f.areas.length) return
            dispatch({
              t: 'nuevoFondo',
              f: {
                id: `fo${Date.now()}`, nombre: f.nombre.trim(), fuente: f.fuente.trim() || 'Sin fuente', monto: f.monto.trim() || 'Por definir',
                apertura: f.apertura || undefined, cierre: f.cierre, areas: f.areas, quienes: f.quienes.trim() || 'Ver bases', requisitos: f.requisitos,
                antiguedadMax: f.antiguedad || undefined, bases: f.bases.trim() || undefined, portal: f.portal.trim() || undefined,
                revisado: HOY, cargadoPor: modo === 'municipio' ? 'municipio' : 'barrio-vivo',
              },
            })
            setF(vacio)
            setNuevo(false)
            toast('Fondo publicado. Las juntas que calzan reciben el aviso')
          }}
        >
          <label className="field">Nombre<input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} required /></label>
          <div className="row">
            <label className="field">Fuente<input value={f.fuente} onChange={(e) => setF({ ...f, fuente: e.target.value })} /></label>
            <label className="field">Monto<input value={f.monto} onChange={(e) => setF({ ...f, monto: e.target.value })} placeholder="Hasta $..." /></label>
          </div>
          <div className="row">
            <label className="field">Abre<input type="date" value={f.apertura} onChange={(e) => setF({ ...f, apertura: e.target.value })} /></label>
            <label className="field">Cierra<input type="date" value={f.cierre} onChange={(e) => setF({ ...f, cierre: e.target.value })} required /></label>
          </div>
          <label className="field">Quién puede postular (según las bases)<textarea value={f.quienes} onChange={(e) => setF({ ...f, quienes: e.target.value })} /></label>
          <label className="field">Enlace a las bases<input type="url" value={f.bases} onChange={(e) => setF({ ...f, bases: e.target.value })} placeholder="https://" /></label>
          <label className="field">Dónde se postula<input value={f.portal} onChange={(e) => setF({ ...f, portal: e.target.value })} placeholder="Portal o lugar físico" /></label>
          <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="small bold">Áreas</legend>
            <div className="chips">
              {AREAS.map((a) => {
                const on = f.areas.includes(a.id)
                return (
                  <button type="button" key={a.id} aria-pressed={on} className="chip" style={{ background: on ? a.color : AREA_BY_ID[a.id].suave, color: on ? '#fff' : a.tinta, border: 'none', cursor: 'pointer' }}
                    onClick={() => setF({ ...f, areas: on ? f.areas.filter((x) => x !== a.id) : [...f.areas, a.id] })}>{a.corto}</button>
                )
              })}
            </div>
          </fieldset>
          <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="small bold">Requisitos de las bases</legend>
            <div className="stack-sm" style={{ gap: 4 }}>
              {REQUISITOS.map((r) => (
                <label key={r} className="small" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="checkbox" checked={f.requisitos.includes(r)} onChange={(e) => setF({ ...f, requisitos: e.target.checked ? [...f.requisitos, r] : f.requisitos.filter((x) => x !== r) })} />
                  {r}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="field">Antigüedad máxima de los certificados (días)<input type="number" min={0} value={f.antiguedad} onChange={(e) => setF({ ...f, antiguedad: Math.max(0, Number(e.target.value) || 0) })} /></label>
          <button className="btn btn-block">Publicar fondo</button>
        </form>
      </Modal>
    </>
  )
}
