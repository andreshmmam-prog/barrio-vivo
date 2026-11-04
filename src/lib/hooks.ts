import { useMemo } from 'react'
import { useStore } from '../state/store'
import { ivc, tablaGeneral } from './scoring'

/** Tabla general calculada a partir del estado actual. */
export function useTabla() {
  const { s } = useStore()
  return useMemo(() => tablaGeneral(s.juntas, s.actividades), [s.juntas, s.actividades])
}

/** IVC de cada junta activa. */
export function useIVC() {
  const { s } = useStore()
  return useMemo(
    () => new Map(s.juntas.filter((j) => j.estado === 'activa').map((j) => [j.id, ivc(j, s.actividades, s.documentos)])),
    [s.juntas, s.actividades, s.documentos],
  )
}

export function useJunta(id: string) {
  const { s } = useStore()
  return s.juntas.find((j) => j.id === id) ?? s.juntas[0]
}
