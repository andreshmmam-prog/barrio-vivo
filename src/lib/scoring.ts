// Reglas de puntaje, tabla general, premios e Índice de Vitalidad Comunitaria (IVC).
// Son una propuesta inicial: los valores se calibran con los datos del piloto.
import { AREAS, type AreaId } from '../data/areas'
import type { Actividad, Ayuda, Documento, Junta } from '../data/types'
import { HOY, TEMPORADA } from '../data/demo'

/**
 * En una frase: cada actividad suma; si es verificada, con otra junta o con jóvenes, suma más.
 * Cada ayuda cumplida en Manos Vecinas suma en Social y Solidaridad.
 */
export const REGLAS = {
  base: 50,
  participacionMax: 25, // 1 punto cada 4 asistentes, con tope
  multVerificada: 1.5,
  alianza: 60,
  juvenil: 20,
  umbralJuvenil: 0.3, // 30% de asistentes de 14 a 29 años
  ayuda: 15,
  umbralRevision: 150,
}

export function esVerificada(a: Pick<Actividad, 'fotos' | 'qr'>) {
  return a.fotos > 0 && a.qr > 0
}

/** Proporción de jóvenes entre los asistentes registrados con QR. */
export function shareJoven(a: Pick<Actividad, 'qr' | 'jovenes'>) {
  return a.qr > 0 ? a.jovenes / a.qr : 0
}

export interface Desglose {
  base: number
  participacion: number
  verificada: boolean
  alianza: number
  juvenil: number
  total: number
}

export function puntosActividad(a: Pick<Actividad, 'asistentes' | 'fotos' | 'qr' | 'jovenes' | 'alianzaCon' | 'hito'>): Desglose {
  const verificada = esVerificada(a)
  const participacion = a.hito ? 15 : Math.min(REGLAS.participacionMax, Math.floor(a.asistentes / 4))
  const base = Math.round((REGLAS.base + participacion) * (verificada ? REGLAS.multVerificada : 1))
  const alianza = a.alianzaCon ? REGLAS.alianza : 0
  const juvenil = !a.hito && shareJoven(a) >= REGLAS.umbralJuvenil ? REGLAS.juvenil : 0
  return { base: REGLAS.base, participacion, verificada, alianza, juvenil, total: base + alianza + juvenil }
}

function enTemporada(fecha: string) {
  return fecha >= TEMPORADA.inicio && fecha <= TEMPORADA.fin
}

/** Puntos de cada actividad aprobada de la temporada. */
export function puntosPorActividad(actividades: Actividad[]): Map<string, Desglose> {
  const res = new Map<string, Desglose>()
  for (const a of actividades) {
    if (a.estado === 'aprobada' && enTemporada(a.fecha)) res.set(a.id, puntosActividad(a))
  }
  return res
}

export type PuntosArea = Record<AreaId, number>

export function vacioAreas(): PuntosArea {
  return { cultura: 0, deporte: 0, social: 0, mejora: 0, salud: 0, ambiente: 0, seguridad: 0 }
}

export type Liga = 'Barrios pequeños' | 'Barrios medianos' | 'Barrios grandes'

export function ligaDe(socios: number): Liga {
  if (socios < 80) return 'Barrios pequeños'
  if (socios < 140) return 'Barrios medianos'
  return 'Barrios grandes'
}

export interface FilaTabla {
  junta: Junta
  porArea: PuntosArea
  total: number
  porSocio: number // puntos cada 10 socios, para comparar juntas de distinto tamaño
  porAreaSocio: PuntosArea
  actividades: number
  ayudas: number
  jovenes: number // asistentes jóvenes registrados con QR
  registrados: number // asistentes registrados con QR
  jovenesPorSocio: number // jóvenes cada 10 socios
  liga: Liga
}

