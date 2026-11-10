import { useMemo } from 'react'
import { MAPU, type ClaveMapu } from '../data/mapudungun'
import { VECINOS } from '../data/demo'
import { useStore } from '../state/store'
import { ivc, nivelJunta, tablaGeneral } from './scoring'

/** Tabla general calculada a partir del estado actual. */
export function useTabla() {
  const { s } = useStore()
  return useMemo(() => tablaGeneral(s.juntas, s.actividades, s.ayudas), [s.juntas, s.actividades, s.ayudas])
}

/** IVC de cada junta activa. */
export function useIVC() {
  const { s } = useStore()
  return useMemo(
    () => new Map(s.juntas.filter((j) => j.estado === 'activa').map((j) => [j.id, ivc(j, s.actividades, s.documentos)])),
    [s.juntas, s.actividades, s.documentos],
  )
}

/** Persona con la que se navega el perfil Vecino, con sus horas al día. */
export function useVecino() {
  const { s } = useStore()
  const v = VECINOS.find((x) => x.id === s.vecinoId) ?? VECINOS[0]
  const propias = s.horas.filter((h) => h.vecinoId === v.id)
  const aprobadas = propias.filter((h) => h.estado === 'aprobada')
  const porRevisar = propias.filter((h) => h.estado === 'por_revisar').reduce((n, h) => n + h.horas, 0)
  // Horas certificadas = historial anterior + registros aprobados por la directiva
  const horas = v.horasBase + aprobadas.reduce((n, h) => n + h.horas, 0)
  const junta = s.juntas.find((j) => j.id === v.juntaId)!
  return { ...v, horas, porRevisar, aprobadas, junta }
}

/** Sello de avance de cada junta activa. */
export function useNiveles() {
  const { s } = useStore()
  return useMemo(
    () => new Map(s.juntas.filter((j) => j.estado === 'activa').map((j) => [j.id, nivelJunta(j, s.actividades, s.documentos)])),
    [s.juntas, s.actividades, s.documentos],
  )
}

/** Modo bilingüe: devuelve "Español · Mapudungun" cuando está activo. */
export function useMapu() {
  const { s } = useStore()
  const on = s.prefs.mapudungun
  return {
    on,
    t: (es: string, clave: ClaveMapu) => (on ? `${es} · ${MAPU[clave]}` : es),
    sola: (clave: ClaveMapu, es: string) => (on ? MAPU[clave] : es),
  }
}
