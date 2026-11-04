// Las 7 áreas de acción comunitaria de Barrio Vivo.
// Cada área tiene un color fuerte (íconos, chips) y uno suave (fondos).

export type AreaId =
  | 'cultura'
  | 'deporte'
  | 'social'
  | 'mejora'
  | 'salud'
  | 'ambiente'
  | 'seguridad'

export interface Area {
  id: AreaId
  nombre: string
  corto: string
  premio: string
  color: string
  suave: string
  tinta: string
  descripcion: string
  ejemplos: string
  icono: string // nombre en el set de íconos
}

export const AREAS: Area[] = [
  {
    id: 'cultura',
    nombre: 'Cultura y Patrimonio',
    corto: 'Cultura',
    premio: 'Premio Cultura Barrio Vivo',
    color: '#7B44A8',
    suave: '#F1E9F7',
    tinta: '#5A2D80',
    descripcion: 'Identidad, tradiciones e historia local',
    ejemplos: 'Talleres, fiestas costumbristas, We Tripantu, Fiestas Patrias',
    icono: 'cultura',
  },
  {
    id: 'deporte',
    nombre: 'Deporte y Recreación',
    corto: 'Deporte',
    premio: 'Premio Deporte Barrio Vivo',
    color: '#C9541F',
    suave: '#FBEADF',
    tinta: '#8F3A14',
    descripcion: 'Actividad física y uso de espacios públicos',
    ejemplos: 'Campeonatos, corridas, juegos para niños',
    icono: 'deporte',
  },
  {
    id: 'social',
    nombre: 'Social y Solidaridad',
    corto: 'Social',
    premio: 'Premio Solidaridad Barrio Vivo',
    color: '#C2366B',
    suave: '#FAE4EC',
    tinta: '#8A2149',
    descripcion: 'Apoyo mutuo entre vecinos',
    ejemplos: 'Colectas, adultos mayores, ollas comunes, Navidad',
    icono: 'social',
  },
  {
    id: 'mejora',
    nombre: 'Mejoramiento del Barrio',
    corto: 'Mejora',
    premio: 'Premio Mejoramiento Barrio Vivo',
    color: '#2B63C0',
    suave: '#E4ECFA',
    tinta: '#1D4688',
    descripcion: 'Infraestructura y proyectos',
    ejemplos: 'Plazas, luminarias, sedes, postulación a fondos',
    icono: 'mejora',
  },
  {
    id: 'salud',
    nombre: 'Salud y Bienestar',
    corto: 'Salud',
    premio: 'Premio Salud Barrio Vivo',
    color: '#157F70',
    suave: '#DDF1EE',
    tinta: '#0E5A4F',
    descripcion: 'Prevención y autocuidado',
    ejemplos: 'Operativos de salud, charlas, salud mental',
    icono: 'salud',
  },
  {
    id: 'ambiente',
    nombre: 'Medio Ambiente',
    corto: 'Ambiente',
    premio: 'Premio Medio Ambiente Barrio Vivo',
    color: '#437A20',
    suave: '#E6F0DC',
    tinta: '#2F5716',
    descripcion: 'Cuidado del entorno',
    ejemplos: 'Reciclaje, arborización, microbasurales, huertos',
    icono: 'ambiente',
  },
  {
    id: 'seguridad',
    nombre: 'Seguridad y Convivencia',
    corto: 'Seguridad',
    premio: 'Premio Seguridad Barrio Vivo',
    color: '#44497A',
    suave: '#E5E6F0',
    tinta: '#2E3259',
    descripcion: 'Prevención y relaciones vecinales',
    ejemplos: 'Alarmas comunitarias, mediación, espacios seguros',
    icono: 'seguridad',
  },
]

export const AREA_BY_ID: Record<AreaId, Area> = Object.fromEntries(
  AREAS.map((a) => [a.id, a]),
) as Record<AreaId, Area>
