import { Route, Routes } from 'react-router-dom'
import { BottomNav, MobileFrame } from '../../components/ui'
import Inicio from './Inicio'
import Tabla from './Tabla'
import Participa from './Participa'
import Mercado from './Mercado'
import Aprende from './Aprende'
import Perfil from './Perfil'
import Avisos from './Avisos'

const NAV = [
  { to: '/vecino', label: 'Inicio', icon: 'inicio', end: true },
  { to: '/vecino/tabla', label: 'Tabla', icon: 'trofeo' },
  { to: '/vecino/participa', label: 'Participa', icon: 'participa' },
  { to: '/vecino/mercado', label: 'Mercado', icon: 'mercado' },
  { to: '/vecino/aprende', label: 'Aprende', icon: 'aprende' },
]

export default function VecinoApp() {
  return (
    <MobileFrame nav={<BottomNav items={NAV} label="Navegación del vecino" />}>
      <Routes>
        <Route index element={<Inicio />} />
        <Route path="tabla" element={<Tabla />} />
        <Route path="participa" element={<Participa />} />
        <Route path="mercado" element={<Mercado />} />
        <Route path="aprende" element={<Aprende />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="avisos" element={<Avisos />} />
      </Routes>
    </MobileFrame>
  )
}
