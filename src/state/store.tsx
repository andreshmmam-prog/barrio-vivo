// Estado del prototipo: datos de ejemplo + lo que el usuario hace en la demo.
// Se guarda en el navegador para que la demo recuerde votos, actividades, ayudas, etc.
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import * as D from '../data/demo'
import type {
  Actividad,
  Alerta,
  Ayuda,
  Cargo,
  Consulta,
  Convocatoria,
  Documento,
  Emprendedor,
  EstadoNecesidad,
  RutaNecesidad,
  Junta,
  Necesidad,
  Propuesta,
  Reporte,
} from '../data/types'
import { REGLAS, puntosActividad } from '../lib/scoring'

export interface Estado {
  juntas: Junta[]
  actividades: Actividad[]
  necesidades: Necesidad[]
  consultas: Consulta[]
  documentos: Documento[]
  alertas: Alerta[]
  ayudas: Ayuda[]
  convocatorias: Convocatoria[]
  propuestas: Propuesta[]
  emprendedores: Emprendedor[]
  reportes: Reporte[]
  leccionesHechas: string[]
  temporadaCerrada: boolean
  vecinoId: string
  horasExtra: Record<string, number>
}

const inicial = (): Estado => ({
  juntas: D.JUNTAS,
  actividades: D.ACTIVIDADES,
  necesidades: D.NECESIDADES,
  consultas: D.CONSULTAS,
  documentos: D.DOCUMENTOS,
  alertas: D.ALERTAS,
  ayudas: D.AYUDAS,
  convocatorias: D.CONVOCATORIAS,
  propuestas: D.PROPUESTAS,
  emprendedores: D.EMPRENDEDORES,
  reportes: D.REPORTES,
  leccionesHechas: ['l1', 'l2', 'l3'],
  temporadaCerrada: false,
  vecinoId: 'marta',
  horasExtra: {},
})

type Accion =
  | { t: 'votar'; id: string; opcion: number; vecinoId: string }
  | { t: 'apoyar'; id: string }
  | { t: 'nuevaNecesidad'; n: Necesidad }
  | { t: 'estadoNecesidad'; id: string; estado: EstadoNecesidad; respuesta?: string; ruta?: RutaNecesidad; avance?: number }
  | { t: 'fusionar'; origen: string; destino: string }
  | { t: 'cargarVotos'; id: string; votos: number[] }
  | { t: 'comentarNecesidad'; id: string; autor: string; texto: string }
  | { t: 'nuevaActividad'; a: Actividad }
  | { t: 'validar'; id: string; ok: boolean }
  | { t: 'subirDoc'; id: string; archivo: string }
  | { t: 'traspaso'; juntaId: string; directiva: Cargo[]; hasta: string }
  | { t: 'nuevaAlerta'; a: Alerta }
  | { t: 'comentarAlerta'; id: string; autor: string; texto: string }
  | { t: 'nuevaAyuda'; a: Ayuda }
  | { t: 'tomarAyuda'; id: string; con: string; conId: string }
  | { t: 'cumplirAyuda'; id: string; gracias: string }
  | { t: 'inscribir'; id: string; vecinoId: string }
  | { t: 'asistir'; id: string; vecinoId: string }
  | { t: 'nuevaPropuesta'; p: Propuesta }
  | { t: 'decidirPropuesta'; id: string; ok: boolean }
  | { t: 'nuevoEmprendedor'; e: Emprendedor }
  | { t: 'aprobarEmprendedor'; id: string }
  | { t: 'leccion'; id: string }
  | { t: 'moderar'; id: string }
  | { t: 'estadoJunta'; id: string; estado: Junta['estado'] }
  | { t: 'cerrarTemporada'; cerrada: boolean }
  | { t: 'setVecino'; id: string }
  | { t: 'reset' }

function sumarHoras(h: Record<string, number>, id: string | undefined, n: number) {
  return id ? { ...h, [id]: (h[id] ?? 0) + n } : h
}

