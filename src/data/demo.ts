// Datos de ejemplo para el prototipo. Nombres de juntas y personas son ficticios.
import type { AreaId } from './areas'
import type {
  Asamblea,
  Fondo,
  Movimiento,
  Recuerdo,
  Reserva,
  Actividad,
  Alerta,
  Ayuda,
  Consulta,
  Convocatoria,
  Documento,
  Emprendedor,
  Junta,
  Leccion,
  Ley,
  Necesidad,
  Propuesta,
  Publico,
  Reporte,
  Sector,
  Socio,
  Vecino,
} from './types'

export const HOY = '2026-11-07'
export const COMUNA = 'Comuna Demo'
export const TEMPORADA = {
  nombre: 'Temporada Primavera 2026',
  inicio: '2026-07-01',
  fin: '2026-12-31',
  premiacion: '2027-01-15',
}

export const SECTORES: Sector[] = [
  { id: 'norte', nombre: 'Norte', tipo: 'urbano' },
  { id: 'centro', nombre: 'Centro', tipo: 'urbano' },
  { id: 'sur', nombre: 'Sur', tipo: 'urbano' },
  { id: 'poniente', nombre: 'Poniente', tipo: 'urbano' },
  { id: 'rural', nombre: 'Rural', tipo: 'rural' },
]

export const JUNTAS: Junta[] = [
  {
    id: 'aromos', nombre: 'Villa Los Aromos', sector: 'centro', unidadVecinal: 'UV 12', fundacion: 1987,
    socios: 120, sociosActivos: 68, periodoHasta: '2027-03-31', estado: 'activa',
    directiva: [
      { cargo: 'Presidencia', nombre: 'Rosa Catrileo' },
      { cargo: 'Secretaría', nombre: 'Jorge Muñoz' },
      { cargo: 'Tesorería', nombre: 'Patricia Sandoval' },
    ],
  },
  {
    id: 'copihues', nombre: 'Los Copihues', sector: 'norte', unidadVecinal: 'UV 4', fundacion: 1992,
    socios: 85, sociosActivos: 41, periodoHasta: '2028-05-31', estado: 'activa',
    directiva: [
      { cargo: 'Presidencia', nombre: 'Luis Painemal' },
      { cargo: 'Secretaría', nombre: 'Carla Vergara' },
      { cargo: 'Tesorería', nombre: 'Héctor Ríos' },
    ],
  },
  {
    id: 'mirador', nombre: 'El Mirador', sector: 'poniente', unidadVecinal: 'UV 19', fundacion: 2004,
    socios: 64, sociosActivos: 35, periodoHasta: '2027-02-28', estado: 'activa',
    directiva: [
      { cargo: 'Presidencia', nombre: 'Ana Huenchullán' },
      { cargo: 'Secretaría', nombre: 'Pedro Lagos' },
      { cargo: 'Tesorería', nombre: 'Marcela Toro' },
    ],
  },
  {
    id: 'esperanza', nombre: 'Población Esperanza', sector: 'sur', unidadVecinal: 'UV 22', fundacion: 1975,
    socios: 210, sociosActivos: 48, periodoHasta: '2027-01-31', estado: 'activa',
    directiva: [
      { cargo: 'Presidencia', nombre: 'Manuel Quilaqueo' },
      { cargo: 'Secretaría', nombre: 'Gloria Fuentes' },
      { cargo: 'Tesorería', nombre: 'Raúl Contreras' },
    ],
  },
  {
    id: 'araucarias', nombre: 'Villa Las Araucarias', sector: 'norte', unidadVecinal: 'UV 6', fundacion: 1998,
    socios: 150, sociosActivos: 62, periodoHasta: '2028-08-31', estado: 'activa',
    directiva: [
      { cargo: 'Presidencia', nombre: 'Claudia Morales' },
      { cargo: 'Secretaría', nombre: 'Iván Cárcamo' },
      { cargo: 'Tesorería', nombre: 'Sonia Pérez' },
    ],
  },
  {
    id: 'santarosa', nombre: 'Santa Rosa', sector: 'sur', unidadVecinal: 'UV 25', fundacion: 1983,
    socios: 95, sociosActivos: 22, periodoHasta: '2027-06-30', estado: 'activa',
    directiva: [
      { cargo: 'Presidencia', nombre: 'Juan Llancaqueo' },
      { cargo: 'Secretaría', nombre: 'Verónica Soto' },
      { cargo: 'Tesorería', nombre: 'Ernesto Vidal' },
    ],
  },
  {
    id: 'boldos', nombre: 'Sector Rural Los Boldos', sector: 'rural', unidadVecinal: 'UV 31', fundacion: 1969,
    socios: 40, sociosActivos: 9, periodoHasta: '2028-03-31', estado: 'activa',
    directiva: [
      { cargo: 'Presidencia', nombre: 'Rosa Ancamil' },
      { cargo: 'Secretaría', nombre: 'Tomás Nahuel' },
      { cargo: 'Tesorería', nombre: 'Elena Huaiquil' },
    ],
  },
  {
    id: 'bosque', nombre: 'Villa El Bosque', sector: 'centro', unidadVecinal: 'UV 14', fundacion: 2010,
    socios: 130, sociosActivos: 57, periodoHasta: '2027-09-30', estado: 'activa',
    directiva: [
      { cargo: 'Presidencia', nombre: 'Daniela Riquelme' },
      { cargo: 'Secretaría', nombre: 'Felipe Araya' },
      { cargo: 'Tesorería', nombre: 'Lorena Castro' },
    ],
  },
  {
    id: 'lagos', nombre: 'Villa Los Lagos', sector: 'poniente', unidadVecinal: 'UV 20', fundacion: 2015,
    socios: 70, sociosActivos: 0, periodoHasta: '2028-04-30', estado: 'documentos',
    directiva: [
      { cargo: 'Presidencia', nombre: 'Andrea Millán' },
      { cargo: 'Secretaría', nombre: 'Cristian Peña' },
      { cargo: 'Tesorería', nombre: 'Ximena Rojas' },
    ],
  },
  {
    id: 'quillem', nombre: 'Comunidad Rural Quillem', sector: 'rural', unidadVecinal: 'UV 33', fundacion: 1990,
    socios: 35, sociosActivos: 0, periodoHasta: '2027-12-31', estado: 'invitada',
    directiva: [
      { cargo: 'Presidencia', nombre: 'Mario Calfuqueo' },
      { cargo: 'Secretaría', nombre: 'Rocío Antilef' },
      { cargo: 'Tesorería', nombre: 'Pablo Neculmán' },
    ],
  },
]

