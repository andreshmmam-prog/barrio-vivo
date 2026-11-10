import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CONVENIO_CERTIFICADO, HOY, VECINOS } from '../data/demo'
import { Logo } from '../components/ui'
import { codigoCertificado } from '../components/certificado'
import { fechaLarga } from '../lib/scoring'
import { useStore } from '../state/store'

/** Página pública: quien recibe un certificado (un liceo, una universidad, un empleador) comprueba que es auténtico. */
export default function Verificar() {
  const { codigo } = useParams()
  const nav = useNavigate()
  const { s } = useStore()
  const [texto, setTexto] = useState(codigo ?? '')
  const v = VECINOS.find((x) => codigoCertificado(x) === (codigo ?? '').toUpperCase())
  const junta = v && s.juntas.find((j) => j.id === v.juntaId)
  const horas = v ? v.horasBase + s.horas.filter((h) => h.vecinoId === v.id && h.estado === 'aprobada').reduce((n, h) => n + h.horas, 0) : 0

  return (
    <main className="verificar">
      <div className="marca" style={{ color: 'var(--verde)' }}><Logo size={28} /> Barrio Vivo</div>
      <h1>Verificar un certificado de voluntariado</h1>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault()
          nav(`/verificar/${texto.trim().toUpperCase()}`)
        }}
      >
        <label className="field" style={{ flex: 1 }}>
          Código del certificado
          <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="BV-..." />
        </label>
        <button className="btn" style={{ alignSelf: 'flex-end', flex: 'none' }}>Verificar</button>
      </form>
      {codigo && (v && junta ? (
        <section className="card stack-sm" style={{ borderColor: 'var(--verde)', borderWidth: 2 }}>
          <p className="bold" style={{ color: 'var(--verde)' }}>✓ Certificado válido</p>
          <p><b>{v.nombre}</b> registra <b>{horas} horas</b> de voluntariado comunitario certificadas por la Junta de Vecinos {junta.nombre} ({junta.unidadVecinal}).</p>
          <p className="small">Firmado por {junta.directiva.filter((d) => d.cargo !== 'Tesorería').map((d) => `${d.nombre} (${d.cargo.toLowerCase()})`).join(' y ')}{CONVENIO_CERTIFICADO.activo ? ` y ${CONVENIO_CERTIFICADO.unidad}, ${CONVENIO_CERTIFICADO.comuna}` : ''}.</p>
          <p className="xs muted">Consultado el {fechaLarga(HOY)}. Las horas pueden aumentar si la persona sigue participando.</p>
        </section>
      ) : (
        <section className="card" style={{ borderColor: 'var(--rojo)' }}>
          <p className="bold" style={{ color: 'var(--rojo-tinta)' }}>No encontramos un certificado con ese código.</p>
        </section>
      ))}
      <p className="xs muted">Prueba con BV-AROMOS-MARTA o BV-AROMOS-JAVIERA. <Link to="/">Volver al inicio</Link></p>
    </main>
  )
}