function reducer(s: Estado, a: Accion): Estado {
  switch (a.t) {
    case 'votar':
      return {
        ...s,
        consultas: s.consultas.map((v) =>
          v.id !== a.id || v.votoDe[a.vecinoId] !== undefined
            ? v
            : { ...v, votoDe: { ...v.votoDe, [a.vecinoId]: a.opcion }, opciones: v.opciones.map((o, i) => (i === a.opcion ? { ...o, votos: o.votos + 1 } : o)) },
        ),
      }
    case 'apoyar':
      return {
        ...s,
        necesidades: s.necesidades.map((n) => (n.id === a.id ? { ...n, apoyada: !n.apoyada, apoyos: n.apoyos + (n.apoyada ? -1 : 1) } : n)),
      }
    case 'nuevaNecesidad':
      return { ...s, necesidades: [a.n, ...s.necesidades] }
    case 'estadoNecesidad':
      return {
        ...s,
        necesidades: s.necesidades.map((n) =>
          n.id === a.id ? { ...n, estado: a.estado, respuesta: a.respuesta ?? n.respuesta, ruta: a.ruta ?? n.ruta, avance: a.avance ?? n.avance, actualizada: D.HOY } : n,
        ),
      }
    case 'fusionar': {
      const o = s.necesidades.find((n) => n.id === a.origen)
      if (!o || a.origen === a.destino) return s
      return {
        ...s,
        necesidades: s.necesidades
          .filter((n) => n.id !== a.origen)
          .map((n) =>
            n.id === a.destino
              ? { ...n, apoyos: n.apoyos + o.apoyos, apoyada: n.apoyada || o.apoyada, comentarios: [...n.comentarios, ...o.comentarios], fusionadas: [...(n.fusionadas ?? []), o.titulo] }
              : n,
          ),
      }
    }
    case 'cargarVotos':
      return {
        ...s,
        consultas: s.consultas.map((c) => (c.id === a.id ? { ...c, opciones: c.opciones.map((o, i) => ({ ...o, votos: o.votos + (a.votos[i] ?? 0) })) } : c)),
      }
    case 'comentarNecesidad':
      return {
        ...s,
        necesidades: s.necesidades.map((n) => (n.id === a.id ? { ...n, comentarios: [...n.comentarios, { autor: a.autor, texto: a.texto, fecha: D.HOY }] } : n)),
      }
    case 'nuevaActividad':
      return { ...s, actividades: [a.a, ...s.actividades] }
    case 'validar':
      return { ...s, actividades: s.actividades.map((x) => (x.id === a.id ? { ...x, estado: a.ok ? 'aprobada' : 'rechazada' } : x)) }
    case 'subirDoc':
      return {
        ...s,
        documentos: s.documentos.map((d) =>
          d.id === a.id
            ? { ...d, archivo: a.archivo, estado: d.estado === 'por_vencer' ? 'vigente' : d.estado === 'pendiente' ? 'al_dia' : d.estado, vence: undefined, detalle: d.estado === 'pendiente' ? 'Subido recién' : d.detalle }
            : d,
        ),
      }
    case 'traspaso':
      return { ...s, juntas: s.juntas.map((j) => (j.id === a.juntaId ? { ...j, directiva: a.directiva, periodoHasta: a.hasta } : j)) }
    case 'nuevaAlerta':
      return { ...s, alertas: [a.a, ...s.alertas] }
    case 'comentarAlerta':
      return {
        ...s,
        alertas: s.alertas.map((x) => (x.id === a.id ? { ...x, comentarios: [...x.comentarios, { autor: a.autor, texto: a.texto, fecha: D.HOY }] } : x)),
      }
    case 'nuevaAyuda':
      return { ...s, ayudas: [a.a, ...s.ayudas] }
    case 'tomarAyuda':
      return { ...s, ayudas: s.ayudas.map((x) => (x.id === a.id && x.estado === 'abierta' ? { ...x, estado: 'en_curso', con: a.con, conId: a.conId } : x)) }
    case 'cumplirAyuda': {
      const ay = s.ayudas.find((x) => x.id === a.id)
      if (!ay || ay.estado === 'cumplida') return s
      // Las horas son para quien ayudó: el que respondió (si se pidió) o el autor (si se ofreció)
      const quien = ay.tipo === 'pide' ? ay.conId : ay.autorId
      return {
        ...s,
        ayudas: s.ayudas.map((x) => (x.id === a.id ? { ...x, estado: 'cumplida', gracias: a.gracias } : x)),
        horasExtra: sumarHoras(s.horasExtra, quien, ay.horas),
      }
    }
    case 'inscribir':
      return {
        ...s,
        convocatorias: s.convocatorias.map((c) =>
          c.id === a.id && !c.inscritosIds.includes(a.vecinoId) && c.inscritos < c.cupos
            ? { ...c, inscritos: c.inscritos + 1, inscritosIds: [...c.inscritosIds, a.vecinoId] }
            : c,
        ),
      }
    case 'asistir': {
      const c = s.convocatorias.find((x) => x.id === a.id)
      if (!c || c.asistieronIds.includes(a.vecinoId)) return s
      return {
        ...s,
        convocatorias: s.convocatorias.map((x) => (x.id === a.id ? { ...x, asistieronIds: [...x.asistieronIds, a.vecinoId] } : x)),
        horasExtra: sumarHoras(s.horasExtra, a.vecinoId, c.horas),
      }
    }
    case 'nuevaPropuesta':
      return { ...s, propuestas: [a.p, ...s.propuestas] }
    case 'decidirPropuesta':
      return { ...s, propuestas: s.propuestas.map((p) => (p.id === a.id ? { ...p, estado: a.ok ? 'aprobada' : 'rechazada' } : p)) }
    case 'nuevoEmprendedor':
      return { ...s, emprendedores: [a.e, ...s.emprendedores] }
    case 'aprobarEmprendedor':
      return { ...s, emprendedores: s.emprendedores.map((e) => (e.id === a.id ? { ...e, estado: 'publicado' } : e)) }
    case 'leccion':
      return s.leccionesHechas.includes(a.id) ? s : { ...s, leccionesHechas: [...s.leccionesHechas, a.id] }
    case 'moderar':
      return { ...s, reportes: s.reportes.map((r) => (r.id === a.id ? { ...r, resuelto: true } : r)) }
    case 'estadoJunta':
      return {
        ...s,
        juntas: s.juntas.map((j) =>
          j.id === a.id
            ? { ...j, estado: a.estado, sociosActivos: a.estado === 'activa' && j.sociosActivos === 0 ? Math.round(j.socios * 0.2) : j.sociosActivos }
            : j,
        ),
      }
    case 'cerrarTemporada':
      return { ...s, temporadaCerrada: a.cerrada }
    case 'setVecino':
      return { ...s, vecinoId: a.id }
    case 'reset':
      return inicial()
  }
}

const CLAVE = 'barrio-vivo-demo-v3'

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
    const t = setTimeout(() => setMsg(null), 3000)
    return () => clearTimeout(t)
  }, [msg])

  const toast = useCallback((m: string) => setMsg(m), [])

  const registrarActividad = useCallback((a: Omit<Actividad, 'id' | 'estado'>) => {
    const puntos = puntosActividad(a).total
    const pendiente = puntos > REGLAS.umbralRevision || !(a.fotos > 0 && a.qr > 0)
    dispatch({ t: 'nuevaActividad', a: { ...a, id: `n${Date.now()}`, estado: pendiente ? 'pendiente' : 'aprobada' } })
    return { puntos, pendiente }
  }, [])

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