// ---- Personas de ejemplo --------------------------------------------------------
// Un perfil individual por persona; las membresías son sus perfiles comunitarios.

// Vulnerabilidad socioterritorial por sector: DATO DE EJEMPLO.
// En la versión real se toma del índice oficial del Ministerio de Desarrollo Social, por unidad vecinal.
export const VULNERABILIDAD: Record<string, 'baja' | 'media' | 'alta'> = {
  norte: 'media', centro: 'baja', sur: 'alta', poniente: 'media', rural: 'alta',
}

export const RED_CUIDADOS = 'Red Local de Apoyos y Cuidados · Municipalidad [TELÉFONO]'

export const VECINOS: Vecino[] = [
  {
    id: 'marta', nombre: 'Marta González', corto: 'Marta G.', edad: 52, tramo: '30-59', juntaId: 'aromos',
    horasBase: 26, actividades: 9,
    membresias: [{ organizacion: 'JJVV Villa Los Aromos', rol: 'Socia' }],
  },
  {
    id: 'javiera', nombre: 'Javiera Toledo', corto: 'Javiera T.', edad: 22, tramo: '18-29', juntaId: 'aromos',
    horasBase: 31, actividades: 12, embajador: true,
    membresias: [
      { organizacion: 'JJVV Villa Los Aromos', rol: 'Socia · Embajadora digital' },
      { organizacion: 'Club Deportivo Los Aromos', rol: 'Voluntaria' },
    ],
  },
]

export const TRAMOS: Record<string, string> = {
  '14-17': 'Joven 14–17',
  '18-29': 'Joven 18–29',
  '30-59': 'Adulto 30–59',
  '60+': 'Adulto mayor',
}

export const esJoven = (tramo: string) => tramo === '14-17' || tramo === '18-29'

// ---- Actividades ------------------------------------------------------------
// Se generan de forma determinista a partir del perfil de cada junta,
// para que el prototipo tenga una temporada creíble con brechas visibles.

const NOMBRES: Record<AreaId, string[]> = {
  cultura: ['Taller de telar mapuche', 'Fiesta costumbrista', 'Celebración de Fiestas Patrias', 'Cine en la plaza', 'Recorrido por la historia del barrio', 'Encuentro de cueca'],
  deporte: ['Campeonato de baby fútbol infantil', 'Corrida familiar', 'Baile entretenido', 'Torneo de rayuela', 'Cicletada del barrio', 'Juegos tradicionales para niños'],
  social: ['Bingo solidario', 'Colecta para familia afectada', 'Once con adultos mayores', 'Olla común de invierno', 'Ropero comunitario', 'Navidad para niños del barrio'],
  mejora: ['Pintura de la sede', 'Instalación de luminarias', 'Arreglo de juegos de la plaza', 'Postulación a fondo vecinal', 'Reparación de veredas', 'Mural comunitario'],
  salud: ['Operativo de salud y toma de presión', 'Charla de salud mental', 'Vacunación en la sede', 'Taller de alimentación saludable', 'Pausa activa para adultos mayores'],
  ambiente: ['Limpieza del canal', 'Plantación de árboles nativos', 'Punto limpio de reciclaje', 'Huerto comunitario', 'Retiro de microbasural'],
  seguridad: ['Instalación de alarma comunitaria', 'Reunión con Seguridad Municipal', 'Mesa de convivencia vecinal', 'Recuperación de pasaje oscuro', 'Taller de prevención'],
}

// Cuántas actividades tuvo cada junta en cada área (cultura, deporte, social, mejora, salud, ambiente, seguridad)
const PERFIL: Record<string, number[]> = {
  aromos: [3, 4, 2, 2, 0, 1, 2],
  copihues: [1, 4, 2, 1, 1, 0, 1],
  mirador: [1, 1, 0, 3, 3, 3, 0],
  esperanza: [0, 4, 4, 1, 0, 1, 0],
  araucarias: [3, 3, 1, 2, 0, 0, 2],
  santarosa: [0, 2, 2, 0, 0, 0, 0],
  boldos: [1, 0, 2, 0, 0, 1, 0],
  bosque: [3, 2, 1, 1, 1, 0, 2],
  lagos: [0, 0, 0, 0, 0, 0, 0],
  quillem: [0, 0, 0, 0, 0, 0, 0],
}

// Proporción habitual de jóvenes (14 a 29) entre los asistentes de cada junta
const JUVENTUD: Record<string, number> = {
  aromos: 0.22, copihues: 0.34, mirador: 0.15, esperanza: 0.38, araucarias: 0.26, santarosa: 0.1, boldos: 0.07, bosque: 0.31, lagos: 0.2, quillem: 0.1,
}

const LUGARES = ['Sede vecinal', 'Plaza del barrio', 'Multicancha', 'Escuela del sector', 'Calle principal']
const AREA_IDS: AreaId[] = ['cultura', 'deporte', 'social', 'mejora', 'salud', 'ambiente', 'seguridad']

