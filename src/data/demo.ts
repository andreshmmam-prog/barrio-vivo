// Datos de ejemplo para el prototipo. Nombres de juntas y personas son ficticios.
import type { AreaId } from './areas'
import type {
  Actividad,
  Aviso,
  Documento,
  Hilo,
  Junta,
  Leccion,
  Ley,
  Necesidad,
  Producto,
  Reporte,
  Sector,
  Socio,
  Votacion,
} from './types'

export const HOY = '2026-11-04'
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

const LUGARES = ['Sede vecinal', 'Plaza del barrio', 'Multicancha', 'Escuela del sector', 'Calle principal']
const AREA_IDS: AreaId[] = ['cultura', 'deporte', 'social', 'mejora', 'salud', 'ambiente', 'seguridad']

function lcg(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
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
        // fechas entre julio y comienzos de noviembre
        const dia = Math.floor(rnd() * 120)
        const fecha = new Date(Date.UTC(2026, 6, 1) + dia * 86400000).toISOString().slice(0, 10)
        const asistentes = 12 + Math.floor(rnd() * Math.min(80, junta.socios * 0.6))
        const verificada = rnd() > 0.25
        const alianza = rnd() > 0.78
        const otra = ids[(ids.indexOf(junta.id) + 1 + Math.floor(rnd() * 6)) % 8]
        out.push({
          id: `a${++n}`,
          juntaId: junta.id,
          nombre,
          area,
          fecha,
          lugar: LUGARES[Math.floor(rnd() * LUGARES.length)],
          asistentes,
          fotos: verificada ? 2 + Math.floor(rnd() * 6) : 0,
          qr: verificada ? Math.floor(asistentes * 0.8) : 0,
          alianzaCon: alianza && otra !== junta.id ? otra : undefined,
          estado: 'aprobada',
        })
      }
    })
  }
  // Algunas actividades recientes esperando validación
  out.push(
    { id: 'p1', juntaId: 'mirador', nombre: 'Operativo de salud con el CESFAM', area: 'salud', fecha: '2026-11-01', lugar: 'Sede vecinal', asistentes: 38, fotos: 6, qr: 38, alianzaCon: 'aromos', estado: 'pendiente' },
    { id: 'p2', juntaId: 'copihues', nombre: 'Limpieza del canal', area: 'ambiente', fecha: '2026-10-30', lugar: 'Canal Las Vertientes', asistentes: 22, fotos: 4, qr: 22, estado: 'pendiente' },
    { id: 'p3', juntaId: 'esperanza', nombre: 'Bingo solidario', area: 'social', fecha: '2026-10-31', lugar: 'Sede vecinal', asistentes: 210, fotos: 0, qr: 210, estado: 'pendiente' },
  )
  return out.sort((a, b) => b.fecha.localeCompare(a.fecha))
}

export const ACTIVIDADES: Actividad[] = generarActividades()

// ---- Necesidades -------------------------------------------------------------

export const NECESIDADES: Necesidad[] = [
  { id: 'n1', juntaId: 'aromos', titulo: 'Pasaje Los Robles sin luz, se siente inseguro', detalle: 'Tres postes sin ampolleta hace dos meses.', area: 'seguridad', apoyos: 58, estado: 'evaluacion', enviada: '2026-09-18', respuesta: 'Derivado a Alumbrado Público para catastro.', actualizada: '2026-10-02' },
  { id: 'n2', juntaId: 'aromos', titulo: 'Microbasural en la esquina del canal', detalle: 'Se acumula basura y escombros cada fin de semana.', area: 'ambiente', apoyos: 34, estado: 'recibida', enviada: '2026-10-12' },
  { id: 'n3', juntaId: 'aromos', titulo: 'Techo de la sede con goteras', detalle: 'En invierno no se puede usar el salón.', area: 'mejora', apoyos: 41, estado: 'respondida', enviada: '2026-08-05', respuesta: 'Puede postular al fondo vecinal 2027; Organizaciones Comunitarias apoya la postulación.', actualizada: '2026-09-10' },
  { id: 'n4', juntaId: 'esperanza', titulo: 'Iluminación de pasajes del sector sur', detalle: 'Varios pasajes sin luz desde la tormenta.', area: 'seguridad', apoyos: 96, estado: 'enviada', enviada: '2026-09-02' },
  { id: 'n5', juntaId: 'esperanza', titulo: 'Operativo de salud para adultos mayores', detalle: 'Muchos adultos mayores no llegan al CESFAM.', area: 'salud', apoyos: 52, estado: 'recibida', enviada: '2026-10-20' },
  { id: 'n6', juntaId: 'copihues', titulo: 'Reparar juegos de la plaza', detalle: 'El columpio está roto y es peligroso.', area: 'mejora', apoyos: 47, estado: 'resuelta', enviada: '2026-07-14', respuesta: 'Juegos reparados por la cuadrilla municipal.', actualizada: '2026-08-21' },
  { id: 'n7', juntaId: 'araucarias', titulo: 'Retiro de microbasural en el sitio eriazo', detalle: 'Hay escombros y riesgo de incendio.', area: 'ambiente', apoyos: 88, estado: 'evaluacion', enviada: '2026-08-28', respuesta: 'Programado con Aseo y Ornato.', actualizada: '2026-09-15' },
  { id: 'n8', juntaId: 'boldos', titulo: 'Paradero de buses sin techo', detalle: 'Los niños esperan el bus escolar bajo la lluvia.', area: 'mejora', apoyos: 29, estado: 'enviada', enviada: '2026-08-11' },
  { id: 'n9', juntaId: 'santarosa', titulo: 'Más rondas preventivas en la noche', detalle: 'Han aumentado los robos en la villa.', area: 'seguridad', apoyos: 71, estado: 'recibida', enviada: '2026-10-05' },
  { id: 'n10', juntaId: 'bosque', titulo: 'Taller de salud mental para jóvenes', detalle: 'Los jóvenes no tienen espacios de apoyo.', area: 'salud', apoyos: 38, estado: 'enviada', enviada: '2026-10-25' },
  { id: 'n11', juntaId: 'mirador', titulo: 'Contenedores de reciclaje', detalle: 'Queremos separar residuos pero no hay dónde.', area: 'ambiente', apoyos: 44, estado: 'respondida', enviada: '2026-09-01', respuesta: 'Se instalará un punto limpio en el primer semestre 2027.', actualizada: '2026-09-29' },
]

