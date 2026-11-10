import { Route, Routes } from 'react-router-dom'
import { BottomNav, MobileFrame } from '../../components/ui'
import Panel from './Panel'
import Actividades from './Actividades'
import NuevaActividad from './NuevaActividad'
import Documentos from './Documentos'
import Socios from './Socios'
import Participacion from './Participacion'
import Asambleas from './Asambleas'
import Gestion from './Gestion'

const NAV = [
  { to: '/directiva', label: 'Panel', icon: 'panel', end: true },
  { to: '/directiva/actividades', label: 'Actividades', icon: 'calendario' },
  { to: '/directiva/participacion', label: 'Participa', icon: 'participa' },
  { to: '/directiva/asambleas', label: 'Asambleas', icon: 'voto' },
  { to: '/directiva/gestion', label: 'Gestión', icon: 'documento' },
]

export default function DirectivaApp() {
  return (
    <MobileFrame nav={<BottomNav items={NAV} label="Navegación de la directiva" />}>
      <Routes>
        <Route index element={<Panel />} />
        <Route path="actividades" element={<Actividades />} />
        <Route path="actividades/nueva" element={<NuevaActividad />} />
        <Route path="documentos" element={<Documentos />} />
        <Route path="participacion" element={<Participacion />} />
        <Route path="socios" element={<Socios />} />
        <Route path="asambleas" element={<Asambleas />} />
        <Route path="gestion" element={<Gestion />} />
      </Routes>
    </MobileFrame>
  )
}