function lcg(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

/** Jóvenes esperados entre los registrados con QR, según el público de la actividad. */
export function jovenesEsperados(qr: number, publico: Publico, base = 0.22) {
  const f = publico === 'jovenes' ? 2.8 : publico === 'mayores' ? 0.15 : publico === 'ninos' ? 0.6 : 1
  return Math.round(qr * Math.min(0.9, base * f))
}

function generarActividades(): Actividad[] {
  const out: Actividad[] = []
  const rnd = lcg(42)
  const ids = JUNTAS.map((j) => j.id)
  let n = 0
  for (const junta of JUNTAS) {
    const perfil = PERFIL[junta.id]
    AREA_IDS.forEach((area, ai) => {
      for (let k = 0; k < perfil[ai]; k++) {
        const nombres = NOMBRES[area]
        const nombre = nombres[(k + ai + n) % nombres.length]
        const dia = Math.floor(rnd() * 120)
        const fecha = new Date(Date.UTC(2026, 6, 1) + dia * 86400000).toISOString().slice(0, 10)
        const asistentes = 12 + Math.floor(rnd() * Math.min(80, junta.socios * 0.6))
        const verificada = rnd() > 0.25
        const alianza = rnd() > 0.78
        const otra = ids[(ids.indexOf(junta.id) + 1 + Math.floor(rnd() * 6)) % 8]
        const p = rnd()
        const publico: Publico = /adultos mayores|Pausa activa|Once/.test(nombre)
          ? 'mayores'
          : /niños|infantil/.test(nombre)
            ? 'ninos'
            : p < 0.22
              ? 'jovenes'
              : 'todas'
        const qr = verificada ? Math.floor(asistentes * 0.8) : 0
        out.push({
          id: `a${++n}`,
          juntaId: junta.id,
          nombre,
          area,
          publico,
          fecha,
          lugar: LUGARES[Math.floor(rnd() * LUGARES.length)],
          asistentes,
          fotos: verificada ? 2 + Math.floor(rnd() * 6) : 0,
          qr,
          jovenes: jovenesEsperados(qr, publico, JUVENTUD[junta.id]),
          alianzaCon: alianza && otra !== junta.id ? otra : undefined,
          estado: 'aprobada',
        })
      }
    })
  }
  // Algunas actividades recientes esperando validación
  out.push(
    { id: 'p1', juntaId: 'mirador', nombre: 'Operativo de salud con el CESFAM', area: 'salud', publico: 'todas', fecha: '2026-11-01', lugar: 'Sede vecinal', asistentes: 38, fotos: 6, qr: 38, jovenes: 6, alianzaCon: 'aromos', estado: 'pendiente' },
    { id: 'p2', juntaId: 'copihues', nombre: 'Limpieza del canal', area: 'ambiente', publico: 'jovenes', fecha: '2026-10-30', lugar: 'Canal Las Vertientes', asistentes: 22, fotos: 4, qr: 22, jovenes: 15, estado: 'pendiente' },
    { id: 'p3', juntaId: 'esperanza', nombre: 'Bingo solidario', area: 'social', publico: 'todas', fecha: '2026-10-31', lugar: 'Sede vecinal', asistentes: 210, fotos: 0, qr: 210, jovenes: 41, estado: 'pendiente' },
  )
  return out.sort((a, b) => b.fecha.localeCompare(a.fecha))
}

export const ACTIVIDADES: Actividad[] = generarActividades()

// ---- Necesidades -------------------------------------------------------------

export const NECESIDADES: Necesidad[] = [
  { id: 'n1', punto: { x: 25, y: 20 }, juntaId: 'aromos', titulo: 'Pasaje Los Robles sin luz, se siente inseguro', detalle: 'Tres postes sin ampolleta hace dos meses.', area: 'seguridad', apoyos: 58, estado: 'licitacion', ruta: 'proyecto', enviada: '2026-09-18', respuesta: 'Aprobada la reposición de 3 luminarias. Alumbrado Público la está licitando.', actualizada: '2026-10-28', comentarios: [{ autor: 'Jorge M.', texto: 'Anoche además robaron cables del poste de la esquina.', fecha: '2026-11-05' }] },
  { id: 'n12', punto: { x: 34, y: 20 }, juntaId: 'aromos', titulo: 'Postes sin luz en Los Robles', detalle: 'De noche no se ve nada en el pasaje.', area: 'seguridad', apoyos: 9, estado: 'enviada', enviada: '2026-11-02', comentarios: [] },
  { id: 'n2', punto: { x: 84, y: 60 }, juntaId: 'aromos', titulo: 'Microbasural en la esquina del canal', detalle: 'Se acumula basura y escombros cada fin de semana.', area: 'ambiente', apoyos: 34, estado: 'recibida', enviada: '2026-10-12', comentarios: [] },
  { id: 'n3', punto: { x: 56, y: 34 }, juntaId: 'aromos', titulo: 'Techo de la sede con goteras', detalle: 'En invierno no se puede usar el salón.', area: 'mejora', apoyos: 41, estado: 'respondida', enviada: '2026-08-05', respuesta: 'Puede postular al fondo vecinal 2027; Organizaciones Comunitarias apoya la postulación.', actualizada: '2026-09-10', comentarios: [] },
  { id: 'n4', punto: { x: 30, y: 40 }, juntaId: 'esperanza', titulo: 'Iluminación de pasajes del sector sur', detalle: 'Varios pasajes sin luz desde la tormenta.', area: 'seguridad', apoyos: 96, estado: 'enviada', enviada: '2026-09-02', comentarios: [] },
  { id: 'n5', punto: { x: 60, y: 30 }, juntaId: 'esperanza', titulo: 'Operativo de salud para adultos mayores', detalle: 'Muchos adultos mayores no llegan al CESFAM.', area: 'salud', apoyos: 52, estado: 'recibida', enviada: '2026-10-20', comentarios: [] },
  { id: 'n6', punto: { x: 22, y: 56 }, juntaId: 'copihues', titulo: 'Reparar juegos de la plaza', detalle: 'El columpio está roto y es peligroso.', area: 'mejora', apoyos: 47, estado: 'finalizada', ruta: 'proyecto', avance: 100, enviada: '2026-07-14', respuesta: 'Juegos reparados por la cuadrilla municipal.', actualizada: '2026-08-21', comentarios: [] },
  { id: 'n7', punto: { x: 70, y: 50 }, juntaId: 'araucarias', titulo: 'Retiro de microbasural en el sitio eriazo', detalle: 'Hay escombros y riesgo de incendio.', area: 'ambiente', apoyos: 88, estado: 'ejecucion', ruta: 'proyecto', avance: 60, enviada: '2026-08-28', respuesta: 'Aseo y Ornato retira escombros y cierra el sitio.', actualizada: '2026-10-30', comentarios: [] },
  { id: 'n8', punto: { x: 15, y: 20 }, juntaId: 'boldos', titulo: 'Paradero de buses sin techo', detalle: 'Los niños esperan el bus escolar bajo la lluvia.', area: 'mejora', apoyos: 29, estado: 'enviada', enviada: '2026-08-11', comentarios: [] },
  { id: 'n9', punto: { x: 50, y: 25 }, juntaId: 'santarosa', titulo: 'Más rondas preventivas en la noche', detalle: 'Han aumentado los robos en la villa.', area: 'seguridad', apoyos: 71, estado: 'recibida', enviada: '2026-10-05', comentarios: [] },
  { id: 'n10', punto: { x: 40, y: 55 }, juntaId: 'bosque', titulo: 'Taller de salud mental para jóvenes', detalle: 'Los jóvenes no tienen espacios de apoyo.', area: 'salud', apoyos: 38, estado: 'enviada', enviada: '2026-10-25', comentarios: [] },
  { id: 'n11', punto: { x: 75, y: 35 }, juntaId: 'mirador', titulo: 'Contenedores de reciclaje', detalle: 'Queremos separar residuos pero no hay dónde.', area: 'ambiente', apoyos: 44, estado: 'respondida', enviada: '2026-09-01', respuesta: 'Se instalará un punto limpio en el primer semestre 2027.', actualizada: '2026-09-29', comentarios: [] },
]

// ---- Consultas ----------------------------------------------------------------

export const CONSULTAS: Consulta[] = [
  { id: 'v1', juntaId: 'aromos', pregunta: '¿En qué usamos el fondo vecinal 2027?', cierre: '2026-11-12', quorum: 30, votoDe: {}, opciones: [{ texto: 'Luminarias en pasaje Los Robles', votos: 14 }, { texto: 'Reparar techo de la sede', votos: 19 }, { texto: 'Juegos para la plaza', votos: 8 }] },
  { id: 'v2', juntaId: 'aromos', pregunta: '¿Qué día prefieren para la asamblea de diciembre?', cierre: '2026-11-20', quorum: 20, votoDe: {}, opciones: [{ texto: 'Sábado en la mañana', votos: 22 }, { texto: 'Domingo en la tarde', votos: 11 }, { texto: 'Jueves en la noche', votos: 6 }] },
  { id: 'v3', juntaId: 'copihues', pregunta: '¿Celebramos la Navidad en la plaza o en la sede?', cierre: '2026-11-30', quorum: 25, votoDe: {}, opciones: [{ texto: 'En la plaza', votos: 18 }, { texto: 'En la sede', votos: 9 }] },
]

// ---- Documentos --------------------------------------------------------------

const DOC_BASE: Omit<Documento, 'id' | 'juntaId'>[] = [
  { tipo: 'Estatutos', detalle: 'PDF · versión vigente', estado: 'vigente', archivo: 'estatutos.pdf' },
  { tipo: 'Certificado de vigencia', detalle: 'Directiva y personalidad jurídica', estado: 'por_vencer', vence: '2026-11-24', archivo: 'certificado-vigencia.pdf' },
  { tipo: 'Actas de asamblea', detalle: '12 actas · incluye las consultas de la app', estado: 'al_dia', archivo: 'actas-2026.pdf' },
  { tipo: 'Libro de socios', detalle: 'Se actualiza solo con el padrón', estado: 'al_dia', archivo: 'libro-socios.pdf' },
  { tipo: 'RUT de la organización', detalle: 'Servicio de Impuestos Internos', estado: 'vigente', archivo: 'rut.pdf' },
  { tipo: 'Rendición fondo 2025', detalle: 'Falta subir', estado: 'pendiente' },
]

export const DOCUMENTOS: Documento[] = JUNTAS.flatMap((j, ji) =>
  DOC_BASE.map((d, di) => {
    let estado = d.estado
    if (j.estado !== 'activa' && di > 1) estado = 'pendiente'
    if (ji % 3 === 1 && di === 1) estado = 'vigente'
    if (ji % 4 === 2 && di === 5) estado = 'al_dia'
    return { ...d, estado, archivo: estado === 'pendiente' ? undefined : d.archivo, id: `${j.id}-d${di}`, juntaId: j.id }
  }),
)

// ---- El Queltehue avisa ----------------------------------------------------------

export const ALERTAS: Alerta[] = [
  { id: 'al1', juntaId: 'aromos', tipo: 'oficial', titulo: 'Asamblea ordinaria de diciembre', texto: 'Responde la consulta para elegir el día. La asamblea revisará el uso del fondo vecinal.', fecha: '2026-11-06', autor: 'Directiva', comentarios: [] },
  { id: 'al2', punto: { x: 18, y: 45 }, juntaId: 'aromos', tipo: 'corte', titulo: 'Corte de agua el jueves 12', texto: 'Entre 9:00 y 14:00 horas en calles Los Robles y Los Maitenes. Guarda agua la noche anterior.', fecha: '2026-11-06', autor: 'Empresa sanitaria · aviso programado', comentarios: [] },
  { id: 'al3', punto: { x: 22, y: 56 }, juntaId: 'aromos', tipo: 'mascota', titulo: 'Se perdió Canela', texto: 'Perrita café, mediana, con collar rojo. Se escapó el martes cerca de la plaza.', fecha: '2026-11-05', autor: 'Carmen R.', comentarios: [{ autor: 'Luis A.', texto: 'La vi esta mañana cerca de la multicancha.', fecha: '2026-11-06' }] },
  { id: 'al4', juntaId: 'aromos', tipo: 'operativo', titulo: 'Vacunación contra la influenza en la sede', texto: 'Martes 10, de 10:00 a 13:00 horas. Adultos mayores, embarazadas y enfermos crónicos. Trae tu carnet.', fecha: '2026-11-04', autor: 'CESFAM del sector', comentarios: [] },
  { id: 'al5', punto: { x: 28, y: 20 }, juntaId: 'aromos', tipo: 'seguridad', titulo: 'Infraestructura dañada', texto: 'Pasaje Los Robles · 05 nov, 23:00', fecha: '2026-11-05', autor: 'Jorge M.', comentarios: [] },
  { id: 'al6', punto: { x: 66, y: 45 }, juntaId: 'aromos', tipo: 'transito', titulo: 'Calle Los Maitenes cortada', texto: 'Trabajos de pavimentación hasta el viernes 13. Desvío por Los Robles.', fecha: '2026-11-03', autor: 'Directiva', comentarios: [] },
  { id: 'al7', juntaId: 'copihues', tipo: 'oficial', titulo: 'Inscripciones para Navidad', texto: 'Inscribe a tus niños hasta el 30 de noviembre con la secretaria.', fecha: '2026-11-02', autor: 'Directiva', comentarios: [] },
]

// ---- Manos Vecinas -----------------------------------------------------------------

export const AYUDAS: Ayuda[] = [
  { id: 'm1', juntaId: 'aromos', tipo: 'pide', categoria: 'acompanar', titulo: 'Acompañamiento al CESFAM el jueves 12', detalle: 'Tengo hora a las 10:30 y me cuesta ir solo en micro.', autor: 'Don Segundo H.', autorTramo: '60+', fecha: '2026-11-06', horas: 2, estado: 'abierta' },
  { id: 'm2', juntaId: 'aromos', tipo: 'pide', categoria: 'cargar', titulo: 'Ayuda para bajar cajas de la bodega', detalle: 'Son unas 6 cajas pesadas. Media hora de trabajo.', autor: 'Teresa M.', autorTramo: '60+', fecha: '2026-11-05', horas: 1, estado: 'abierta' },
  { id: 'm3', juntaId: 'aromos', tipo: 'ofrece', categoria: 'prestar', titulo: 'Presto escalera y taladro', detalle: 'Escalera de 3 metros y taladro percutor. Retiro en pasaje Los Maitenes.', autor: 'Jorge M.', autorTramo: '30-59', fecha: '2026-11-03', horas: 1, estado: 'abierta' },
  { id: 'm4', juntaId: 'aromos', tipo: 'ofrece', categoria: 'ensenar', titulo: 'Ayudo con tareas de matemáticas', detalle: 'Para niños de 1° a 8° básico, en la sede, martes y jueves en la tarde.', autor: 'Javiera T.', autorId: 'javiera', autorTramo: '18-29', fecha: '2026-11-02', horas: 2, estado: 'abierta' },
  { id: 'm5', juntaId: 'aromos', tipo: 'pide', categoria: 'cuidar', titulo: 'Regar plantas mientras viajo', detalle: 'Del 20 al 27 de noviembre. Son 10 macetas en el patio.', autor: 'Patricia S.', autorTramo: '30-59', fecha: '2026-11-04', horas: 2, estado: 'abierta' },
  { id: 'm6', juntaId: 'aromos', tipo: 'pide', categoria: 'ensenar', titulo: 'Aprender a hacer videollamadas', detalle: 'Quiero hablar con mis nietos que viven en Santiago.', autor: 'Rosa C.', autorTramo: '60+', fecha: '2026-11-01', horas: 1, estado: 'en_curso', con: 'Javiera T.', conId: 'javiera' },
  { id: 'm7', juntaId: 'aromos', tipo: 'pide', categoria: 'reparar', titulo: 'Arreglar la reja del antejardín', detalle: 'Se soltó una bisagra.', autor: 'Don Segundo H.', autorTramo: '60+', fecha: '2026-10-20', horas: 2, estado: 'cumplida', con: 'Luis A.', gracias: 'Quedó firme. ¡Gracias, Luis!' },
  { id: 'm8', juntaId: 'aromos', tipo: 'pide', categoria: 'acompanar', titulo: 'Acompañarme a la feria', detalle: 'Los sábados en la mañana.', autor: 'Teresa M.', autorTramo: '60+', fecha: '2026-10-18', horas: 2, estado: 'cumplida', con: 'Javiera T.', conId: 'javiera', gracias: 'Mil gracias, Javiera, por la paciencia y la conversa.' },
  { id: 'm9', juntaId: 'aromos', tipo: 'ofrece', categoria: 'prestar', titulo: 'Presto mesa y sillas para cumpleaños', detalle: '1 mesa larga y 10 sillas.', autor: 'Marta G.', autorId: 'marta', autorTramo: '30-59', fecha: '2026-10-10', horas: 1, estado: 'cumplida', con: 'Carmen R.', gracias: 'Salvaste el cumpleaños de la Sofi. ¡Gracias, Marta!' },
  // Otras juntas (para los datos agregados del municipio)
  ...(
    [
      ['copihues', 'acompanar', 4], ['copihues', 'ensenar', 3], ['copihues', 'cargar', 2],
      ['esperanza', 'acompanar', 6], ['esperanza', 'cuidar', 3], ['esperanza', 'reparar', 2],
      ['mirador', 'prestar', 3], ['mirador', 'acompanar', 1],
      ['araucarias', 'ensenar', 2], ['araucarias', 'reparar', 3],
      ['bosque', 'acompanar', 3], ['bosque', 'ensenar', 4],
      ['santarosa', 'cargar', 1], ['boldos', 'acompanar', 2],
    ] as [string, Ayuda['categoria'], number][]
  ).flatMap(([juntaId, categoria, n], i) =>
    Array.from({ length: n }, (_, k): Ayuda => ({
      id: `mx${i}-${k}`, juntaId, tipo: 'pide', categoria, titulo: 'Ayuda entre vecinos', detalle: '', autor: 'Vecino', autorTramo: k % 2 ? '60+' : '30-59',
      fecha: '2026-10-15', horas: 2, estado: 'cumplida', con: 'Vecino', gracias: '¡Gracias!',
    })),
  ),
]

export const CONVOCATORIAS: Convocatoria[] = [
  { id: 'c1', juntaId: 'aromos', titulo: 'Recepción de vecinos en el operativo de salud', detalle: 'Recibir a los vecinos, ordenar la fila y registrar asistencia con QR.', fecha: '2026-11-14', area: 'salud', cupos: 4, inscritos: 2, horas: 3, inscritosIds: [], asistieronIds: [] },
  { id: 'c2', juntaId: 'aromos', titulo: 'Limpieza del canal junto a El Mirador', detalle: 'Llevamos guantes y bolsas. Trae agua y gorro.', fecha: '2026-11-21', area: 'ambiente', cupos: 10, inscritos: 4, horas: 3, paraJovenes: true, inscritosIds: [], asistieronIds: [] },
  { id: 'c3', juntaId: 'aromos', titulo: 'Monitores para la corrida familiar', detalle: 'Guiar a los corredores en los cruces y repartir agua.', fecha: '2026-11-29', area: 'deporte', cupos: 8, inscritos: 5, horas: 4, paraJovenes: true, inscritosIds: [], asistieronIds: [] },
  { id: 'c4', juntaId: 'aromos', titulo: 'Armar las cajas de la colecta navideña', detalle: 'Clasificar alimentos y juguetes en la sede.', fecha: '2026-12-12', area: 'social', cupos: 6, inscritos: 3, horas: 3, inscritosIds: [], asistieronIds: [] },
]

export const PROPUESTAS: Propuesta[] = [
  { id: 'pj1', juntaId: 'aromos', titulo: 'Tocata en la plaza con bandas del barrio', detalle: 'Tres bandas locales, un sábado en la tarde. Necesitamos el permiso de la plaza y amplificación.', area: 'cultura', autor: 'Javiera T.', fecha: '2026-11-03', estado: 'pendiente' },
  { id: 'pj2', juntaId: 'aromos', titulo: 'Taller de skate para niños', detalle: 'Los domingos en la multicancha, con cascos prestados.', area: 'deporte', autor: 'Benjamín O.', fecha: '2026-11-01', estado: 'pendiente' },
  { id: 'pj3', juntaId: 'aromos', titulo: 'Mural sobre la historia de la villa', detalle: 'Con fotos antiguas que nos presten los vecinos fundadores.', area: 'cultura', autor: 'Francisca L.', fecha: '2026-10-12', estado: 'aprobada' },
]

// ---- Emprendedores del barrio --------------------------------------------------

export const EMPRENDEDORES: Emprendedor[] = [
  { id: 'e1', juntaId: 'aromos', nombre: 'Pan amasado y sopaipillas', vendedor: 'Carmen R.', rubro: 'Comida', precio: '$2.500 la docena', descripcion: 'Pedidos de lunes a sábado. Retiro en pasaje Los Maitenes.', contacto: '+56 9 5555 0101', estado: 'publicado' },
  { id: 'e2', juntaId: 'aromos', nombre: 'Arreglo de ropa y costura', vendedor: 'Marta G.', rubro: 'Servicios', precio: 'Desde $3.000', descripcion: 'Bastas, cierres y ajustes. Entrega en 48 horas.', contacto: '+56 9 5555 0102', estado: 'publicado' },
  { id: 'e3', juntaId: 'aromos', nombre: 'Huevos de campo', vendedor: 'Don Segundo H.', rubro: 'Comida', precio: '$4.000 la bandeja', descripcion: 'Bandeja de 30 huevos, gallinas libres.', contacto: '+56 9 5555 0103', estado: 'publicado' },
  { id: 'e4', juntaId: 'aromos', nombre: 'Clases de reforzamiento escolar', vendedor: 'Javiera T.', rubro: 'Servicios', precio: '$6.000 la hora', descripcion: 'Matemáticas y lenguaje, de 1° a 8° básico.', contacto: '+56 9 5555 0104', estado: 'publicado' },
  { id: 'e5', juntaId: 'aromos', nombre: 'Tejidos a palillo', vendedor: 'Rosa C.', rubro: 'Artesanía', precio: 'Desde $8.000', descripcion: 'Gorros, bufandas y chalecos a pedido.', contacto: '+56 9 5555 0105', estado: 'revision' },
]

// ---- Aprende ------------------------------------------------------------------

export const LECCIONES: Leccion[] = [
  { id: 'l1', titulo: '¿Qué hace una junta de vecinos?', minutos: 4, resumen: 'Para qué existe la junta, quiénes la forman y cómo representa al barrio ante el municipio.' },
  { id: 'l2', titulo: 'Tus derechos como socio', minutos: 5, resumen: 'Participar en asambleas, votar, ser elegido y pedir información sobre la gestión de la junta.' },
  { id: 'l3', titulo: 'Cómo funciona una asamblea', minutos: 6, resumen: 'Citación, quórum, acta y qué decisiones solo puede tomar la asamblea.' },
  { id: 'l4', titulo: 'Cómo postular a un fondo', minutos: 6, resumen: 'Qué documentos piden, cómo armar un presupuesto y cómo rendir lo que se gastó.' },
  { id: 'l5', titulo: 'El municipio por dentro', minutos: 5, resumen: 'Qué hacen el alcalde, el concejo, DIDECO y Organizaciones Comunitarias.' },
  { id: 'l6', titulo: 'Participación ciudadana en tu comuna', minutos: 5, resumen: 'Consejo de la sociedad civil, cuentas públicas y consultas ciudadanas.' },
  { id: 'l7', titulo: 'Convivencia y mediación vecinal', minutos: 4, resumen: 'Cómo resolver conflictos entre vecinos antes de que escalen.' },
  { id: 'l8', titulo: 'Cuidar los datos de tus vecinos', minutos: 4, resumen: 'Qué información se puede compartir, con quién y con qué permiso.' },
]

export const LEYES: Ley[] = [
  {
    id: 'ley19418', nombre: 'Ley 19.418', titulo: 'Juntas de vecinos y organizaciones comunitarias',
    puntos: [
      'Define qué son las juntas de vecinos y las organizaciones comunitarias, y cómo se constituyen.',
      'Establece los derechos de los socios: participar en asambleas, votar, elegir y ser elegidos.',
      'Regula cómo se elige la directiva y qué decisiones requieren asamblea.',
      'Ordena cómo la junta se relaciona con el municipio y accede a fondos.',
    ],
  },
  {
    id: 'ley20500', nombre: 'Ley 20.500', titulo: 'Asociaciones y participación ciudadana',
    puntos: [
      'Reconoce el derecho de las personas a asociarse y a participar en la gestión pública.',
      'Crea los consejos comunales de organizaciones de la sociedad civil.',
      'Promueve cuentas públicas participativas y consultas ciudadanas.',
      'Facilita que las organizaciones obtengan su personalidad jurídica.',
    ],
  },
]

export const EMERGENCIAS = [
  { numero: '131', nombre: 'Ambulancia' },
  { numero: '132', nombre: 'Bomberos' },
  { numero: '133', nombre: 'Carabineros' },
  { numero: '134', nombre: 'PDI' },
]

// ---- Moderación y padrón --------------------------------------------------------

export const REPORTES: Reporte[] = [
  { id: 'r1', tipo: 'comentario', detalle: 'Comentario con insultos en una necesidad', junta: 'Villa Los Aromos' },
  { id: 'r2', tipo: 'aviso', detalle: 'Aviso duplicado en El Queltehue avisa', junta: 'Los Copihues' },
  { id: 'r3', tipo: 'aviso', detalle: 'Aviso de seguridad con descripción física de una persona', junta: 'Santa Rosa', critico: true },
  { id: 'r4', tipo: 'foto', detalle: 'Foto con menores sin consentimiento de apoderados', junta: 'Población Esperanza', critico: true },
]

export const SOCIOS: Socio[] = [
  { nombre: 'Rosa Catrileo', desde: 1995, participaciones: 14, tramo: '60+' },
  { nombre: 'Jorge Muñoz', desde: 2003, participaciones: 12, tramo: '30-59' },
  { nombre: 'Javiera Toledo', desde: 2021, participaciones: 12, tramo: '18-29' },
  { nombre: 'Patricia Sandoval', desde: 2008, participaciones: 11, tramo: '30-59' },
  { nombre: 'Marta González', desde: 2011, participaciones: 9, tramo: '30-59' },
  { nombre: 'Carmen Riquelme', desde: 1999, participaciones: 8, tramo: '30-59' },
  { nombre: 'Luis Alarcón', desde: 2015, participaciones: 7, tramo: '30-59' },
  { nombre: 'Segundo Huenchumilla', desde: 1987, participaciones: 5, tramo: '60+' },
  { nombre: 'Francisca Lillo', desde: 2019, participaciones: 4, tramo: '18-29' },
  { nombre: 'Benjamín Ortiz', desde: 2024, participaciones: 3, tramo: '14-17' },
  { nombre: 'Teresa Mardones', desde: 2001, participaciones: 1, tramo: '60+' },
  { nombre: 'Andrés Valdebenito', desde: 2023, participaciones: 0, tramo: '18-29' },
]

// ---- Asambleas y actas -----------------------------------------------------------

export const ASAMBLEAS: Asamblea[] = [
  {
    id: 'as1', juntaId: 'aromos', tipo: 'ordinaria', fecha: '2026-09-12', hora: '11:00', lugar: 'Sede vecinal', quorum: 24,
    estado: 'realizada', asistentes: 37, confirmados: 31, vanIds: [],
    tabla: ['Cuenta de la directiva', 'Fiesta de la primavera', 'Necesidades para el municipio'],
    acuerdos: [
      { texto: 'Celebrar la fiesta de la primavera el 26 de septiembre en la plaza', favor: 33, contra: 1, abstencion: 3 },
      { texto: 'Enviar al municipio la necesidad de luminarias del pasaje Los Robles', favor: 37, contra: 0, abstencion: 0 },
    ],
  },
  {
    id: 'as2', juntaId: 'aromos', tipo: 'ordinaria', fecha: '2026-12-05', hora: '10:30', lugar: 'Sede vecinal', quorum: 24,
    estado: 'convocada', asistentes: 0, confirmados: 19, vanIds: [], acuerdos: [],
    tabla: ['Cuenta de tesorería', 'Uso del fondo vecinal 2027 (resultado de la consulta)', 'Formar la comisión electoral para marzo', 'Varios'],
  },
]

// ---- Fondos concursables (ejemplos: nombres, montos y fechas se ajustan a cada comuna) ----

export const FONDOS: Fondo[] = [
  {
    id: 'f1', nombre: 'Fondo de Desarrollo Vecinal', fuente: 'Municipalidad', monto: 'Hasta $1.500.000', cierre: '2026-11-28',
    areas: ['mejora', 'social', 'seguridad'],
    requisitos: ['Certificado de vigencia', 'Rendiciones anteriores al día', 'Acta de asamblea que respalda el proyecto', 'Necesidad votada por los vecinos', 'Fotos del lugar'],
  },
  {
    id: 'f2', nombre: 'Fondo regional de cultura y deporte', fuente: 'Gobierno Regional', monto: 'Hasta $3.000.000', cierre: '2026-12-18',
    areas: ['cultura', 'deporte'],
    requisitos: ['Certificado de vigencia', 'Rendiciones anteriores al día', 'Actividades anteriores con fotos', 'Socios activos', 'Acta de asamblea que respalda el proyecto'],
  },
  {
    id: 'f3', nombre: 'Fondo de seguridad vecinal', fuente: 'Programa nacional', monto: 'Hasta $5.000.000', cierre: '2027-01-15',
    areas: ['seguridad'],
    requisitos: ['Certificado de vigencia', 'Necesidad votada por los vecinos', 'Actividades anteriores con fotos', 'Acta de asamblea que respalda el proyecto'],
  },
  {
    id: 'f4', nombre: 'Fondo de fundaciones para barrios sustentables', fuente: 'Fundación privada', monto: 'Hasta $2.000.000', cierre: '2027-02-10',
    areas: ['ambiente', 'salud'],
    requisitos: ['Certificado de vigencia', 'Actividades anteriores con fotos', 'Socios activos'],
  },
]

/** Plazo de ejemplo para entregar la rendición pendiente */
export const PLAZO_RENDICION = '2026-11-30'

// ---- Encuesta anual de barrio (escala 1 a 5) ---------------------------------------

export const ENCUESTA = {
  nombre: 'Encuesta de barrio 2026',
  cierre: '2026-12-15',
  preguntas: [
    { id: 'seguridad', texto: '¿Te sientes seguro caminando por tu barrio de noche?', corto: 'Seguridad' },
    { id: 'conoce', texto: '¿Conoces a tus vecinos por su nombre?', corto: 'Conoce a sus vecinos' },
    { id: 'confianza', texto: '¿Confías en tu junta de vecinos?', corto: 'Confianza en la junta' },
    { id: 'influye', texto: '¿Sientes que puedes influir en lo que pasa en tu barrio?', corto: 'Puede influir' },
    { id: 'orgullo', texto: '¿Te sientes orgulloso de tu barrio?', corto: 'Orgullo de barrio' },
  ],
  escala: ['Nada', 'Poco', 'Más o menos', 'Bastante', 'Mucho'],
}

/** Promedios por sector y año (ejemplo). El orden sigue a ENCUESTA.preguntas. */
export const ENCUESTA_SECTOR: Record<string, { y2025: number[]; y2026: number[]; respuestas: number }> = {
  norte: { y2025: [2.9, 3.1, 3.0, 2.6, 3.4], y2026: [3.1, 3.4, 3.3, 2.9, 3.6], respuestas: 214 },
  centro: { y2025: [3.0, 3.3, 3.2, 2.8, 3.5], y2026: [3.3, 3.6, 3.6, 3.2, 3.8], respuestas: 268 },
  sur: { y2025: [2.2, 3.0, 2.6, 2.3, 3.1], y2026: [2.3, 3.1, 2.7, 2.4, 3.1], respuestas: 187 },
  poniente: { y2025: [3.2, 3.0, 3.1, 2.7, 3.3], y2026: [3.3, 3.2, 3.4, 3.0, 3.5], respuestas: 152 },
  rural: { y2025: [3.8, 4.4, 3.4, 2.9, 4.1], y2026: [3.8, 4.4, 3.3, 2.8, 4.1], respuestas: 96 },
}

/** Resultado de la junta de la directiva (ejemplo) */
export const ENCUESTA_JUNTA: Record<string, { y2025: number[]; y2026: number[]; respuestas: number }> = {
  aromos: { y2025: [2.8, 3.2, 3.1, 2.7, 3.4], y2026: [3.2, 3.7, 3.6, 3.3, 3.9], respuestas: 54 },
}

// ---- Memoria del barrio ----------------------------------------------------------

export const RECUERDOS: Recuerdo[] = [
  { id: 'r1', juntaId: 'aromos', tipo: 'relato', titulo: 'Cuando llegamos a la villa', epoca: '1987', autor: 'Don Segundo H.', fecha: '2026-08-14', relato: 'Éramos 40 familias y no había pavimento. Los sábados hacíamos minga para poner las soleras.' },
  { id: 'r2', juntaId: 'aromos', tipo: 'foto', titulo: 'La primera sede, de madera', epoca: '1990', autor: 'Rosa C.', fecha: '2026-09-02', relato: 'La levantamos entre todos con madera donada por el aserradero.' },
  { id: 'r3', juntaId: 'aromos', tipo: 'entrevista', titulo: 'Cómo llegó el agua potable', epoca: '1993', autor: 'Javiera T. entrevistó a Teresa M.', fecha: '2026-10-21', relato: 'Antes íbamos con baldes al pilón de la esquina. La junta juntó firmas durante un año.' },
  { id: 'r4', juntaId: 'aromos', tipo: 'foto', titulo: 'Fiesta de la primavera en la plaza', epoca: '1995', autor: 'Carmen R.', fecha: '2026-10-30', relato: 'Coronamos reina a la señora Elba y bailamos cueca hasta la noche.' },
]

// ---- Tesorería -------------------------------------------------------------------

export const MOVIMIENTOS: Movimiento[] = [
  { id: 't1', juntaId: 'aromos', fecha: '2026-11-03', tipo: 'ingreso', concepto: 'Cuotas sociales de octubre', monto: 136000, respaldo: true },
  { id: 't2', juntaId: 'aromos', fecha: '2026-10-28', tipo: 'gasto', concepto: 'Ampolletas y extensión para la sede', monto: 38500, respaldo: true },
  { id: 't3', juntaId: 'aromos', fecha: '2026-10-15', tipo: 'ingreso', concepto: 'Arriendo de la sede para un cumpleaños', monto: 25000, respaldo: true },
  { id: 't4', juntaId: 'aromos', fecha: '2026-10-02', tipo: 'gasto', concepto: 'Gas para la fiesta de la primavera', monto: 42000, respaldo: true },
  { id: 't5', juntaId: 'aromos', fecha: '2026-09-30', tipo: 'ingreso', concepto: 'Cuotas sociales de septiembre', monto: 128000, respaldo: true },
  { id: 't6', juntaId: 'aromos', fecha: '2026-09-27', tipo: 'gasto', concepto: 'Premios y decoración de la fiesta de la primavera', monto: 64300, respaldo: false },
]

/** Saldo con que partió el año (ejemplo) */
export const SALDO_INICIAL: Record<string, number> = { aromos: 412000 }

// ---- Sede y bienes comunes -------------------------------------------------------

export const RECURSOS = ['Salón de la sede', 'Toldo 6 x 3', 'Mesas y 40 sillas', 'Amplificación']

export const RESERVAS: Reserva[] = [
  { id: 'rs1', juntaId: 'aromos', recurso: 'Salón de la sede', fecha: '2026-11-14', bloque: 'Mañana', quien: 'CESFAM del sector', motivo: 'Operativo de salud', estado: 'confirmada' },
  { id: 'rs2', juntaId: 'aromos', recurso: 'Salón de la sede', fecha: '2026-11-15', bloque: 'Tarde', quien: 'Carmen R.', motivo: 'Cumpleaños de la Sofi', estado: 'pendiente' },
  { id: 'rs3', juntaId: 'aromos', recurso: 'Toldo 6 x 3', fecha: '2026-11-21', bloque: 'Mañana', quien: 'Directiva', motivo: 'Limpieza del canal', estado: 'confirmada' },
  { id: 'rs4', juntaId: 'aromos', recurso: 'Salón de la sede', fecha: '2026-11-17', bloque: 'Noche', quien: 'Club de adulto mayor', motivo: 'Taller de tejido', estado: 'confirmada' },
]
