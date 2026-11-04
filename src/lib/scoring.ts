// Reglas de puntaje, tabla general, premios e Índice de Vitalidad Comunitaria (IVC).
// Son una propuesta inicial: los valores se calibran con los datos del piloto.
import { AREAS, type AreaId } from '../data/areas'
import type { Actividad, Documento, Junta } from '../data/types'
import { HOY, TEMPORADA } from '../data/demo'

export const REGLAS = {
  base: 50,
  multVerificada: 1.5,
  alianza: 40,
  primeraVez: 30,
  participacionMax: 25, // 1 punto cada 4 asistentes, con tope
  umbralRevision: 150,
}

export function esVerificada(a: Actividad) {
  return a.fotos > 0 && a.qr > 0
}

export interface Desglose {
  base: number
  verificada: boolean
  participacion: number
  alianza: number
  primeraVez: number
  total: number
}

/** Puntaje de una actividad. `primeraVez` indica si es la primera de la junta en esa área en la temporada. */
export function puntosActividad(a: Pick<Actividad, 'asistentes' | 'fotos' | 'qr' | 'alianzaCon' | 'hito'>, primeraVez: boolean): Desglose {
  const verificada = a.fotos > 0 && a.qr > 0
  const participacion = a.hito ? 15 : Math.min(REGLAS.participacionMax, Math.floor(a.asistentes / 4))
  const base = Math.round((REGLAS.base + participacion) * (verificada ? REGLAS.multVerificada : 1))
  const alianza = a.alianzaCon ? REGLAS.alianza : 0
  const pv = primeraVez ? REGLAS.primeraVez : 0
  return { base: REGLAS.base, verificada, participacion, alianza, primeraVez: pv, total: base + alianza + pv }
}

function enTemporada(a: Actividad) {
  return a.fecha >= TEMPORADA.inicio && a.fecha <= TEMPORADA.fin
}

/** Puntos aprobados por actividad, considerando "primera vez" en orden cronológico. */
export function puntosPorActividad(actividades: Actividad[]): Map<string, Desglose> {
  const res = new Map<string, Desglose>()
  const vistas = new Set<string>()
  const orden = actividades
    .filter((a) => a.estado === 'aprobada' && enTemporada(a))
    .sort((x, y) => x.fecha.localeCompare(y.fecha) || x.id.localeCompare(y.id))
  for (const a of orden) {
    const key = `${a.juntaId}:${a.area}`
    const primera = !vistas.has(key)
    vistas.add(key)
    res.set(a.id, puntosActividad(a, primera))
  }
  return res
}

export type PuntosArea = Record<AreaId, number>

export function vacioAreas(): PuntosArea {
  return { cultura: 0, deporte: 0, social: 0, mejora: 0, salud: 0, ambiente: 0, seguridad: 0 }
}

export interface FilaTabla {
  junta: Junta
  porArea: PuntosArea
  total: number
  porSocio: number // puntos cada 10 socios, para comparar juntas de distinto tamaño
  porAreaSocio: PuntosArea
  actividades: number
  liga: Liga
}

export type Liga = 'Barrios pequeños' | 'Barrios medianos' | 'Barrios grandes'

export function ligaDe(socios: number): Liga {
  if (socios < 80) return 'Barrios pequeños'
  if (socios < 140) return 'Barrios medianos'
  return 'Barrios grandes'
}

export function tablaGeneral(juntas: Junta[], actividades: Actividad[]): FilaTabla[] {
  const pts = puntosPorActividad(actividades)
  return juntas
    .filter((j) => j.estado === 'activa')
    .map((junta) => {
      const porArea = vacioAreas()
      let n = 0
      for (const a of actividades) {
        const p = pts.get(a.id)
        if (a.juntaId === junta.id && p) {
          porArea[a.area] += p.total
          n++
        }
      }
      const total = Object.values(porArea).reduce((s, v) => s + v, 0)
      const factor = 10 / junta.socios
      const porAreaSocio = vacioAreas()
      for (const ar of AREAS) porAreaSocio[ar.id] = Math.round(porArea[ar.id] * factor)
      return {
        junta,
        porArea,
        total,
        porSocio: Math.round(total * factor),
        porAreaSocio,
        actividades: n,
        liga: ligaDe(junta.socios),
      }
    })
}

export type ModoRanking = 'porSocio' | 'total'

