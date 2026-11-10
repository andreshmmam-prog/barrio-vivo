// Gestión de la junta: vencimientos, carpeta de postulación, tesorería y acta.
import { AREA_BY_ID } from '../data/areas'
import { HOY, PLAZO_RENDICION, SALDO_INICIAL } from '../data/demo'
import type { Asamblea, Documento, Fondo, RegistroHora } from '../data/types'
import type { Estado } from '../state/store'
import { diasEntre, esVerificada, fechaLarga } from './scoring'

export interface Vencimiento {
  titulo: string
  detalle: string
  fecha: string
  dias: number
  tipo: 'directiva' | 'documento' | 'fondo' | 'rendicion' | 'asamblea'
  to?: string
}

const restarDias = (iso: string, n: number) => new Date(Date.parse(iso) - n * 86400000).toISOString().slice(0, 10)

/** Lo que viene para la junta, ordenado por fecha. Nada se olvida. */
export function vencimientos(s: Estado, juntaId: string): Vencimiento[] {
  const junta = s.juntas.find((j) => j.id === juntaId)
  if (!junta) return []
  const lista: Vencimiento[] = []
  const add = (v: Omit<Vencimiento, 'dias'>) => lista.push({ ...v, dias: diasEntre(HOY, v.fecha) })

  s.documentos
    .filter((d) => d.juntaId === juntaId && d.vence)
    .forEach((d) => add({ titulo: `Renovar ${d.tipo.toLowerCase()}`, detalle: 'Lo piden todos los fondos y trámites', fecha: d.vence!, tipo: 'documento', to: '/directiva/documentos' }))

  if (s.documentos.some((d) => d.juntaId === juntaId && d.estado === 'pendiente' && d.tipo.startsWith('Rendición')))
    add({ titulo: 'Entregar la rendición del fondo 2025', detalle: 'Sin rendición no se puede postular a fondos nuevos', fecha: PLAZO_RENDICION, tipo: 'rendicion', to: '/directiva/documentos' })

  add({ titulo: 'Formar la comisión electoral', detalle: 'Sugerido: 90 días antes de la elección, según estatutos', fecha: restarDias(junta.periodoHasta, 90), tipo: 'directiva', to: '/directiva/asambleas' })
  add({ titulo: 'Vence el periodo de la directiva', detalle: 'Elección y traspaso en la app', fecha: junta.periodoHasta, tipo: 'directiva', to: '/directiva/socios' })

  s.asambleas
    .filter((a) => a.juntaId === juntaId && a.estado !== 'realizada')
    .forEach((a) => add({ titulo: `Asamblea ${a.tipo}`, detalle: `${a.hora} · ${a.lugar}`, fecha: a.fecha, tipo: 'asamblea', to: '/directiva/asambleas' }))

  s.fondos.filter((f) => !s.postulaciones[f.id]).forEach((f) => {
    if (f.apertura && f.apertura > HOY) add({ titulo: `Abre: ${f.nombre}`, detalle: f.fechasEstimadas ? 'Fecha estimada, por confirmar' : f.monto, fecha: f.apertura, tipo: 'fondo', to: '/directiva/gestion' })
    add({ titulo: `Cierra: ${f.nombre}`, detalle: f.fechasEstimadas ? 'Fecha estimada, por confirmar' : f.monto, fecha: f.cierre, tipo: 'fondo', to: '/directiva/gestion' })
  })

  return lista.filter((v) => v.dias >= 0).sort((a, b) => a.fecha.localeCompare(b.fecha))
}

export interface Requisito {
  texto: string
  ok: boolean
  detalle: string
}

