import { Route, Routes } from 'react-router-dom'
import { BottomNav, MobileFrame } from '../../components/ui'
import Inicio from './Inicio'
import Manos from './Manos'
import Participa from './Participa'
import Tabla from './Tabla'
import Perfil from './Perfil'
import Emprendedores from './Emprendedores'
import Aprende from './Aprende'
import MiJunta from './MiJunta'
import { useStore } from '../../state/store'

const NAV = [
  { to: '/vecino', label: 'Inicio', icon: 'inicio', end: true },
  { to: '/vecino/manos', label: 'Manos', icon: 'manos' },
  { to: '/vecino/participa', label: 'Participa', icon: 'participa' },
  { to: '/vecino/tabla', label: 'Logros', icon: 'trofeo' },
  { to: '/vecino/perfil', label: 'Perfil', icon: 'perfil' },
]

export default function VecinoApp() {
  const { s } = useStore()
  return (
    <MobileFrame letraGrande={s.prefs.letraGrande} nav={<BottomNav items={NAV} label="Navegación del vecino" />}>
      <Routes>
        <Route index element={<Inicio />} />
        <Route path="manos" element={<Manos />} />
        <Route path="participa" element={<Participa />} />
        <Route path="tabla" element={<Tabla />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="emprendedores" element={<Emprendedores />} />
        <Route path="aprende" element={<Aprende />} />
        <Route path="junta" element={<MiJunta />} />
      </Routes>
    </MobileFrame>
  )
}