export function ordenar(filas: FilaTabla[], modo: ModoRanking, area?: AreaId) {
  const val = (f: FilaTabla) =>
    area ? (modo === 'porSocio' ? f.porAreaSocio[area] : f.porArea[area]) : modo === 'porSocio' ? f.porSocio : f.total
  return [...filas].sort((a, b) => val(b) - val(a))
}

export interface Premio {
  area: (typeof AREAS)[number]
  ganador?: FilaTabla
  valor: number
  segundo?: FilaTabla
}

/** Ganador de cada Premio Barrio Vivo por área (por puntos cada 10 socios). */
export function premios(filas: FilaTabla[], modo: ModoRanking = 'porSocio'): Premio[] {
  return AREAS.map((area) => {
    const orden = ordenar(filas, modo, area.id)
    const v = (f?: FilaTabla) => (f ? (modo === 'porSocio' ? f.porAreaSocio[area.id] : f.porArea[area.id]) : 0)
    const ganador = orden[0] && v(orden[0]) > 0 ? orden[0] : undefined
    return { area, ganador, valor: v(ganador), segundo: orden[1] && v(orden[1]) > 0 ? orden[1] : undefined }
  })
}

// ---- Radar ----------------------------------------------------------------------

/** Valores 0..1 por área para el radar de una junta. */
export function radar(fila: FilaTabla): number[] {
  const max = Math.max(1, ...AREAS.map((a) => fila.porArea[a.id]))
  return AREAS.map((a) => fila.porArea[a.id] / max)
}

export function areaMasDebil(fila: FilaTabla) {
  return AREAS.reduce((min, a) => (fila.porArea[a.id] < fila.porArea[min.id] ? a : min), AREAS[0])
}

// ---- IVC ---------------------------------------------------------------------------

export const PESOS_IVC = { participacion: 0.3, diversidad: 0.2, constancia: 0.2, colaboracion: 0.15, gestion: 0.15 }

export interface IVC {
  total: number
  participacion: number
  diversidad: number
  constancia: number
  colaboracion: number
  gestion: number
}

export function ivc(junta: Junta, actividades: Actividad[], documentos: Documento[]): IVC {
  const propias = actividades.filter((a) => a.juntaId === junta.id && a.estado === 'aprobada')
  // Participación: socios activos sobre inscritos (60% activo = puntaje completo)
  const participacion = Math.min(1, junta.sociosActivos / junta.socios / 0.6)
  // Diversidad: áreas con al menos una actividad
  const diversidad = new Set(propias.map((a) => a.area)).size / 7
  // Constancia: meses con actividad en los últimos 5 meses
  const meses = new Set(propias.filter((a) => a.fecha >= '2026-07-01').map((a) => a.fecha.slice(0, 7)))
  const constancia = Math.min(1, meses.size / 5)
  // Colaboración: alianzas con otras juntas (4 = puntaje completo)
  const alianzas = propias.filter((a) => a.alianzaCon).length + actividades.filter((a) => a.alianzaCon === junta.id && a.estado === 'aprobada').length
  const colaboracion = Math.min(1, alianzas / 4)
  // Gestión: documentos al día y directiva vigente
  const docs = documentos.filter((d) => d.juntaId === junta.id)
  const docsOk = docs.length ? docs.filter((d) => d.estado !== 'pendiente').length / docs.length : 0
  const vigente = junta.periodoHasta > HOY ? 1 : 0
  const gestion = docsOk * 0.7 + vigente * 0.3
  const total = Math.round(
    100 *
      (participacion * PESOS_IVC.participacion +
        diversidad * PESOS_IVC.diversidad +
        constancia * PESOS_IVC.constancia +
        colaboracion * PESOS_IVC.colaboracion +
        gestion * PESOS_IVC.gestion),
  )
  const r = (x: number) => Math.round(x * 100)
  return { total, participacion: r(participacion), diversidad: r(diversidad), constancia: r(constancia), colaboracion: r(colaboracion), gestion: r(gestion) }
}

// ---- Fechas ------------------------------------------------------------------------

export function diasEntre(desde: string, hasta: string = HOY) {
  return Math.round((Date.parse(hasta) - Date.parse(desde)) / 86400000)
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export function fechaCorta(iso: string) {
  const [, m, d] = iso.split('-')
  return `${Number(d)} ${MESES[Number(m) - 1]}`
}

export function fechaLarga(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${Number(d)} de ${['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][Number(m) - 1]} de ${y}`
}

export function miles(n: number) {
  return n.toLocaleString('es-CL')
}
