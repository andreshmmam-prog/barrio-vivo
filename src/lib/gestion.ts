// Gestión de la junta: vencimientos, carpeta de postulación, tesorería y acta.
import { AREA_BY_ID } from '../data/areas'
import { FONDOS, HOY, PLAZO_RENDICION, SALDO_INICIAL } from '../data/demo'
import type { Asamblea, Fondo } from '../data/types'
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

  FONDOS.filter((f) => !s.postulaciones.includes(f.id)).forEach((f) =>
    add({ titulo: `Cierra: ${f.nombre}`, detalle: f.monto, fecha: f.cierre, tipo: 'fondo', to: '/directiva/gestion' }),
  )

  return lista.filter((v) => v.dias >= 0).sort((a, b) => a.fecha.localeCompare(b.fecha))
}

export interface Requisito {
  texto: string
  ok: boolean
  detalle: string
}

/** Carpeta de postulación armada con lo que la junta ya tiene en la app. */
export function carpeta(s: Estado, juntaId: string, fondo: Fondo) {
  const docs = s.documentos.filter((d) => d.juntaId === juntaId)
  const cert = docs.find((d) => d.tipo === 'Certificado de vigencia')
  const rendicion = docs.find((d) => d.tipo.startsWith('Rendición'))
  const actas = s.asambleas.filter((a) => a.juntaId === juntaId && a.estado === 'realizada')
  const necesidades = s.necesidades.filter((n) => n.juntaId === juntaId && fondo.areas.includes(n.area)).sort((a, b) => b.apoyos - a.apoyos)
  const actividades = s.actividades.filter((a) => a.juntaId === juntaId && a.estado === 'aprobada' && esVerificada(a))
  const enArea = actividades.filter((a) => fondo.areas.includes(a.area))
  const fotos = enArea.reduce((n, a) => n + a.fotos, 0)
  const junta = s.juntas.find((j) => j.id === juntaId)!

  const req: Record<string, Requisito> = {
    'Certificado de vigencia': {
      texto: 'Certificado de vigencia',
      ok: !!cert && cert.estado !== 'pendiente' && (!cert.vence || cert.vence >= fondo.cierre),
      detalle: !cert || cert.estado === 'pendiente' ? 'Falta subirlo' : cert.vence && cert.vence < fondo.cierre ? `Vence el ${fechaLarga(cert.vence)}, antes del cierre: renuévalo` : 'Vigente',
    },
    'Rendiciones anteriores al día': {
      texto: 'Rendiciones anteriores al día',
      ok: !!rendicion && rendicion.estado !== 'pendiente',
      detalle: rendicion && rendicion.estado !== 'pendiente' ? 'Al día' : 'Falta la rendición del fondo 2025',
    },
    'Acta de asamblea que respalda el proyecto': {
      texto: 'Acta de asamblea que respalda el proyecto',
      ok: actas.length > 0,
      detalle: actas.length ? `Última acta: ${fechaLarga(actas[actas.length - 1].fecha)}` : 'Aprueba el proyecto en la próxima asamblea',
    },
    'Necesidad votada por los vecinos': {
      texto: 'Necesidad votada por los vecinos',
      ok: necesidades.length > 0,
      detalle: necesidades.length ? `"${necesidades[0].titulo}" con ${necesidades[0].apoyos} apoyos` : 'Ninguna necesidad en estas áreas',
    },
    'Fotos del lugar': {
      texto: 'Fotos del lugar',
      ok: necesidades.some((n) => n.punto),
      detalle: necesidades.some((n) => n.punto) ? 'Ubicadas en el mapa del barrio' : 'Agrega fotos a la necesidad',
    },
    'Actividades anteriores con fotos': {
      texto: 'Actividades anteriores con fotos',
      ok: enArea.length > 0,
      detalle: enArea.length ? `${enArea.length} actividades verificadas en ${fondo.areas.map((a) => AREA_BY_ID[a].corto.toLowerCase()).join(' y ')}, ${fotos} fotos` : 'Aún no hay actividades en estas áreas',
    },
    'Socios activos': {
      texto: 'Socios activos',
      ok: junta.sociosActivos > 0,
      detalle: `${junta.sociosActivos} de ${junta.socios} socios participan`,
    },
  }
  const lista = fondo.requisitos.map((r) => req[r] ?? { texto: r, ok: false, detalle: 'Por revisar' })
  return { lista, listos: lista.filter((r) => r.ok).length, necesidades, actividades: enArea }
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