export function tablaGeneral(juntas: Junta[], actividades: Actividad[], ayudas: Ayuda[]): FilaTabla[] {
  const pts = puntosPorActividad(actividades)
  return juntas
    .filter((j) => j.estado === 'activa')
    .map((junta) => {
      const porArea = vacioAreas()
      let n = 0
      let jovenes = 0
      let registrados = 0
      for (const a of actividades) {
        const p = pts.get(a.id)
        if (a.juntaId === junta.id && p) {
          porArea[a.area] += p.total
          n++
          jovenes += a.jovenes
          registrados += a.qr
        }
      }
      const cumplidas = ayudas.filter((x) => x.juntaId === junta.id && x.estado === 'cumplida').length
      porArea.social += cumplidas * REGLAS.ayuda
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
        ayudas: cumplidas,
        jovenes,
        registrados,
        jovenesPorSocio: Math.round(jovenes * factor),
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

/** Ganador de cada Premio Barrio Vivo por área. */
export function premios(filas: FilaTabla[], modo: ModoRanking = 'porSocio'): Premio[] {
  return AREAS.map((area) => {
    const orden = ordenar(filas, modo, area.id)
    const v = (f?: FilaTabla) => (f ? (modo === 'porSocio' ? f.porAreaSocio[area.id] : f.porArea[area.id]) : 0)
    const ganador = orden[0] && v(orden[0]) > 0 ? orden[0] : undefined
    return { area, ganador, valor: v(ganador), segundo: orden[1] && v(orden[1]) > 0 ? orden[1] : undefined }
  })
}

/** Premio Juventud: más jóvenes participando cada 10 socios. */
export function rankingJuventud(filas: FilaTabla[]) {
  return [...filas].sort((a, b) => b.jovenesPorSocio - a.jovenesPorSocio)
}

// ---- Sellos de avance: logros absolutos que toda junta puede alcanzar ------------------

export type Nivel = 'Semilla' | 'Brote' | 'Árbol' | 'Bosque'

export interface NivelJunta {
  nivel: Nivel
  areas: number
  meses: number
  alianzas: number
  docsAlDia: boolean
  falta: string[] // qué le falta para el siguiente nivel
}

export const NIVELES: { nivel: Nivel; regla: string }[] = [
  { nivel: 'Semilla', regla: 'Junta activa en Barrio Vivo' },
  { nivel: 'Brote', regla: 'Actividades en al menos 1 área' },
  { nivel: 'Árbol', regla: 'Actividad en 5 de las 7 áreas y documentos al día' },
  { nivel: 'Bosque', regla: 'Las 7 áreas, 4 meses con actividad y 2 alianzas con otras juntas' },
]

export function nivelJunta(junta: Junta, actividades: Actividad[], documentos: Documento[]): NivelJunta {
  const propias = actividades.filter((a) => a.juntaId === junta.id && a.estado === 'aprobada')
  const areas = new Set(propias.map((a) => a.area)).size
  const meses = new Set(propias.map((a) => a.fecha.slice(0, 7))).size
  const alianzas = propias.filter((a) => a.alianzaCon).length + actividades.filter((a) => a.alianzaCon === junta.id && a.estado === 'aprobada').length
  const docs = documentos.filter((d) => d.juntaId === junta.id)
  const pendientes = docs.filter((d) => d.estado === 'pendiente')
  const docsAlDia = pendientes.length === 0
  const falta: string[] = []
  let nivel: Nivel = 'Semilla'
  if (areas >= 1) nivel = 'Brote'
  if (areas >= 5 && docsAlDia) nivel = 'Árbol'
  if (areas === 7 && meses >= 4 && alianzas >= 2 && docsAlDia) nivel = 'Bosque'
  if (nivel === 'Semilla') falta.push('Registrar la primera actividad')
  if (nivel === 'Brote') {
    if (areas < 5) falta.push(`Actividad en ${5 - areas} áreas más`)
    if (!docsAlDia) falta.push(`Subir ${pendientes.map((d) => d.tipo.toLowerCase()).join(', ')}`)
  }
  if (nivel === 'Árbol') {
    if (areas < 7) falta.push(`Actividad en ${7 - areas} áreas más`)
    if (meses < 4) falta.push(`${4 - meses} meses más con actividad`)
    if (alianzas < 2) falta.push(`${2 - alianzas} alianzas más con otras juntas`)
  }
  return { nivel, areas, meses, alianzas, docsAlDia, falta }
}

export function areaMasDebil(fila: FilaTabla) {
  return AREAS.reduce((min, a) => (fila.porArea[a.id] < fila.porArea[min.id] ? a : min), AREAS[0])
}

// ---- IVC (solo para la directiva y el municipio) ---------------------------------------

export const PESOS_IVC = { participacion: 0.25, diversidad: 0.2, constancia: 0.15, colaboracion: 0.1, gestion: 0.15, renovacion: 0.15 }

export interface IVC {
  total: number
  participacion: number
  diversidad: number
  constancia: number
  colaboracion: number
  gestion: number
  renovacion: number
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
  // Renovación generacional: proporción de jóvenes entre los asistentes (30% = puntaje completo)
  const qr = propias.reduce((n, a) => n + a.qr, 0)
  const jov = propias.reduce((n, a) => n + a.jovenes, 0)
  const renovacion = qr ? Math.min(1, jov / qr / 0.3) : 0
  const total = Math.round(
    100 *
      (participacion * PESOS_IVC.participacion +
        diversidad * PESOS_IVC.diversidad +
        constancia * PESOS_IVC.constancia +
        colaboracion * PESOS_IVC.colaboracion +
        gestion * PESOS_IVC.gestion +
        renovacion * PESOS_IVC.renovacion),
  )
  const r = (x: number) => Math.round(x * 100)
  return {
    total,
    participacion: r(participacion),
    diversidad: r(diversidad),
    constancia: r(constancia),
    colaboracion: r(colaboracion),
    gestion: r(gestion),
    renovacion: r(renovacion),
  }
}

// ---- Fechas y números ----------------------------------------------------------------

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

export function pct(n: number) {
  return `${Math.round(n * 100)}%`
}
