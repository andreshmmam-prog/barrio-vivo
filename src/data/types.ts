import type { AreaId } from './areas'

export type SectorId = 'norte' | 'centro' | 'sur' | 'poniente' | 'rural'

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
  fecha: string // ISO
  lugar: string
  asistentes: number
  fotos: number
  qr: number
  alianzaCon?: string // id de otra junta
  estado: 'pendiente' | 'aprobada' | 'rechazada'
  hito?: boolean // para Seguridad: logro sin asistentes
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
}

export interface Opcion {
  texto: string
  votos: number
}

export interface Votacion {
  id: string
  juntaId: string
  pregunta: string
  opciones: Opcion[]
  cierre: string // ISO
  quorum: number // porcentaje
  miVoto?: number
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

export interface Aviso {
  id: string
  juntaId: string
  titulo: string
  texto: string
  fecha: string
}

export interface Comentario {
  autor: string
  texto: string
  fecha: string
}

export interface Hilo {
  id: string
  juntaId: string
  titulo: string
  autor: string
  comentarios: Comentario[]
}

export interface Producto {
  id: string
  juntaId: string
  nombre: string
  vendedor: string
  precio: string
  categoria: string
  descripcion: string
  estado: 'publicado' | 'revision'
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
  tipo: 'comentario' | 'producto' | 'foto'
  detalle: string
  junta: string
  critico?: boolean
  resuelto?: boolean
}

export interface Socio {
  nombre: string
  desde: number
  participaciones: number
}