/** Revisa un certificado: que exista, que no venza antes del cierre y que no sea más antiguo de lo que piden las bases. */
function certificado(doc: Documento | undefined, fondo: Fondo): { ok: boolean; detalle: string } {
  if (!doc || doc.estado === 'pendiente') return { ok: false, detalle: 'Falta subirlo' }
  if (doc.vence && doc.vence < fondo.cierre) return { ok: false, detalle: `Vence el ${fechaLarga(doc.vence)}, antes del cierre: pide uno nuevo` }
  if (fondo.antiguedadMax && doc.emitido) {
    const referencia = fondo.apertura ?? HOY
    const dias = diasEntre(doc.emitido, referencia)
    if (dias > fondo.antiguedadMax)
      return { ok: false, detalle: `Emitido el ${fechaLarga(doc.emitido)}. Las bases piden máximo ${Math.round(fondo.antiguedadMax / 30)} meses de antigüedad: pide uno nuevo cerca de la apertura` }
    return { ok: true, detalle: `Emitido el ${fechaLarga(doc.emitido)}, dentro del plazo que piden las bases` }
  }
  return { ok: true, detalle: 'Vigente' }
}

/** Carpeta de postulación armada con lo que la junta ya tiene en la app. */
export function carpeta(s: Estado, juntaId: string, fondo: Fondo) {
  const docs = s.documentos.filter((d) => d.juntaId === juntaId)
  const doc = (tipo: string) => docs.find((d) => d.tipo.startsWith(tipo))
  const tiene = (tipo: string, falta: string) => {
    const d = doc(tipo)
    return d && d.estado !== 'pendiente' ? { ok: true, detalle: 'En Documentos' } : { ok: false, detalle: falta }
  }
  const actas = s.asambleas.filter((a) => a.juntaId === juntaId && a.estado === 'realizada')
  const necesidades = s.necesidades.filter((n) => n.juntaId === juntaId && fondo.areas.includes(n.area)).sort((a, b) => b.apoyos - a.apoyos)
  const actividades = s.actividades.filter((a) => a.juntaId === juntaId && a.estado === 'aprobada' && esVerificada(a))
  const enArea = actividades.filter((a) => fondo.areas.includes(a.area))
  const fotos = enArea.reduce((n, a) => n + a.fotos, 0)
  const junta = s.juntas.find((j) => j.id === juntaId)!
  const rendicion = doc('Rendición')

  const req: Record<Fondo['requisitos'][number], { ok: boolean; detalle: string }> = {
    'Certificado de vigencia': certificado(doc('Certificado de vigencia'), fondo),
    'Certificado de directorio': certificado(doc('Certificado de directorio'), fondo),
    'Estatutos certificados': tiene('Estatutos', 'Sube los estatutos certificados (no se aceptan archivos editables)'),
    'RUT de la organización': tiene('RUT', 'Sube el RUT de la organización'),
    'Inscripción como organización de interés público': tiene('Organización de interés público', 'Falta inscribirse en el catastro; se pide antes del cierre'),
    'Registro de receptores de fondos públicos (Ley 19.862)': tiene('Registro de receptores', 'Inscríbete en el registro de la Ley 19.862'),
    'Rendiciones anteriores al día': rendicion && rendicion.estado !== 'pendiente' ? { ok: true, detalle: 'Al día' } : { ok: false, detalle: 'Falta la rendición del fondo 2025' },
    'Acta de asamblea que respalda el proyecto': actas.length
      ? { ok: true, detalle: `Última acta: ${fechaLarga(actas[actas.length - 1].fecha)}` }
      : { ok: false, detalle: 'Aprueba el proyecto en la próxima asamblea' },
    'Necesidad votada por los vecinos': necesidades.length
      ? { ok: true, detalle: `"${necesidades[0].titulo}" con ${necesidades[0].apoyos} apoyos` }
      : { ok: false, detalle: 'Ninguna necesidad en estas áreas' },
    'Fotos del lugar': necesidades.some((n) => n.punto) ? { ok: true, detalle: 'Ubicadas en el mapa del barrio' } : { ok: false, detalle: 'Agrega fotos a la necesidad' },
    'Actividades anteriores con fotos': enArea.length
      ? { ok: true, detalle: `${enArea.length} actividades verificadas en ${fondo.areas.length > 3 ? 'distintas áreas' : fondo.areas.map((a) => AREA_BY_ID[a].corto.toLowerCase()).join(' y ')}, ${fotos} fotos` }
      : { ok: false, detalle: 'Aún no hay actividades en estas áreas' },
    'Socios activos': { ok: junta.sociosActivos > 0, detalle: `${junta.sociosActivos} de ${junta.socios} socios participan` },
  }
  const lista = fondo.requisitos.map((r) => ({ texto: r, ...req[r] }))
  return { lista, listos: lista.filter((r) => r.ok).length, necesidades, actividades: enArea }
}

