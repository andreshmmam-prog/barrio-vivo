// Estado del prototipo: datos de ejemplo + lo que el usuario hace en la demo.
// Se guarda en el navegador para que la demo recuerde votos, actividades, ayudas, etc.
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import * as D from '../data/demo'
import type {
  Fondo,
  RegistroHora,
  ResultadoPostulacion,
  Acuerdo,
  Asamblea,
  Movimiento,
  Prefs,
  Recuerdo,
  Reserva,
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
  asambleas: Asamblea[]
  recuerdos: Recuerdo[]
  movimientos: Movimiento[]
  reservas: Reserva[]
  postulaciones: Record<string, ResultadoPostulacion>
  fondos: Fondo[]
  horas: RegistroHora[]
  encuestas: Record<string, number[]>
  prefs: Prefs
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
  asambleas: D.ASAMBLEAS,
  recuerdos: D.RECUERDOS,
  movimientos: D.MOVIMIENTOS,
  reservas: D.RESERVAS,
  postulaciones: {},
  fondos: D.FONDOS,
  horas: D.HORAS,
  encuestas: {},
  prefs: { letraGrande: false, mapudungun: false },
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
  | { t: 'nuevaAsamblea'; a: Asamblea }
  | { t: 'irAsamblea'; id: string; vecinoId: string }
  | { t: 'iniciarAsamblea'; id: string }
  | { t: 'asistentesAsamblea'; id: string; n: number }
  | { t: 'acuerdo'; id: string; a: Acuerdo }
  | { t: 'cerrarAsamblea'; id: string }
  | { t: 'postular'; id: string }
  | { t: 'resultadoFondo'; id: string; r: ResultadoPostulacion }
  | { t: 'nuevoFondo'; f: Fondo }
  | { t: 'revisarFondo'; id: string }
  | { t: 'revisarHora'; ids: string[]; ok: boolean }
  | { t: 'autorizarHora'; id: string }
  | { t: 'encuesta'; vecinoId: string; r: number[] }
  | { t: 'nuevoRecuerdo'; r: Recuerdo }
  | { t: 'nuevoMovimiento'; m: Movimiento }
  | { t: 'reservar'; r: Reserva }
  | { t: 'decidirReserva'; id: string; ok: boolean }
  | { t: 'prefs'; p: Partial<Prefs> }
  | { t: 'reset' }

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
      const nombre = ay.tipo === 'pide' ? ay.con : ay.autor
      const v = D.VECINOS.find((x) => x.id === quien)
      const registro: RegistroHora = {
        id: `h${Date.now()}`, juntaId: ay.juntaId, vecinoId: quien, persona: nombre ?? 'Vecino', tramo: v?.tramo ?? ay.autorTramo, fecha: D.HOY,
        origen: 'ayuda', detalle: ay.titulo, con: ay.tipo === 'pide' ? ay.autor : ay.con, horas: Math.min(REGLAS.topeAyuda, ay.horas), estado: 'por_revisar',
        autorizacion: v?.tramo === '14-17' ? false : undefined,
      }
      return {
        ...s,
        ayudas: s.ayudas.map((x) => (x.id === a.id ? { ...x, estado: 'cumplida', gracias: a.gracias } : x)),
        horas: [...s.horas, registro],
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
        horas: [
          ...s.horas,
          {
            id: `h${Date.now()}`, juntaId: c.juntaId, vecinoId: a.vecinoId, persona: D.VECINOS.find((x) => x.id === a.vecinoId)?.corto ?? 'Vecino',
            tramo: D.VECINOS.find((x) => x.id === a.vecinoId)?.tramo ?? '30-59', fecha: D.HOY, origen: 'convocatoria', detalle: c.titulo, horas: c.horas, estado: 'aprobada',
          },
        ],
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
    case 'nuevaAsamblea':
      return { ...s, asambleas: [...s.asambleas, a.a] }
    case 'irAsamblea':
      return {
        ...s,
        asambleas: s.asambleas.map((x) => {
          if (x.id !== a.id) return x
          const va = x.vanIds.includes(a.vecinoId)
          return { ...x, vanIds: va ? x.vanIds.filter((i) => i !== a.vecinoId) : [...x.vanIds, a.vecinoId], confirmados: x.confirmados + (va ? -1 : 1) }
        }),
      }
    case 'iniciarAsamblea':
      return { ...s, asambleas: s.asambleas.map((x) => (x.id === a.id ? { ...x, estado: 'en_curso' } : x)) }
    case 'asistentesAsamblea':
      return { ...s, asambleas: s.asambleas.map((x) => (x.id === a.id ? { ...x, asistentes: Math.max(0, a.n) } : x)) }
    case 'acuerdo':
      return { ...s, asambleas: s.asambleas.map((x) => (x.id === a.id ? { ...x, acuerdos: [...x.acuerdos, a.a] } : x)) }
    case 'cerrarAsamblea': {
      const as = s.asambleas.find((x) => x.id === a.id)
      if (!as) return s
      const doc = {
        id: `acta-${as.id}`, juntaId: as.juntaId, tipo: `Acta asamblea ${as.tipo}`,
        detalle: `${as.fecha.split('-').reverse().join('-')} · ${as.asistentes} socios · ${as.acuerdos.length} acuerdos · generada en la app`,
        estado: 'al_dia' as const, archivo: `acta-${as.fecha}.pdf`,
      }
      return {
        ...s,
        asambleas: s.asambleas.map((x) => (x.id === a.id ? { ...x, estado: 'realizada' } : x)),
        documentos: [doc, ...s.documentos.filter((d) => d.id !== doc.id)],
      }
    }
    case 'postular':
      return s.postulaciones[a.id] ? s : { ...s, postulaciones: { ...s.postulaciones, [a.id]: 'postulado' } }
    case 'resultadoFondo':
      return { ...s, postulaciones: { ...s.postulaciones, [a.id]: a.r } }
    case 'nuevoFondo':
      return { ...s, fondos: [...s.fondos, a.f] }
    case 'revisarFondo':
      return { ...s, fondos: s.fondos.map((f) => (f.id === a.id ? { ...f, revisado: D.HOY } : f)) }
    case 'revisarHora':
      return { ...s, horas: s.horas.map((h) => (a.ids.includes(h.id) ? { ...h, estado: a.ok ? 'aprobada' : 'rechazada' } : h)) }
    case 'autorizarHora':
      return { ...s, horas: s.horas.map((h) => (h.id === a.id ? { ...h, autorizacion: true } : h)) }
    case 'encuesta':
      return { ...s, encuestas: { ...s.encuestas, [a.vecinoId]: a.r } }
    case 'nuevoRecuerdo':
      return { ...s, recuerdos: [a.r, ...s.recuerdos] }
    case 'nuevoMovimiento':
      return { ...s, movimientos: [a.m, ...s.movimientos] }
    case 'reservar':
      return { ...s, reservas: [...s.reservas, a.r] }
    case 'decidirReserva':
      return { ...s, reservas: s.reservas.map((x) => (x.id === a.id ? { ...x, estado: a.ok ? 'confirmada' : 'rechazada' } : x)) }
    case 'prefs':
      return { ...s, prefs: { ...s.prefs, ...a.p } }
    case 'reset':
      return inicial()
  }
}

const CLAVE = 'barrio-vivo-demo-v5'

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
