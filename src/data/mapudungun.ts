/**
 * Palabras en mapudungun para el modo bilingüe.
 * Traducciones de referencia: deben validarse con hablantes y educadores tradicionales
 * de la comuna antes del piloto (incluida la grafía que se use: Unificado, Azümchefe u otra).
 */
export const MAPU = {
  hola: 'Mari mari',
  gracias: 'Chaltu may',
  asamblea: 'Trawün',
  ayuda: 'Kelluwün',
  memoria: 'Kuyfi',
  aprender: 'Kimün',
  comunidad: 'Lof',
} as const

export type ClaveMapu = keyof typeof MAPU

export const AVISO_MAPU = 'Traducciones de referencia, por validar con hablantes de la comuna.'
