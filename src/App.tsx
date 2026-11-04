import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Selector from './pages/Selector'
import VecinoApp from './pages/vecino/VecinoApp'
import DirectivaApp from './pages/directiva/DirectivaApp'
import AdminApp from './pages/admin/AdminApp'
import MunicipioApp from './pages/municipio/MunicipioApp'

function ScrollArriba() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollArriba />
      <Routes>
        <Route path="/" element={<Selector />} />
        <Route path="/vecino/*" element={<VecinoApp />} />
        <Route path="/directiva/*" element={<DirectivaApp />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/municipio/*" element={<MunicipioApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