/** Alertas para revisar las horas antes de certificarlas. */
export function alertasHora(h: RegistroHora, todas: RegistroHora[]): string[] {
  const a: string[] = []
  if (h.tramo === '14-17' && !h.autorizacion) a.push('Menor de 18: falta registrar la autorización del apoderado')
  if (h.origen === 'ayuda' && h.con) {
    const mismas = todas.filter((x) => x.origen === 'ayuda' && x.persona === h.persona && x.con === h.con && x.estado !== 'rechazada' && Math.abs(diasEntre(x.fecha, h.fecha)) <= 30)
    if (mismas.length >= 3) a.push(`${mismas.length} ayudas a la misma persona en 30 días: confirma con ${h.con}`)
  }
  return a
}

/** Saldo y totales del año para la tesorería transparente. */
export function cuentas(s: Estado, juntaId: string) {
  const movs = s.movimientos.filter((m) => m.juntaId === juntaId).sort((a, b) => b.fecha.localeCompare(a.fecha))
  const ingresos = movs.filter((m) => m.tipo === 'ingreso').reduce((n, m) => n + m.monto, 0)
  const gastos = movs.filter((m) => m.tipo === 'gasto').reduce((n, m) => n + m.monto, 0)
  const saldo = (SALDO_INICIAL[juntaId] ?? 0) + ingresos - gastos
  const sinRespaldo = movs.filter((m) => m.tipo === 'gasto' && !m.respaldo).length
  return { movs, ingresos, gastos, saldo, sinRespaldo }
}

export const quorumOk = (a: Asamblea) => a.asistentes >= a.quorum

/** Texto del acta a partir de lo registrado en la asamblea. */
export function textoActa(a: Asamblea, junta: string, directiva: { cargo: string; nombre: string }[]) {
  const pres = directiva.find((d) => d.cargo === 'Presidencia')?.nombre ?? 'Presidencia'
  const sec = directiva.find((d) => d.cargo === 'Secretaría')?.nombre ?? 'Secretaría'
  const lineas = [
    `ACTA DE ASAMBLEA ${a.tipo.toUpperCase()}`,
    `Junta de Vecinos ${junta}`,
    '',
    `En ${a.lugar}, el ${fechaLarga(a.fecha)}, a las ${a.hora} horas, se realiza la asamblea ${a.tipo} con la asistencia de ${a.asistentes} socios. ` +
      (quorumOk(a) ? `Se cumple el quórum de ${a.quorum} socios.` : `No se alcanza el quórum de ${a.quorum} socios; los acuerdos quedan como propuestas.`),
    `Preside ${pres}. Actúa como secretario(a) ${sec}.`,
    '',
    'TABLA',
    ...a.tabla.map((t, i) => `${i + 1}. ${t}`),
    '',
    'ACUERDOS',
    ...(a.acuerdos.length
      ? a.acuerdos.map((x, i) => `${i + 1}. ${x.texto}. A favor: ${x.favor}. En contra: ${x.contra}. Abstenciones: ${x.abstencion}. ${x.favor > x.contra ? 'Aprobado.' : 'Rechazado.'}`)
      : ['Sin acuerdos registrados.']),
    '',
    'Se levanta la sesión.',
    '',
    `${pres} · Presidencia          ${sec} · Secretaría`,
  ]
  return lineas.join('\n')
}