// ---- Votaciones --------------------------------------------------------------

export const VOTACIONES: Votacion[] = [
  { id: 'v1', juntaId: 'aromos', pregunta: '¿En qué usamos el fondo vecinal 2027?', cierre: '2026-11-07', quorum: 30, opciones: [{ texto: 'Luminarias en pasaje Los Robles', votos: 14 }, { texto: 'Reparar techo de la sede', votos: 19 }, { texto: 'Juegos para la plaza', votos: 8 }] },
  { id: 'v2', juntaId: 'aromos', pregunta: '¿Qué día prefieren para la asamblea de diciembre?', cierre: '2026-11-20', quorum: 20, opciones: [{ texto: 'Sábado en la mañana', votos: 22 }, { texto: 'Domingo en la tarde', votos: 11 }, { texto: 'Jueves en la noche', votos: 6 }] },
  { id: 'v3', juntaId: 'copihues', pregunta: '¿Celebramos la Navidad en la plaza o en la sede?', cierre: '2026-11-30', quorum: 25, opciones: [{ texto: 'En la plaza', votos: 18 }, { texto: 'En la sede', votos: 9 }] },
]

// ---- Documentos --------------------------------------------------------------

const DOC_BASE: Omit<Documento, 'id' | 'juntaId'>[] = [
  { tipo: 'Estatutos', detalle: 'PDF · versión vigente', estado: 'vigente', archivo: 'estatutos.pdf' },
  { tipo: 'Certificado de vigencia', detalle: 'Directiva y personalidad jurídica', estado: 'por_vencer', vence: '2026-11-24', archivo: 'certificado-vigencia.pdf' },
  { tipo: 'Actas de asamblea', detalle: '12 actas · incluye votaciones de la app', estado: 'al_dia', archivo: 'actas-2026.pdf' },
  { tipo: 'Libro de socios', detalle: 'Se actualiza solo con el padrón', estado: 'al_dia', archivo: 'libro-socios.pdf' },
  { tipo: 'RUT de la organización', detalle: 'Servicio de Impuestos Internos', estado: 'vigente', archivo: 'rut.pdf' },
  { tipo: 'Rendición fondo 2025', detalle: 'Falta subir', estado: 'pendiente' },
]

export const DOCUMENTOS: Documento[] = JUNTAS.flatMap((j, ji) =>
  DOC_BASE.map((d, di) => {
    // variaciones por junta para que el municipio vea diferencias
    let estado = d.estado
    if (j.estado !== 'activa' && di > 1) estado = 'pendiente'
    if (ji % 3 === 1 && di === 1) estado = 'vigente'
    if (ji % 4 === 2 && di === 5) estado = 'al_dia'
    return { ...d, estado, archivo: estado === 'pendiente' ? undefined : d.archivo, id: `${j.id}-d${di}`, juntaId: j.id }
  }),
)

// ---- Avisos, conversaciones, mercado -----------------------------------------

