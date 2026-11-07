import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { Chip, Modal, PageTitle } from '../../components/ui'
import { useVecino } from '../../lib/hooks'
import { useStore } from '../../state/store'

const RUBROS = ['Todo', 'Comida', 'Servicios', 'Artesanía']

/** Directorio de emprendedores: sin ventas dentro de la app, solo quién vende qué y cómo contactarlo. */
export default function Emprendedores() {
  const { s, dispatch, toast } = useStore()
  const v = useVecino()
  const [rubro, setRubro] = useState('Todo')
  const [visto, setVisto] = useState<string | null>(null)
  const [nuevo, setNuevo] = useState(false)
  const [form, setForm] = useState({ nombre: '', precio: '', rubro: 'Comida', descripcion: '', contacto: '' })
  const lista = s.emprendedores.filter((e) => e.juntaId === v.juntaId && (rubro === 'Todo' || e.rubro === rubro))

  return (
    <>
      <PageTitle title="Emprendedores" sub="Compra en tu barrio. Contacta directo a tu vecino." back="/vecino" />
      <div className="pad stack" style={{ paddingTop: 6 }}>
        <div className="filtro-chips" role="group" aria-label="Rubros">
          {RUBROS.map((r) => (
            <button key={r} aria-pressed={rubro === r} onClick={() => setRubro(r)}>{r}</button>
          ))}
        </div>
        {lista.map((e) => (
          <article key={e.id} className="card stack-sm">
            <div className="between">
              <span className="bold" style={{ fontSize: 16 }}>{e.nombre}</span>
              {e.estado === 'revision' ? <Chip tone="sol">En revisión</Chip> : <Chip tone="gris">{e.rubro}</Chip>}
            </div>
            <p className="small">{e.descripcion}</p>
            <div className="between">
              <span className="small muted">{e.vendedor}</span>
              <span className="num" style={{ fontSize: 16 }}>{e.precio}</span>
            </div>
            {visto === e.id ? (
              <p className="small" style={{ background: 'var(--verde-claro)', borderRadius: 10, padding: '8px 12px', userSelect: 'all' }}>
                Contacto: <b>{e.contacto}</b>
              </p>
            ) : (
              <button className="btn btn-borde btn-chico" onClick={() => setVisto(e.id)}>Ver contacto</button>
            )}
          </article>
        ))}
        <button className="btn btn-punteado btn-block" onClick={() => setNuevo(true)}>
          <Icon name="mas" size={18} /> Sumar mi emprendimiento
        </button>
        <p className="xs muted" style={{ textAlign: 'center' }}>Barrio Vivo no cobra ni intermedia las ventas.</p>
      </div>

      <Modal open={nuevo} onClose={() => setNuevo(false)} title="Sumar mi emprendimiento">
        <form
          className="modal-body"
          onSubmit={(ev) => {
            ev.preventDefault()
            if (!form.nombre.trim() || !form.contacto.trim()) return
            dispatch({
              t: 'nuevoEmprendedor',
              e: { id: `e${Date.now()}`, juntaId: v.juntaId, vendedor: v.corto, estado: 'revision', nombre: form.nombre.trim(), rubro: form.rubro, precio: form.precio || 'A convenir', descripcion: form.descripcion || 'Sin descripción', contacto: form.contacto.trim() },
            })
            setForm({ nombre: '', precio: '', rubro: 'Comida', descripcion: '', contacto: '' })
            setNuevo(false)
            toast('Enviado. Aparecerá cuando la administración lo revise')
          }}
        >
          <label className="field">
            ¿Qué ofreces?
            <input value={form.nombre} onChange={(ev) => setForm({ ...form, nombre: ev.target.value })} required />
          </label>
          <div className="row">
            <label className="field">
              Precio referencial
              <input value={form.precio} onChange={(ev) => setForm({ ...form, precio: ev.target.value })} placeholder="$" />
            </label>
            <label className="field">
              Rubro
              <select value={form.rubro} onChange={(ev) => setForm({ ...form, rubro: ev.target.value })}>
                {RUBROS.slice(1).map((r) => <option key={r}>{r}</option>)}
              </select>
            </label>
          </div>
          <label className="field">
            Descripción
            <textarea value={form.descripcion} onChange={(ev) => setForm({ ...form, descripcion: ev.target.value })} placeholder="Cómo pedir, dónde retirar" />
          </label>
          <label className="field">
            Teléfono o WhatsApp de contacto
            <input value={form.contacto} onChange={(ev) => setForm({ ...form, contacto: ev.target.value })} placeholder="+56 9" required />
          </label>
          <button className="btn btn-block">Enviar</button>
        </form>
      </Modal>
    </>
  )
}
