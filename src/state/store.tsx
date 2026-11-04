// Estado del prototipo: datos de ejemplo + lo que el usuario hace en la demo.
// Se guarda en el navegador para que la demo recuerde votos, actividades, etc.
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import * as D from '../data/demo'
import type { Actividad, Cargo, Documento, EstadoNecesidad, Hilo, Junta, Necesidad, Producto, Reporte, Votacion, Aviso } from '../data/types'
import { REGLAS, puntosActividad } from '../lib/scoring'

export interface Estado {
  juntas: Junta[]
  actividades: Actividad[]
  necesidades: Necesidad[]
  votaciones: Votacion[]
  documentos: Documento[]
  avisos: Aviso[]
  hilos: Hilo[]
  productos: Producto[]
  reportes: Reporte[]
  leccionesHechas: string[]
  temporadaCerrada: boolean
}

const inicial = (): Estado => ({
  juntas: D.JUNTAS,
  actividades: D.ACTIVIDADES,
  necesidades: D.NECESIDADES,
  votaciones: D.VOTACIONES,
  documentos: D.DOCUMENTOS,
  avisos: D.AVISOS,
  hilos: D.HILOS,
  productos: D.PRODUCTOS,
  reportes: D.REPORTES,
  leccionesHechas: ['l1', 'l2', 'l3'],
  temporadaCerrada: false,
})

type Accion =
  | { t: 'votar'; id: string; opcion: number }
  | { t: 'apoyar'; id: string }
  | { t: 'nuevaNecesidad'; n: Necesidad }
  | { t: 'estadoNecesidad'; id: string; estado: EstadoNecesidad; respuesta?: string }
  | { t: 'nuevaActividad'; a: Actividad }
  | { t: 'validar'; id: string; ok: boolean }
  | { t: 'subirDoc'; id: string; archivo: string }
  | { t: 'traspaso'; juntaId: string; directiva: Cargo[]; hasta: string }
  | { t: 'comentar'; hiloId: string; autor: string; texto: string }
  | { t: 'nuevoHilo'; h: Hilo }
  | { t: 'nuevoProducto'; p: Producto }
  | { t: 'nuevoAviso'; a: Aviso }
  | { t: 'leccion'; id: string }
  | { t: 'moderar'; id: string }
  | { t: 'aprobarProducto'; id: string }
  | { t: 'estadoJunta'; id: string; estado: Junta['estado'] }
  | { t: 'cerrarTemporada'; cerrada: boolean }
  | { t: 'reset' }

