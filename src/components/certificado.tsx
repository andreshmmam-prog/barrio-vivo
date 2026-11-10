// Certificado de voluntariado: lo emite la junta (y el municipio con convenio). Barrio Vivo respalda el registro.
import { CONVENIO_CERTIFICADO, HOY, TEMPORADA } from '../data/demo'
import type { Junta, RegistroHora, Vecino } from '../data/types'
import { fechaLarga } from '../lib/scoring'
import { Icon } from './Icon'

export const codigoCertificado = (v: Pick<Vecino, 'id' | 'juntaId'>) => `BV-${v.juntaId.toUpperCase()}-${v.id.toUpperCase()}`

/** Cuadro decorativo tipo QR generado desde el código (en el piloto: QR real al enlace de verificación). */
export function CodigoQR({ codigo, size = 72 }: { codigo: string; size?: number }) {
  let h = 7
  const celdas: boolean[] = []
  for (let i = 0; i < 81; i++) {
    h = (h * 31 + codigo.charCodeAt(i % codigo.length) + i) % 1009
    celdas.push(h % 3 !== 0)
  }
  const esquina = (x: number, y: number) => (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5)
  return (
    <svg width={size} height={size} viewBox="0 0 9 9" role="img" aria-label={`Código de verificación ${codigo}`} shapeRendering="crispEdges">
      <rect width="9" height="9" fill="#fff" />
      {celdas.map((on, i) => {
        const x = i % 9
        const y = Math.floor(i / 9)
        const fill = esquina(x, y) ? !(x % 8 === 1 || y % 8 === 1) || (x === 1 && y === 1) || (x === 7 && y === 1) || (x === 1 && y === 7) : on
        return fill ? <rect key={i} x={x} y={y} width="1" height="1" fill="#1E2B25" /> : null
      })}
    </svg>
  )
}

const ORIGEN: Record<RegistroHora['origen'], string> = {
  convocatoria: 'Convocatorias de voluntariado',
  ayuda: 'Ayudas entre vecinos (Manos Vecinas)',
  actividad: 'Actividades de la junta',
  embajador: 'Embajador digital',
}

export function Certificado({ v, junta, horas, base, aprobadas }: { v: Vecino; junta: Junta; horas: number; base: number; aprobadas: RegistroHora[] }) {
  const pres = junta.directiva.find((d) => d.cargo === 'Presidencia')?.nombre
  const sec = junta.directiva.find((d) => d.cargo === 'Secretaría')?.nombre
  const codigo = codigoCertificado(v)
  const porOrigen = Object.entries(
    aprobadas.reduce<Record<string, number>>((m, h) => ({ ...m, [h.origen]: (m[h.origen] ?? 0) + h.horas }), {}),
  )
  return (
    <div className="certificado">
      <Icon name="trofeo" size={32} />
      <p className="xs bold muted" style={{ letterSpacing: 1 }}>LA JUNTA DE VECINOS {junta.nombre.toUpperCase()}</p>
      <p className="xs muted">{junta.unidadVecinal} · personalidad jurídica vigente</p>
      <p className="small" style={{ marginTop: 6 }}>certifica que</p>
      <h3>{v.nombre}</h3>
      <p className="small">realizó voluntariado comunitario en esta organización por</p>
      <p className="num">{horas} horas</p>
      <table className="cert-detalle">
        <tbody>
          {base > 0 && <tr><td>Registro anterior a la {TEMPORADA.nombre.toLowerCase()}</td><td>{base} h</td></tr>}
          {porOrigen.map(([o, n]) => <tr key={o}><td>{ORIGEN[o as RegistroHora['origen']]}</td><td>{n} h</td></tr>)}
        </tbody>
      </table>
      <p className="xs muted">Solo incluye horas con asistencia registrada y revisadas por la directiva.</p>
      <div className="firmas">
        <div><span /><b>{pres}</b><small>Presidencia</small></div>
        <div><span /><b>{sec}</b><small>Secretaría</small></div>
        {CONVENIO_CERTIFICADO.activo && <div><span /><b>{CONVENIO_CERTIFICADO.unidad}</b><small>{CONVENIO_CERTIFICADO.comuna}</small></div>}
      </div>
      <div className="cert-pie">
        <CodigoQR codigo={codigo} />
        <div style={{ textAlign: 'left' }}>
          <p className="xs">Emitido el {fechaLarga(HOY)}</p>
          <p className="xs bold">Código {codigo}</p>
          <p className="xs muted">Verifícalo en barriovivo.cl/verificar. Registro respaldado por Barrio Vivo.</p>
        </div>
      </div>
    </div>
  )
}