export const AVISOS: Aviso[] = [
  { id: 'av1', juntaId: 'aromos', titulo: 'Asamblea ordinaria de diciembre', texto: 'Vota en la app el día que más te acomode. La asamblea revisará el uso del fondo vecinal.', fecha: '2026-11-03' },
  { id: 'av2', juntaId: 'aromos', titulo: 'Operativo de salud el sábado 14', texto: 'Junto a El Mirador traemos toma de presión y control de glicemia. Trae tu carnet.', fecha: '2026-11-01' },
  { id: 'av3', juntaId: 'aromos', titulo: 'Corte de agua programado', texto: 'Jueves 6 de noviembre entre 9:00 y 14:00 horas en calles Los Robles y Los Maitenes.', fecha: '2026-10-29' },
  { id: 'av4', juntaId: 'copihues', titulo: 'Inscripciones para Navidad', texto: 'Inscribe a tus niños hasta el 30 de noviembre con la secretaria.', fecha: '2026-11-02' },
]

export const HILOS: Hilo[] = [
  { id: 'h1', juntaId: 'aromos', titulo: '¿Alguien sabe cuándo pasa el camión de reciclaje?', autor: 'Carmen R.', comentarios: [
    { autor: 'Jorge M.', texto: 'Pasa los martes cada 15 días. El próximo es el 11.', fecha: '2026-11-02' },
    { autor: 'Carmen R.', texto: '¡Gracias vecino!', fecha: '2026-11-02' },
  ] },
  { id: 'h2', juntaId: 'aromos', titulo: 'Ideas para la fiesta de fin de año', autor: 'Rosa C.', comentarios: [
    { autor: 'Luis A.', texto: 'Una once comunitaria en la plaza con música en vivo.', fecha: '2026-10-28' },
  ] },
]

export const PRODUCTOS: Producto[] = [
  { id: 'pr1', juntaId: 'aromos', nombre: 'Pan amasado y sopaipillas', vendedor: 'Carmen R.', precio: '$2.500 la docena', categoria: 'Comida', descripcion: 'Pedidos de lunes a sábado. Retiro en pasaje Los Maitenes.', estado: 'publicado' },
  { id: 'pr2', juntaId: 'aromos', nombre: 'Arreglo de ropa y costura', vendedor: 'Marta G.', precio: 'Desde $3.000', categoria: 'Servicios', descripcion: 'Bastas, cierres y ajustes. Entrega en 48 horas.', estado: 'publicado' },
  { id: 'pr3', juntaId: 'aromos', nombre: 'Huevos de campo', vendedor: 'Don Segundo', precio: '$4.000 la bandeja', categoria: 'Comida', descripcion: 'Bandeja de 30 huevos, gallinas libres.', estado: 'publicado' },
  { id: 'pr4', juntaId: 'aromos', nombre: 'Clases de reforzamiento escolar', vendedor: 'Javiera T.', precio: '$6.000 la hora', categoria: 'Servicios', descripcion: 'Matemáticas y lenguaje, de 1° a 8° básico.', estado: 'publicado' },
  { id: 'pr5', juntaId: 'aromos', nombre: 'Tejidos a palillo', vendedor: 'Rosa C.', precio: 'Desde $8.000', categoria: 'Artesanía', descripcion: 'Gorros, bufandas y chalecos a pedido.', estado: 'revision' },
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
  { id: 'r1', tipo: 'comentario', detalle: 'Comentario con insultos en "Ideas para la fiesta"', junta: 'Villa Los Aromos' },
  { id: 'r2', tipo: 'comentario', detalle: 'Publicidad de un negocio externo en Conversa', junta: 'Los Copihues' },
  { id: 'r3', tipo: 'producto', detalle: 'Producto sin descripción: "Tejidos a palillo"', junta: 'Villa Los Aromos' },
  { id: 'r4', tipo: 'foto', detalle: 'Foto con menores sin consentimiento de apoderados', junta: 'Población Esperanza', critico: true },
]

export const SOCIOS: Socio[] = [
  { nombre: 'Rosa Catrileo', desde: 1995, participaciones: 14 },
  { nombre: 'Jorge Muñoz', desde: 2003, participaciones: 12 },
  { nombre: 'Patricia Sandoval', desde: 2008, participaciones: 11 },
  { nombre: 'Marta González', desde: 2011, participaciones: 9 },
  { nombre: 'Carmen Riquelme', desde: 1999, participaciones: 8 },
  { nombre: 'Luis Alarcón', desde: 2015, participaciones: 7 },
  { nombre: 'Javiera Toledo', desde: 2021, participaciones: 6 },
  { nombre: 'Segundo Huenchumilla', desde: 1987, participaciones: 5 },
  { nombre: 'Francisca Lillo', desde: 2019, participaciones: 4 },
  { nombre: 'Benjamín Ortiz', desde: 2024, participaciones: 3 },
  { nombre: 'Teresa Mardones', desde: 2001, participaciones: 1 },
  { nombre: 'Andrés Valdebenito', desde: 2023, participaciones: 0 },
]

// Vecino de ejemplo con el que se entra al perfil Vecino
export const VECINO_DEMO = { nombre: 'Marta González', juntaId: 'aromos', horas: 26, actividades: 9 }
