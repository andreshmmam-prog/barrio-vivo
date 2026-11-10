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
  registro?: 'qr' | 'papel' // cómo se registró la asistencia
}

export interface Comentario {
  autor: string
  texto: string
  fecha: string
}

/** Camino simple (respuesta) o camino de obra (proyecto), con trazabilidad hasta el final. */
export type EstadoNecesidad =
  | 'enviada'
  | 'recibida'
  | 'evaluacion'
  | 'respondida'
  | 'resuelta'
  | 'aprobada'
  | 'licitacion'
  | 'ejecucion'
  | 'finalizada'

export type RutaNecesidad = 'respuesta' | 'proyecto'

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
  ruta?: RutaNecesidad
  avance?: number // % de avance de la obra
  fusionadas?: string[] // títulos de necesidades iguales que se sumaron a esta
  origen?: 'app' | 'asamblea'
  punto?: Punto
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
  emitido?: string // fecha de emisión (los fondos piden antigüedad máxima)
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
  punto?: Punto
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

/** Punto en el mapa esquemático del barrio (0 a 100 en x, 0 a 70 en y) */
export interface Punto {
  x: number
  y: number
}

export interface Acuerdo {
  texto: string
  favor: number
  contra: number
  abstencion: number
}

/** Asamblea de socios: convocatoria, quórum en vivo, acuerdos y acta */
export interface Asamblea {
  id: string
  juntaId: string
  tipo: 'ordinaria' | 'extraordinaria'
  fecha: string
  hora: string
  lugar: string
  tabla: string[]
  quorum: number // socios necesarios según estatutos
  estado: 'convocada' | 'en_curso' | 'realizada'
  asistentes: number
  acuerdos: Acuerdo[]
  vanIds: string[] // vecinos que confirmaron
  confirmados: number
}

/** Requisitos estándar en que se traducen las bases de cada fondo */
export type Requisito =
  | 'Certificado de vigencia'
  | 'Certificado de directorio'
  | 'Estatutos certificados'
  | 'RUT de la organización'
  | 'Inscripción como organización de interés público'
  | 'Registro de receptores de fondos públicos (Ley 19.862)'
  | 'Rendiciones anteriores al día'
  | 'Acta de asamblea que respalda el proyecto'
  | 'Necesidad votada por los vecinos'
  | 'Fotos del lugar'
  | 'Actividades anteriores con fotos'
  | 'Socios activos'

/** Fondo concursable. Lo carga el municipio (sus fondos) o el equipo de Barrio Vivo, desde las bases oficiales. */
export interface Fondo {
  id: string
  nombre: string
  fuente: string
  monto: string
  apertura?: string
  cierre: string
  fechasEstimadas?: boolean // fechas proyectadas desde la convocatoria anterior, por confirmar
  areas: import('./areas').AreaId[]
  quienes: string // quién puede postular, según las bases
  requisitos: Requisito[]
  antiguedadMax?: number // días máximos de antigüedad de los certificados al abrir la postulación
  bases?: string // enlace a las bases oficiales
  portal?: string // dónde se postula
  revisado: string // última vez que alguien comparó la ficha con las bases
  cargadoPor: 'municipio' | 'barrio-vivo'
  ejemplo?: boolean
}

export type ResultadoPostulacion = 'postulado' | 'adjudicado' | 'no_adjudicado'

/** Horas de voluntariado: se registran, la directiva las revisa y la junta las certifica. */
export interface RegistroHora {
  id: string
  juntaId: string
  vecinoId?: string
  persona: string
  tramo: Tramo
  fecha: string
  origen: 'convocatoria' | 'ayuda' | 'actividad' | 'embajador'
  detalle: string
  horas: number
  con?: string // en Manos Vecinas: a quién se ayudó
  estado: 'por_revisar' | 'aprobada' | 'rechazada'
  autorizacion?: boolean // 14 a 17 años: autorización del apoderado registrada
}

/** Memoria del barrio: fotos antiguas, relatos y entrevistas */
export interface Recuerdo {
  id: string
  juntaId: string
  titulo: string
  epoca: string
  relato: string
  autor: string
  tipo: 'foto' | 'relato' | 'entrevista'
  fecha: string
}

/** Movimiento de tesorería, visible para los socios */
export interface Movimiento {
  id: string
  juntaId: string
  fecha: string
  tipo: 'ingreso' | 'gasto'
  concepto: string
  monto: number
  respaldo: boolean
}

/** Reserva de la sede o de un bien común */
export interface Reserva {
  id: string
  juntaId: string
  recurso: string
  fecha: string
  bloque: 'Mañana' | 'Tarde' | 'Noche'
  quien: string
  motivo: string
  estado: 'pendiente' | 'confirmada' | 'rechazada'
}

export interface Prefs {
  letraGrande: boolean
  mapudungun: boolean
}
