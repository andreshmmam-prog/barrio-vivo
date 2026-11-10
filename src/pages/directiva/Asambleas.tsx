import { useState } from 'react'
import { HOY } from '../../data/demo'
import type { Asamblea } from '../../data/types'
import { Icon } from '../../components/Icon'
import { Bar, Chip, Empty, Modal, PageTitle } from '../../components/ui'
import { quorumOk, textoActa } from '../../lib/gestion'
import { fechaCorta, fechaLarga } from '../../lib/scoring'
import { useStore } from '../../state/store'
import { JUNTA_DIRECTIVA } from './config'

/** Convocar, llevar la asamblea en vivo (quórum y acuerdos) y generar el acta. */
export default function Asambleas() {
  const { s, dispatch, toast } = useStore()
  const junta = s.juntas.find((j) => j.id === JUNTA_DIRECTIVA)!
  const lista = s.asambleas.filter((a) => a.juntaId === junta.id)
  const activa = lista.find((a) => a.estado !== 'realizada')
  const realizadas = lista.filter((a) => a.estado === 'realizada').reverse()
  const [convocar, setConvocar] = useState(false)
  const [acta, setActa] = useState<string | null>(null)
  const [nueva, setNueva] = useState({ tipo: 'ordinaria' as Asamblea['tipo'], fecha: '2026-12-19', hora: '19:00', lugar: 'Sede vecinal', tabla: '' })
  const [acuerdo, setAcuerdo] = useState({ texto: '', favor: 0, contra: 0, abstencion: 0 })
  const ver = lista.find((a) => a.id === acta)

  return (
    <>
      <PageTitle title="Asambleas" sub="Convoca, lleva el quórum y la app escribe el acta" />
      <div className="pad stack" style={{ paddingTop: 6 }}>
        {activa ? (
          <section className="card stack-sm" style={{ borderColor: 'var(--verde)', borderWidth: 2 }} aria-labelledby="as-t">
            <div className="between">
              <Chip tone={activa.estado === 'en_curso' ? 'sol' : undefined}>{activa.estado === 'en_curso' ? 'En curso' : 'Convocada'}</Chip>
              <span className="xs muted">{activa.confirmados} confirmaron en la app</span>
            </div>
            <h2 id="as-t" className="titulo" style={{ fontSize: 18 }}>Asamblea {activa.tipo} · {fechaLarga(activa.fecha)}, {activa.hora}</h2>
            <ol className="small" style={{ margin: 0, paddingLeft: 18 }}>
              {activa.tabla.map((t) => <li key={t}>{t}</li>)}
            </ol>

            {activa.estado === 'convocada' && (
              <div className="row">
                <button
                  className="btn btn-borde"
                  onClick={() => {
                    dispatch({ t: 'nuevaAlerta', a: { id: `al${Date.now()}`, juntaId: junta.id, tipo: 'oficial', titulo: `Asamblea ${activa.tipo}: ${fechaCorta(activa.fecha)}, ${activa.hora}`, texto: `En ${activa.lugar}. Tabla: ${activa.tabla.join('; ')}.`, fecha: HOY, autor: 'Directiva', comentarios: [] } })
                    toast('Citación publicada en El Queltehue avisa')
                  }}
                >
                  <Icon name="megafono" size={18} /> Citar
                </button>
                <button className="btn" onClick={() => dispatch({ t: 'iniciarAsamblea', id: activa.id })}>
                  <Icon name="play" size={18} /> Iniciar
                </button>
              </div>
            )}

            {activa.estado === 'en_curso' && (
              <>
                <div className="quorum">
                  <div className="between">
                    <span className="small bold">Asistentes</span>
                    <span className="num" style={{ fontSize: 28 }}>{activa.asistentes}</span>
                  </div>
                  <Bar value={Math.min(100, (activa.asistentes / activa.quorum) * 100)} height={10} color={quorumOk(activa) ? 'var(--verde)' : 'var(--sol)'} />
                  <p className="xs" style={{ color: quorumOk(activa) ? 'var(--verde)' : 'var(--sol-tinta)', fontWeight: 700 }}>
                    {quorumOk(activa) ? `Hay quórum (${activa.quorum} socios)` : `Faltan ${activa.quorum - activa.asistentes} para el quórum de ${activa.quorum}`}
                  </p>
                  <div className="row">
                    <button className="btn btn-borde btn-chico" onClick={() => dispatch({ t: 'asistentesAsamblea', id: activa.id, n: activa.asistentes - 1 })} aria-label="Restar un asistente">−1</button>
                    <button className="btn btn-borde btn-chico" onClick={() => dispatch({ t: 'asistentesAsamblea', id: activa.id, n: activa.asistentes + 1 })}>+1</button>
                    <button className="btn btn-chico" onClick={() => { dispatch({ t: 'asistentesAsamblea', id: activa.id, n: activa.asistentes + 7 }); toast('7 socios registrados con QR') }}>
                      <Icon name="qr" size={16} /> QR
                    </button>
                  </div>
                  <p className="xs muted">Quien no tiene celular firma la lista en papel y se suma con +1.</p>
                </div>

                <p className="small bold">Acuerdos</p>
                {activa.acuerdos.length === 0 && <p className="xs muted">Aún no hay acuerdos.</p>}
                {activa.acuerdos.map((x) => (
                  <div key={x.texto} className="small" style={{ borderTop: '1px solid var(--linea)', paddingTop: 6 }}>
                    <b>{x.texto}</b>
                    <div className="xs muted">A favor {x.favor} · en contra {x.contra} · abstenciones {x.abstencion} · {x.favor > x.contra ? 'Aprobado' : 'Rechazado'}</div>
                  </div>
                ))}
                <form
                  className="stack-sm"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!acuerdo.texto.trim()) return
                    dispatch({ t: 'acuerdo', id: activa.id, a: { ...acuerdo, texto: acuerdo.texto.trim() } })
                    setAcuerdo({ texto: '', favor: 0, contra: 0, abstencion: 0 })
                  }}
                >
                  <label className="field">Nuevo acuerdo<input value={acuerdo.texto} onChange={(e) => setAcuerdo({ ...acuerdo, texto: e.target.value })} placeholder="Ej: Usar el fondo vecinal en el techo de la sede" /></label>
                  <div className="row votos-acuerdo">
                    {(['favor', 'contra', 'abstencion'] as const).map((k) => (
                      <label key={k} className="field">
                        {k === 'favor' ? 'A favor' : k === 'contra' ? 'En contra' : 'Abst.'}
                        <input type="number" min={0} value={acuerdo[k]} onChange={(e) => setAcuerdo({ ...acuerdo, [k]: Math.max(0, Number(e.target.value) || 0) })} />
                      </label>
                    ))}
                  </div>
                  <button className="btn btn-borde btn-chico">Agregar acuerdo</button>
                </form>
                <button
                  className="btn btn-sol btn-block"
                  onClick={() => {
                    dispatch({ t: 'cerrarAsamblea', id: activa.id })
                    setActa(activa.id)
                    toast('Acta generada y guardada en Documentos')
                  }}
                >
                  <Icon name="documento" size={18} /> Cerrar y generar el acta
                </button>
              </>
            )}
          </section>
        ) : (
          <Empty>No hay asambleas convocadas.</Empty>
        )}

        <button className="btn btn-punteado btn-block" onClick={() => setConvocar(true)}>
          <Icon name="mas" size={18} /> Convocar una asamblea
        </button>

        <div className="seccion"><h2>Actas</h2></div>
        {realizadas.map((a) => (
          <button key={a.id} className="lista-item" style={{ width: '100%', textAlign: 'left' }} onClick={() => setActa(a.id)}>
            <span className="doc-ico"><Icon name="documento" size={20} /></span>
            <span className="grow">
              <span className="small bold" style={{ display: 'block' }}>Asamblea {a.tipo} · {fechaCorta(a.fecha)}</span>
              <span className="xs muted">{a.asistentes} socios · {a.acuerdos.length} acuerdos{quorumOk(a) ? '' : ' · sin quórum'}</span>
            </span>
            <Icon name="derecha" size={18} />
          </button>
        ))}
      </div>

      <Modal open={!!ver} onClose={() => setActa(null)} title="Acta de la asamblea">
        {ver && (
          <div className="modal-body">
            <pre className="acta">{textoActa(ver, junta.nombre, junta.directiva)}</pre>
            <p className="xs muted">Queda en Documentos y los socios la ven en la app. Se imprime para la firma de presidencia y secretaría.</p>
            <button className="btn btn-block" onClick={() => window.print()}><Icon name="descargar" size={18} /> Imprimir para firmar</button>
          </div>
        )}
      </Modal>

      <Modal open={convocar} onClose={() => setConvocar(false)} title="Convocar asamblea">
        <form
          className="modal-body"
          onSubmit={(e) => {
            e.preventDefault()
            const tabla = nueva.tabla.split('\n').map((x) => x.trim()).filter(Boolean)
            if (!tabla.length) return
            dispatch({ t: 'nuevaAsamblea', a: { id: `as${Date.now()}`, juntaId: junta.id, tipo: nueva.tipo, fecha: nueva.fecha, hora: nueva.hora, lugar: nueva.lugar, tabla, quorum: Math.ceil(junta.socios * 0.2), estado: 'convocada', asistentes: 0, acuerdos: [], vanIds: [], confirmados: 0 } })
            setConvocar(false)
            toast('Asamblea convocada. Ahora cítala para que llegue a los vecinos')
          }}
        >
          <label className="field">Tipo
            <select value={nueva.tipo} onChange={(e) => setNueva({ ...nueva, tipo: e.target.value as Asamblea['tipo'] })}>
              <option value="ordinaria">Ordinaria</option>
              <option value="extraordinaria">Extraordinaria</option>
            </select>
          </label>
          <div className="row">
            <label className="field">Fecha<input type="date" min={HOY} value={nueva.fecha} onChange={(e) => setNueva({ ...nueva, fecha: e.target.value })} /></label>
            <label className="field">Hora<input type="time" value={nueva.hora} onChange={(e) => setNueva({ ...nueva, hora: e.target.value })} /></label>
          </div>
          <label className="field">Lugar<input value={nueva.lugar} onChange={(e) => setNueva({ ...nueva, lugar: e.target.value })} /></label>
          <label className="field">Tabla (un tema por línea)<textarea value={nueva.tabla} onChange={(e) => setNueva({ ...nueva, tabla: e.target.value })} placeholder={'Cuenta de tesorería\nProyecto para el fondo vecinal'} required /></label>
          <p className="xs muted">Quórum de ejemplo: 20% de los socios. Se ajusta a lo que digan los estatutos de la junta.</p>
          <button className="btn btn-block">Convocar</button>
        </form>
      </Modal>
    </>
  )
}
