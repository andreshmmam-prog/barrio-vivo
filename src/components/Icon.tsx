// Íconos de línea propios (24x24). Se colorean con `currentColor`.
const PATHS: Record<string, string> = {
  cultura: 'M9 18V6l10-2v12 M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M16 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  deporte: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M3 12h18 M12 3a14 14 0 0 1 0 18 M12 3a14 14 0 0 0 0 18',
  social: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M17 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6 M15 14.5c3 0 6 2 6 5',
  mejora: 'M3 11l9-7 9 7v9H3z M12 11v6 M9 14h6',
  salud: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
  ambiente: 'M5 19c0-8 6-14 15-14 0 9-6 15-14 15 M5 19l8-8',
  seguridad: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M9 12l2 2 4-4',
  inicio: 'M3 11l9-7 9 7v9H3z',
  trofeo: 'M8 4h8v5a4 4 0 0 1-8 0z M8 6H4a3 3 0 0 0 4 4 M16 6h4a3 3 0 0 1-4 4 M12 13v4 M8 21h8 M9 17h6v4H9z',
  participa: 'M21 12a8 8 0 0 1-12 7l-5 1 1-4a8 8 0 1 1 16-4z',
  mercado: 'M4 9l1-5h14l1 5 M4 9h16v11H4z M9 20v-6h6v6',
  aprende: 'M3 6l9-3 9 3-9 3z M7 8v6c3 2 7 2 10 0V8',
  perfil: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 4-6 8-6s8 2 8 6',
  panel: 'M4 20V10 M10 20V4 M16 20v-7 M22 20H2',
  calendario: 'M3 5h18v16H3z M3 10h18 M8 3v4 M16 3v4',
  socios: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M17 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6 M15 14.5c3 0 6 2 6 5',
  documento: 'M6 3h8l5 5v13H6z M14 3v5h5',
  campana: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9 M10 21h4',
  megafono: 'M3 11l15-6v14L3 13z M7 13v5h3',
  voto: 'M9 11l3 3 8-8 M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9',
  telefono: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
  play: 'M8 5l11 7-11 7z',
  check: 'M5 12l5 5L20 7',
  x: 'M6 6l12 12 M18 6L6 18',
  mas: 'M12 5v14 M5 12h14',
  flecha: 'M15 5l-7 7 7 7',
  derecha: 'M9 5l7 7-7 7',
  camara: 'M4 8h3l2-3h6l2 3h3v11H4z M12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  qr: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h3v3 M21 14v7h-7',
  alerta: 'M12 3l10 18H2z M12 10v5 M12 18v.01',
  mapa: 'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z M9 4v14 M15 6v14',
  escudo: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  salir: 'M15 4h4v16h-4 M10 8l-4 4 4 4 M6 12h10',
  libro: 'M4 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z M20 4h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z',
  reloj: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
  estrella: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
  enviar: 'M4 12l16-8-6 16-3-7z',
  descargar: 'M12 4v11 M7 10l5 5 5-5 M4 20h16',
  compartir: 'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M8.6 13.5l6.8 4 M15.4 6.5l-6.8 4',
  llave: 'M8 14a4 4 0 1 1 3.5-6H21v4h-2v3h-3v-3h-4.5A4 4 0 0 1 8 14z',
  filtro: 'M3 5h18l-7 8v6l-4 2v-8z',
}

export function Icon({ name, size = 22, stroke = 2, className, title }: { name: string; size?: number; stroke?: number; className?: string; title?: string }) {
  const d = PATHS[name] ?? PATHS.inicio
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      aria-label={title}
    >
      {d.split(' M').map((seg, i) => (
        <path key={i} d={i === 0 ? seg : 'M' + seg} />
      ))}
    </svg>
  )
}
