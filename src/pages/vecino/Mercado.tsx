import { useState } from 'react'
import { VECINO_DEMO } from '../../data/demo'
import { Icon } from '../../components/Icon'
import { Chip, Modal, PageTitle } from '../../components/ui'
import { useStore } from '../../state/store'

const CATEGORIAS = ['Todo', 'Comida', 'Servicios', 'Artesanía']

export default function Mercado() {
  const { s, dispatch, toast } = useStore()
  const [cat, setCat] = useState('Todo')
  const [nuevo, setNuevo] = useState(false)
  const [form, setForm] = useState({ nombre: '', precio: '', categoria: 'Comida', descripcion: '' })
  const productos = s.productos.filter((p) => p.juntaId === VECINO_DEMO.juntaId && (cat === 'Todo' || p.categoria === cat))

  return (
    <>
      <PageTitle title="Mercado vecinal" sub="Compra a los emprendedores de tu barrio" />
      <div className="pad stack" style={{ paddingTop: 6 }}>
        <div className="area-picker" role="group" aria-label="Categorías">
          {CATEGORIAS.map((c) => (
            <button
              key={c}
              aria-pressed={cat === c}
              onClick={() => setCat(c)}
              style={cat === c ? { background: 'var(--verde)', color: '#fff', borderColor: 'var(--verde)' } : undefined}
            >
              {c}
            </button>
          ))}
        </div>
        {productos.map((p) => (
          <article key={p.id} className="card stack-sm">
            <div className="between">
              <span className="bold" style={{ fontSize: 16 }}>{p.nombre}</span>
              {p.estado === 'revision' ? <Chip tone="sol">En revisión</Chip> : <Chip tone="gris">{p.categoria}</Chip>}
            </div>
            <p className="small">{p.descripcion}</p>
            <div className="between">
              <span className="small muted">{p.vendedor}</span>
              <span className="num" style={{ fontSize: 17 }}>{p.precio}</span>
            </div>
            <button className="btn btn-borde btn-chico" onClick={() => toast(`Te pondremos en contacto con ${p.vendedor}`)}>
              Contactar
            </button>
          </article>
        ))}
        <button className="btn btn-punteado btn-block" onClick={() => setNuevo(true)}>
          <Icon name="mas" size={18} /> Publicar mi producto o servicio
        </button>
      </div>

      <Modal open={nuevo} onClose={() => setNuevo(false)} title="Publicar en el mercado">
        <form
          className="modal-body"
          onSubmit={(e) => {
            e.preventDefault()
            if (!form.nombre.trim()) return
            dispatch({
              t: 'nuevoProducto',
              p: { id: `pr${Date.now()}`, juntaId: VECINO_DEMO.juntaId, vendedor: VECINO_DEMO.nombre.split(' ')[0] + ' G.', estado: 'revision', ...form, precio: form.precio || 'A convenir', descripcion: form.descripcion || 'Sin descripción' },
            })
            setForm({ nombre: '', precio: '', categoria: 'Comida', descripcion: '' })
            setNuevo(false)
            toast('Publicado. Se mostrará cuando la administración lo revise')
          }}
        >
          <label className="field">
            ¿Qué ofreces?
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </label>
          <div className="row">
            <label className="field">
              Precio
              <input value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} placeholder="$" />
            </label>
            <label className="field">
              Categoría
              <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                {CATEGORIAS.slice(1).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="field">
            Descripción
            <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Cómo pedir, dónde retirar" />
          </label>
          <button className="btn btn-block">Publicar</button>
        </form>
      </Modal>
    </>
  )
}
