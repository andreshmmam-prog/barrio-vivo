// Piezas compartidas: comentarios cortos y El Queltehue avisa.
import { useState } from 'react'
import { HOY } from '../data/demo'
import type { Alerta, Comentario, TipoAlerta } from '../data/types'
import { fechaCorta } from '../lib/scoring'
import { useStore } from '../state/store'
import { Icon } from './Icon'
import { Modal } from './ui'

/** Comentarios cortos: reemplazan al foro abierto. */
export function Comentarios({ lista, onEnviar, id }: { lista: Comentario[]; onEnviar: (texto: string) => void; id: string }) {
  const [texto, setTexto] = useState('')
  return (
    <div className="stack-sm">
      {lista.map((c, i) => (
        <div key={i} className="comentario">
          <p className="xs bold">{c.autor}</p>
          <p className="small">{c.texto}</p>
        </div>
      ))}
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault()
          if (!texto.trim()) return
          onEnviar(texto.trim().slice(0, 200))
          setTexto('')
        }}
      >
        <label className="sr-only" htmlFor={`c-${id}`}>Comentar</label>
        <input id={`c-${id}`} className="input-corto" value={texto} maxLength={200} onChange={(e) => setTexto(e.target.value)} placeholder="Comenta en una línea" />
        <button className="btn btn-chico" style={{ flex: 'none', minHeight: 44 }}>Enviar</button>
      </form>
    </div>
  )
}

export const TIPOS_ALERTA: Record<TipoAlerta, { label: string; icono: string; color: string; fondo: string }> = {
  oficial: { label: 'Directiva', icono: 'megafono', color: '#FFFFFF', fondo: '#1D6B4E' },
  corte: { label: 'Corte de servicio', icono: 'gota', color: '#1D4688', fondo: '#E4ECFA' },
  operativo: { label: 'Operativo', icono: 'salud', color: '#0E5A4F', fondo: '#DDF1EE' },
  mascota: { label: 'Mascota', icono: 'pata', color: '#8F3A14', fondo: '#FBEADF' },
  transito: { label: 'Tránsito', icono: 'cono', color: '#6B4700', fondo: '#FFF4D6' },
  seguridad: { label: 'Seguridad', icono: 'escudo', color: '#2E3259', fondo: '#E5E6F0' },
  emergencia: { label: 'Emergencia', icono: 'alerta', color: '#FFFFFF', fondo: '#B4322A' },
}

export function AlertaCard({ a, autor }: { a: Alerta; autor: string }) {
  const { dispatch } = useStore()
  const [open, setOpen] = useState(false)
  const t = TIPOS_ALERTA[a.tipo]
  return (
    <article className="card stack-sm" style={a.tipo === 'oficial' ? { borderColor: 'var(--verde)', borderWidth: 2 } : undefined}>
      <div className="lista-item" style={{ border: 'none', padding: 0, alignItems: 'flex-start' }}>
        <span className="area-icon" style={{ width: 40, height: 40, background: t.fondo, color: t.color, borderRadius: 12 }}>
          <Icon name={t.icono} size={20} />
        </span>
        <div className="grow">
          <p className="xs bold" style={{ color: 'var(--gris)' }}>{t.label.toUpperCase()} · {fechaCorta(a.fecha)}</p>
          <p className="titulo">{a.titulo}</p>
          <p className="small" style={{ marginTop: 2 }}>{a.texto}</p>
          <p className="xs muted" style={{ marginTop: 4 }}>{a.autor}</p>
        </div>
      </div>
      <button className="link-btn" onClick={() => setOpen(!open)} aria-expanded={open}>
        <Icon name="comentario" size={16} /> {a.comentarios.length ? `${a.comentarios.length} ${a.comentarios.length === 1 ? 'comentario' : 'comentarios'}` : 'Comentar'}
      </button>
      {open && <Comentarios id={a.id} lista={a.comentarios} onEnviar={(texto) => dispatch({ t: 'comentarAlerta', id: a.id, autor, texto })} />}
    </article>
  )
}

const TIPOS_VECINO: TipoAlerta[] = ['mascota', 'corte', 'transito', 'operativo', 'seguridad', 'emergencia']

/** Publicar en El Queltehue avisa. La directiva publica avisos oficiales. */
export function NuevaAlertaModal({ open, onClose, juntaId, autor, oficial = false }: { open: boolean; onClose: () => void; juntaId: string; autor: string; oficial?: boolean }) {
  const { dispatch, toast } = useStore()
  const [tipo, setTipo] = useState<TipoAlerta>(oficial ? 'oficial' : 'mascota')
  const [titulo, setTitulo] = useState('')
  const [texto, setTexto] = useState('')
  const [acepto, setAcepto] = useState(false)
  const sensible = tipo === 'seguridad' || tipo === 'emergencia'

  return (
    <Modal open={open} onClose={onClose} title={oficial ? 'Aviso oficial de la directiva' : 'Avisar al barrio'}>
      <form
        className="modal-body"
        onSubmit={(e) => {
          e.preventDefault()
          if (!titulo.trim() || (sensible && !acepto)) return
          dispatch({ t: 'nuevaAlerta', a: { id: `al${Date.now()}`, juntaId, tipo, titulo: titulo.trim(), texto: texto.trim(), fecha: HOY, autor, comentarios: [] } })
          setTitulo('')
          setTexto('')
          setAcepto(false)
          onClose()
          toast('Aviso publicado en El Queltehue avisa')
        }}
      >
        {!oficial && (
          <label className="field">
            Tipo de aviso
            <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoAlerta)}>
              {TIPOS_VECINO.map((x) => (
                <option key={x} value={x}>{TIPOS_ALERTA[x].label}</option>
              ))}
            </select>
          </label>
        )}
        {sensible && (
          <div className="regla">
            <p className="bold small">Antes de publicar</p>
            <ul className="small">
              <li>Informa solo hechos: qué pasó, dónde y cuándo.</li>
              <li>No publiques fotos, nombres ni descripciones de personas.</li>
              <li>Si hay una emergencia en curso, llama primero al <b>133</b>.</li>
            </ul>
          </div>
        )}
        <label className="field">
          Título
          <input value={titulo} maxLength={80} onChange={(e) => setTitulo(e.target.value)} placeholder={oficial ? 'Ej: Asamblea extraordinaria' : 'Ej: Se perdió un gato gris'} required />
        </label>
        <label className="field">
          Detalle
          <textarea value={texto} maxLength={280} onChange={(e) => setTexto(e.target.value)} placeholder="Dónde, cuándo y qué hacer" />
          <small>Máximo 280 caracteres.</small>
        </label>
        {sensible && (
          <label className="check-row">
            <span className="small bold">Informo un hecho y no incluyo datos de personas</span>
            <input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} />
          </label>
        )}
        <button className="btn btn-block" disabled={sensible && !acepto}>Publicar aviso</button>
      </form>
    </Modal>
  )
}
