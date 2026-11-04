import { Route, Routes } from 'react-router-dom'
import { BottomNav, MobileFrame } from '../../components/ui'
import Panel from './Panel'
import Actividades from './Actividades'
import NuevaActividad from './NuevaActividad'
import Documentos from './Documentos'
import Socios from './Socios'

const NAV = [
  { to: '/directiva', label: 'Panel', icon: 'panel', end: true },
  { to: '/directiva/actividades', label: 'Actividades', icon: 'calendario' },
  { to: '/directiva/socios', label: 'Socios', icon: 'socios' },
  { to: '/directiva/documentos', label: 'Documentos', icon: 'documento' },
]

export default function DirectivaApp() {
  return (
    <MobileFrame nav={<BottomNav items={NAV} label="Navegación de la directiva" />}>
      <Routes>
        <Route index element={<Panel />} />
        <Route path="actividades" element={<Actividades />} />
        <Route path="actividades/nueva" element={<NuevaActividad />} />
        <Route path="documentos" element={<Documentos />} />
        <Route path="socios" element={<Socios />} />
      </Routes>
    </MobileFrame>
  )
}