function reducer(s: Estado, a: Accion): Estado {
  switch (a.t) {
    case 'votar':
      return {
        ...s,
        votaciones: s.votaciones.map((v) =>
          v.id !== a.id || v.miVoto !== undefined
            ? v
            : { ...v, miVoto: a.opcion, opciones: v.opciones.map((o, i) => (i === a.opcion ? { ...o, votos: o.votos + 1 } : o)) },
        ),
      }
    case 'apoyar':
      return {
        ...s,
        necesidades: s.necesidades.map((n) =>
          n.id === a.id ? { ...n, apoyada: !n.apoyada, apoyos: n.apoyos + (n.apoyada ? -1 : 1) } : n,
        ),
      }
    case 'nuevaNecesidad':
      return { ...s, necesidades: [a.n, ...s.necesidades] }
    case 'estadoNecesidad':
      return {
        ...s,
        necesidades: s.necesidades.map((n) =>
          n.id === a.id ? { ...n, estado: a.estado, respuesta: a.respuesta ?? n.respuesta, actualizada: D.HOY } : n,
        ),
      }
    case 'nuevaActividad':
      return { ...s, actividades: [a.a, ...s.actividades] }
    case 'validar':
      return {
        ...s,
        actividades: s.actividades.map((x) => (x.id === a.id ? { ...x, estado: a.ok ? 'aprobada' : 'rechazada' } : x)),
      }
    case 'subirDoc':
      return {
        ...s,
        documentos: s.documentos.map((d) =>
          d.id === a.id ? { ...d, archivo: a.archivo, estado: d.estado === 'por_vencer' ? 'vigente' : d.estado === 'pendiente' ? 'al_dia' : d.estado, vence: undefined, detalle: d.estado === 'pendiente' ? 'Subido recién' : d.detalle } : d,
        ),
      }
    case 'traspaso':
      return {
        ...s,
        juntas: s.juntas.map((j) => (j.id === a.juntaId ? { ...j, directiva: a.directiva, periodoHasta: a.hasta } : j)),
      }
    case 'comentar':
      return {
        ...s,
        hilos: s.hilos.map((h) =>
          h.id === a.hiloId ? { ...h, comentarios: [...h.comentarios, { autor: a.autor, texto: a.texto, fecha: D.HOY }] } : h,
        ),
      }
    case 'nuevoHilo':
      return { ...s, hilos: [a.h, ...s.hilos] }
    case 'nuevoProducto':
      return { ...s, productos: [a.p, ...s.productos] }
    case 'nuevoAviso':
      return { ...s, avisos: [a.a, ...s.avisos] }
    case 'leccion':
      return s.leccionesHechas.includes(a.id) ? s : { ...s, leccionesHechas: [...s.leccionesHechas, a.id] }
    case 'moderar':
      return { ...s, reportes: s.reportes.map((r) => (r.id === a.id ? { ...r, resuelto: true } : r)) }
    case 'aprobarProducto':
      return { ...s, productos: s.productos.map((p) => (p.id === a.id ? { ...p, estado: 'publicado' } : p)) }
    case 'estadoJunta':
      return {
        ...s,
        juntas: s.juntas.map((j) =>
          j.id === a.id ? { ...j, estado: a.estado, sociosActivos: a.estado === 'activa' && j.sociosActivos === 0 ? Math.round(j.socios * 0.2) : j.sociosActivos } : j,
        ),
      }
    case 'cerrarTemporada':
      return { ...s, temporadaCerrada: a.cerrada }
    case 'reset':
      return inicial()
  }
}

const CLAVE = 'barrio-vivo-demo-v1'

function cargar(): Estado {
  try {
    const raw = localStorage.getItem(CLAVE)
    if (raw) return { ...inicial(), ...JSON.parse(raw) }
  } catch {
    /* sin almacenamiento disponible: se usa el estado inicial */
  }
  return inicial()
}

interface Ctx {
  s: Estado
  dispatch: (a: Accion) => void
  toast: (msg: string) => void
  registrarActividad: (a: Omit<Actividad, 'id' | 'estado'>) => { puntos: number; pendiente: boolean }
}

const StoreCtx = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, dispatch] = useReducer(reducer, undefined, cargar)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(s))
    } catch {
      /* ignorar */
    }
  }, [s])

  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), 2800)
    return () => clearTimeout(t)
  }, [msg])

  const toast = useCallback((m: string) => setMsg(m), [])

  const registrarActividad = useCallback(
    (a: Omit<Actividad, 'id' | 'estado'>) => {
      const primera = !s.actividades.some((x) => x.juntaId === a.juntaId && x.area === a.area && x.estado === 'aprobada')
      const puntos = puntosActividad(a, primera).total
      const pendiente = puntos > REGLAS.umbralRevision || !(a.fotos > 0 && a.qr > 0)
      dispatch({ t: 'nuevaActividad', a: { ...a, id: `n${Date.now()}`, estado: pendiente ? 'pendiente' : 'aprobada' } })
      return { puntos, pendiente }
    },
    [s.actividades],
  )

  const value = useMemo(() => ({ s, dispatch, toast, registrarActividad }), [s, toast, registrarActividad])

  return (
    <StoreCtx.Provider value={value}>
      {children}
      <div className="toast" role="status" aria-live="polite" data-visible={msg ? 'true' : 'false'}>
        {msg}
      </div>
    </StoreCtx.Provider>
  )
}

export function useStore() {
  const c = useContext(StoreCtx)
  if (!c) throw new Error('useStore fuera de StoreProvider')
  return c
}
