import type { AreaId } from './areas'

export type SectorId = 'norte' | 'centro' | 'sur' | 'poniente' | 'rural'

/** A quién va dirigida una actividad */
export type Publico = 'todas' | 'ninos' | 'jovenes' | 'mayores'

/** Tramo de edad. La plataforma guarda el tramo, no la fecha de nacimiento. */
export type Tramo = '14-17' | '18-29' | '30-59' | '60+'

export interface Sector {
  id: SectorId
  nombre: string
  tipo: 'urbano' | 'rural'
}

export interface Cargo {
  cargo: 'Presidencia' | 'Secretaría' | 'Tesorería'
  nombre: string
}

export interface Junta {
  id: string
  nombre: string
  sector: SectorId
  unidadVecinal: string
  fundacion: number
  socios: number
  sociosActivos: number
  directiva: Cargo[]
  periodoHasta: string // ISO
  estado: 'invitada' | 'documentos' | 'activa'
}

export interface Actividad {
  id: string
  juntaId: string
  nombre: string
  area: AreaId
  publico: Publico
  fecha: string // ISO
  lugar: string
  asistentes: number
  fotos: number
  qr: number
  jovenes: number // asistentes de 14 a 29 años registrados con QR
  alianzaCon?: string // id de otra junta
  estado: 'pendiente' | 'aprobada' | 'rechazada'
  hito?: boolean // para Seguridad: logro sin asistentes
}

export interface Comentario {
  autor: string
  texto: string
  fecha: string
}

export type EstadoNecesidad = 'enviada' | 'recibida' | 'evaluacion' | 'respondida' | 'resuelta'

export interface Necesidad {
  id: string
  juntaId: string
  titulo: string
  detalle: string
  area: AreaId
  apoyos: number
  apoyada?: boolean
  estado: EstadoNecesidad
  enviada: string // ISO
  respuesta?: string
  actualizada?: string
  comentarios: Comentario[]
}

export interface Opcion {
  texto: string
  votos: number
}

/** Consulta a los socios. Orienta a la directiva; no reemplaza a la asamblea. */
export interface Consulta {
  id: string
  juntaId: string
  pregunta: string
  opciones: Opcion[]
  cierre: string // ISO
  quorum: number // porcentaje
  votoDe: Record<string, number> // vecinoId -> opción
}

export interface Documento {
  id: string
  juntaId: string
  tipo: string
  detalle: string
  estado: 'vigente' | 'por_vencer' | 'al_dia' | 'pendiente'
  vence?: string
  archivo?: string
}

export type TipoAlerta = 'oficial' | 'corte' | 'operativo' | 'mascota' | 'transito' | 'seguridad' | 'emergencia'

/** Un aviso en "El Queltehue avisa" */
export interface Alerta {
  id: string
  juntaId: string
  tipo: TipoAlerta
  titulo: string
  texto: string
  fecha: string
  autor: string
  comentarios: Comentario[]
}

export interface Emprendedor {
  id: string
  juntaId: string
  nombre: string
  vendedor: string
  rubro: string
  descripcion: string
  precio: string
  contacto: string
  estado: 'publicado' | 'revision'
}

export type CategoriaAyuda = 'acompanar' | 'cargar' | 'prestar' | 'ensenar' | 'cuidar' | 'reparar'

/** Una ayuda en Manos Vecinas */
export interface Ayuda {
  id: string
  juntaId: string
  tipo: 'pide' | 'ofrece'
  categoria: CategoriaAyuda
  titulo: string
  detalle: string
  autor: string
  autorId?: string
  autorTramo: Tramo
  fecha: string
  horas: number
  estado: 'abierta' | 'en_curso' | 'cumplida'
  con?: string // quien ayuda (si pide) o a quien se ayuda (si ofrece)
  conId?: string
  gracias?: string
}

/** Convocatoria de voluntariado de la junta */
export interface Convocatoria {
  id: string
  juntaId: string
  titulo: string
  detalle: string
  fecha: string
  area: AreaId
  cupos: number
  inscritos: number
  horas: number
  paraJovenes?: boolean
  inscritosIds: string[]
  asistieronIds: string[]
}

/** Actividad propuesta por jóvenes, que la directiva aprueba */
export interface Propuesta {
  id: string
  juntaId: string
  titulo: string
  detalle: string
  area: AreaId
  autor: string
  fecha: string
  estado: 'pendiente' | 'aprobada' | 'rechazada'
}

export interface Leccion {
  id: string
  titulo: string
  minutos: number
  resumen: string
}

export interface Ley {
  id: string
  nombre: string
  titulo: string
  puntos: string[]
}

export interface Reporte {
  id: string
  tipo: 'comentario' | 'aviso' | 'emprendimiento' | 'foto'
  detalle: string
  junta: string
  critico?: boolean
  resuelto?: boolean
}

export interface Socio {
  nombre: string
  desde: number
  participaciones: number
  tramo: Tramo
}

export interface Membresia {
  organizacion: string
  rol: string
}

/** Persona: un perfil individual con uno o más perfiles comunitarios */
export interface Vecino {
  id: string
  nombre: string
  corto: string
  edad: number
  tramo: Tramo
  juntaId: string
  horasBase: number
  actividades: number
  membresias: Membresia[]
  embajador?: boolean
}
