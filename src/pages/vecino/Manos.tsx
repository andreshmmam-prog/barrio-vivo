import { useState } from 'react'
import { AREAS, AREA_BY_ID, type AreaId } from '../../data/areas'
import { HOY, TRAMOS, VECINOS, esJoven } from '../../data/demo'
import type { Ayuda, CategoriaAyuda } from '../../data/types'
import { Icon } from '../../components/Icon'
import { AreaChip, Bar, Chip, Empty, Modal, PageTitle, Tabs } from '../../components/ui'
import { useTabla, useVecino } from '../../lib/hooks'
import { REGLAS, fechaCorta, pct, rankingJuventud } from '../../lib/scoring'
import { useStore } from '../../state/store'

export const CATEGORIAS: Record<CategoriaAyuda, string> = {
  acompanar: 'Acompañar',
  cargar: 'Cargar o mover',
  prestar: 'Prestar',
  ensenar: 'Enseñar',
  cuidar: 'Cuidar',
  reparar: 'Reparar',
}

type Vista = 'ayudas' | 'voluntariado' | 'jovenes'

export default function Manos() {
  const v = useVecino()
  const { s } = useStore()
  const [vista, setVista] = useState<Vista>('ayudas')
  const cumplidas = s.ayudas.filter((a) => a.juntaId === v.juntaId && a.estado === 'cumplida')
  const ayudaron = new Set(cumplidas.map((a) => (a.tipo === 'pide' ? a.con : a.autor))).size

  return (
    <>
      <PageTitle title="Manos Vecinas" sub="Pide y ofrece ayuda. Ayudar suma horas de voluntariado." />
      <div className="pad stack" style={{ paddingTop: 6 }}>
        <div className="card between" style={{ background: 'var(--verde)', color: '#fff', border: 'none' }}>
          <div>
            <p className="small" style={{ color: '#CDE5DA' }}>En tu junta esta temporada</p>
            <p className="bold" style={{ fontSize: 16 }}>{cumplidas.length} ayudas cumplidas · {ayudaron} vecinos ayudaron</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p className="num" style={{ fontSize: 26, color: 'var(--sol)', whiteSpace: 'nowrap' }}>{v.horas} h</p>
            <p className="xs" style={{ color: '#CDE5DA' }}>tus horas</p>
          </div>
        </div>
        <Tabs
          label="Secciones de Manos Vecinas"
          value={vista}
          onChange={setVista}
          options={[
            { value: 'ayudas', label: 'Ayudas' },
            { value: 'voluntariado', label: 'Voluntariado' },
            { value: 'jovenes', label: 'Jóvenes' },
          ]}
        />
        {vista === 'ayudas' && <Ayudas />}
        {vista === 'voluntariado' && <Voluntariado />}
        {vista === 'jovenes' && <Jovenes />}
      </div>
    </>
  )
}

function Ayudas() {
  const { s, dispatch, toast } = useStore()
  const v = useVecino()
  const [filtro, setFiltro] = useState<'todas' | 'pide' | 'ofrece' | 'mias'>('todas')
  const [nueva, setNueva] = useState<null | 'pide' | 'ofrece'>(null)
  const [cerrar, setCerrar] = useState<Ayuda | null>(null)
  const [gracias, setGracias] = useState('')
  const [form, setForm] = useState({ categoria: 'acompanar' as CategoriaAyuda, titulo: '', detalle: '', horas: 1 })

  const lista = s.ayudas
    .filter((a) => a.juntaId === v.juntaId && a.titulo !== 'Ayuda entre vecinos')
    .filter((a) => (filtro === 'todas' ? true : filtro === 'mias' ? a.autorId === v.id || a.conId === v.id : a.tipo === filtro))
    .sort((a, b) => (a.estado === 'cumplida' ? 1 : 0) - (b.estado === 'cumplida' ? 1 : 0) || b.fecha.localeCompare(a.fecha))

  return (
    <>
      <div className="row">
        <button className="btn" onClick={() => setNueva('pide')}><Icon name="manos" size={18} /> Pedir ayuda</button>
        <button className="btn btn-borde" onClick={() => setNueva('ofrece')}><Icon name="mas" size={18} /> Ofrecer</button>
      </div>
      <div className="filtro-chips" role="group" aria-label="Filtrar ayudas">
        {(
          [
            ['todas', 'Todas'],
            ['pide', 'Piden'],
            ['ofrece', 'Ofrecen'],
            ['mias', 'Las mías'],
          ] as const
        ).map(([k, l]) => (
          <button key={k} aria-pressed={filtro === k} onClick={() => setFiltro(k)}>{l}</button>
        ))}
      </div>
      {lista.length === 0 && <Empty>No hay ayudas en esta vista.</Empty>}
      {lista.map((a) => {
        const mia = a.autorId === v.id
        const participo = a.conId === v.id
        return (
          <article key={a.id} className="card stack-sm" style={a.estado === 'cumplida' ? { opacity: 0.85 } : undefined}>
            <div className="chips">
              <Chip tone={a.tipo === 'pide' ? 'sol' : 'verde'}>{a.tipo === 'pide' ? 'Pide' : 'Ofrece'}</Chip>
              <Chip tone="gris">{CATEGORIAS[a.categoria]}</Chip>
              {a.autorTramo === '60+' && a.tipo === 'pide' && <Chip tone="tinta">Adulto mayor</Chip>}
              <span className="xs muted" style={{ marginLeft: 'auto' }}>≈ {a.horas} h</span>
            </div>
            <p className="titulo">{a.titulo}</p>
            {a.detalle && <p className="small">{a.detalle}</p>}
            <p className="xs muted">{a.autor} · {fechaCorta(a.fecha)}</p>

            {a.estado === 'abierta' && !mia && (
              <button
                className="btn btn-chico"
                onClick={() => {
                  dispatch({ t: 'tomarAyuda', id: a.id, con: v.corto, conId: v.id })
                  toast(a.tipo === 'pide' ? `Te comprometiste a ayudar a ${a.autor}` : `${a.autor} sabrá que te sirve su ayuda`)
                }}
              >
                {a.tipo === 'pide' ? 'Yo ayudo' : 'Me sirve'}
              </button>
            )}
            {a.estado === 'abierta' && mia && <p className="xs bold" style={{ color: 'var(--verde)' }}>Tu publicación · esperando respuesta</p>}
            {a.estado === 'en_curso' && (
              <div className="between">
                <span className="small"><b>En curso</b> con {participo ? 'contigo' : a.con}</span>
                <button className="btn btn-chico btn-borde" onClick={() => { setCerrar(a); setGracias('') }}>Marcar cumplida</button>
              </div>
            )}
            {a.estado === 'cumplida' && (
              <>
                <p className="xs bold" style={{ color: 'var(--verde)' }}>
                  <Icon name="check" size={14} /> Cumplida · ayudó {a.tipo === 'pide' ? a.con : a.autor}
                </p>
                {a.gracias && <p className="gracias">{a.gracias}</p>}
              </>
            )}
          </article>
        )
      })}

      <Modal open={!!nueva} onClose={() => setNueva(null)} title={nueva === 'pide' ? 'Pedir una mano' : 'Ofrecer una mano'}>
        <form
          className="modal-body"
          onSubmit={(e) => {
            e.preventDefault()
            if (!form.titulo.trim() || !nueva) return
            dispatch({
              t: 'nuevaAyuda',
              a: { id: `m${Date.now()}`, juntaId: v.juntaId, tipo: nueva, categoria: form.categoria, titulo: form.titulo.trim(), detalle: form.detalle.trim(), autor: v.corto, autorId: v.id, autorTramo: v.tramo, fecha: HOY, horas: form.horas, estado: 'abierta' },
            })
            setForm({ categoria: 'acompanar', titulo: '', detalle: '', horas: 1 })
            setNueva(null)
            toast(nueva === 'pide' ? 'Publicado. Tus vecinos ya pueden ofrecerte una mano' : 'Publicado. Gracias por ofrecer tu ayuda')
          }}
        >
          <label className="field">
            Tipo de ayuda
            <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value as CategoriaAyuda })}>
              {Object.entries(CATEGORIAS).map(([k, l]) => (
                <option key={k} value={k}>{l}</option>
              ))}
            </select>
          </label>
          <label className="field">
            {nueva === 'pide' ? '¿Qué necesitas?' : '¿Qué ofreces?'}
            <input value={form.titulo} maxLength={80} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder={nueva === 'pide' ? 'Ej: Acompañamiento al CESFAM' : 'Ej: Presto herramientas'} required />
          </label>
          <label className="field">
            Detalle
            <textarea value={form.detalle} maxLength={200} onChange={(e) => setForm({ ...form, detalle: e.target.value })} placeholder="Día, hora y lugar" />
          </label>
          <label className="field">
            Tiempo aproximado
            <select value={form.horas} onChange={(e) => setForm({ ...form, horas: Number(e.target.value) })}>
              {[1, 2, 3, 4].map((h) => (
                <option key={h} value={h}>{h} {h === 1 ? 'hora' : 'horas'}</option>
              ))}
            </select>
            <small>Quien ayuda suma estas horas de voluntariado y la junta suma +{REGLAS.ayuda} puntos en Solidaridad.</small>
          </label>
          <button className="btn btn-block">Publicar</button>
        </form>
      </Modal>

      <Modal open={!!cerrar} onClose={() => setCerrar(null)} title="Ayuda cumplida">
        {cerrar && (
          <form
            className="modal-body"
            onSubmit={(e) => {
              e.preventDefault()
              dispatch({ t: 'cumplirAyuda', id: cerrar.id, gracias: gracias.trim() || '¡Gracias, vecino!' })
              setCerrar(null)
              toast(`¡Listo! +${cerrar.horas} h de voluntariado y +${REGLAS.ayuda} puntos para la junta`)
            }}
          >
            <p className="small">{cerrar.titulo}</p>
            <label className="field">
              Mensaje de agradecimiento
              <textarea value={gracias} maxLength={140} onChange={(e) => setGracias(e.target.value)} placeholder="Queda en el perfil de quien ayudó" />
            </label>
            <p className="xs muted">En la app real lo confirma quien recibió la ayuda.</p>
            <button className="btn btn-block">Confirmar y agradecer</button>
          </form>
        )}
      </Modal>
    </>
  )
}

function Voluntariado() {
  const { s, dispatch, toast } = useStore()
  const v = useVecino()
  const lista = s.convocatorias.filter((c) => c.juntaId === v.juntaId).sort((a, b) => a.fecha.localeCompare(b.fecha))
  return (
    <>
      <p className="small muted">Tu junta necesita manos para estas actividades. Al registrar tu asistencia con QR, las horas quedan certificadas.</p>
      {lista.map((c) => {
        const inscrito = c.inscritosIds.includes(v.id)
        const asistio = c.asistieronIds.includes(v.id)
        const lleno = c.inscritos >= c.cupos
        return (
          <article key={c.id} className="card stack-sm">
            <div className="chips">
              <AreaChip area={c.area} />
              {c.paraJovenes && <Chip tone="sol">Ideal para jóvenes</Chip>}
              <span className="xs muted" style={{ marginLeft: 'auto' }}>{c.horas} h</span>
            </div>
            <p className="titulo">{c.titulo}</p>
            <p className="small">{c.detalle}</p>
            <p className="xs muted">{fechaCorta(c.fecha)}</p>
            <div className="resultado">
              <div className="between xs"><span>{c.inscritos} de {c.cupos} voluntarios</span><b>{lleno ? 'Completo' : `${c.cupos - c.inscritos} cupos`}</b></div>
              <Bar value={(c.inscritos / c.cupos) * 100} height={8} />
            </div>
            {!inscrito ? (
              <button className="btn btn-chico" disabled={lleno} onClick={() => { dispatch({ t: 'inscribir', id: c.id, vecinoId: v.id }); toast('Inscrito. Te recordaremos el día antes') }}>
                Inscribirme
              </button>
            ) : asistio ? (
              <p className="xs bold" style={{ color: 'var(--verde)' }}><Icon name="check" size={14} /> Asististe · +{c.horas} h certificadas</p>
            ) : (
              <div className="between">
                <Chip>Inscrito</Chip>
                <button className="btn btn-chico btn-borde" onClick={() => { dispatch({ t: 'asistir', id: c.id, vecinoId: v.id }); toast(`Asistencia registrada: +${c.horas} h de voluntariado`) }}>
                  <Icon name="qr" size={16} /> Registrar asistencia (demo)
                </button>
              </div>
            )}
          </article>
        )
      })}
    </>
  )
}

function Jovenes() {
  const { s, dispatch, toast } = useStore()
  const v = useVecino()
  const tabla = useTabla()
  const joven = esJoven(v.tramo)
  const fila = tabla.find((f) => f.junta.id === v.juntaId)!
  const pos = rankingJuventud(tabla).findIndex((f) => f.junta.id === v.juntaId) + 1
  const propuestas = s.propuestas.filter((p) => p.juntaId === v.juntaId)
  const paraJovenes = s.convocatorias.filter((c) => c.juntaId === v.juntaId && c.paraJovenes)
  const embajador = VECINOS.find((x) => x.juntaId === v.juntaId && x.embajador)
  const [form, setForm] = useState({ titulo: '', detalle: '', area: 'cultura' as AreaId })

  return (
    <>
      <div className="premio-joven">
        <span className="area-icon" style={{ width: 48, height: 48 }}><Icon name="joven" size={24} /></span>
        <div className="grow">
          <p className="xs" style={{ color: 'var(--gris-claro)' }}>Premio Juventud Barrio Vivo</p>
          <p className="bold" style={{ fontSize: 16 }}>Tu junta va {pos}° de {tabla.length}</p>
          <p className="xs" style={{ color: 'var(--gris-claro)' }}>
            {fila.registrados ? pct(fila.jovenes / fila.registrados) : '0%'} de los asistentes tiene entre 14 y 29 años
          </p>
        </div>
      </div>
      <p className="small">
        {joven
          ? `Eres parte del tramo joven (${TRAMOS[v.tramo]}). Cuando una actividad tiene al menos 30% de asistentes jóvenes, tu junta suma +${REGLAS.juvenil} puntos.`
          : `Cuando una actividad tiene al menos 30% de asistentes de 14 a 29 años, la junta suma +${REGLAS.juvenil} puntos. Invita a los jóvenes de tu casa.`}
      </p>

      <div className="seccion"><h2>Convocatorias para jóvenes</h2></div>
      {paraJovenes.map((c) => (
        <div key={c.id} className="lista-item">
          <span className="marca-area" style={{ background: AREA_BY_ID[c.area].color }} />
          <div className="grow">
            <p className="titulo">{c.titulo}</p>
            <p className="xs muted">{fechaCorta(c.fecha)} · {c.horas} h · {c.cupos - c.inscritos} cupos</p>
          </div>
        </div>
      ))}
      <p className="xs muted">Inscríbete en la pestaña Voluntariado.</p>

      <div className="seccion"><h2>Propuestas juveniles</h2></div>
      {propuestas.map((p) => (
        <article key={p.id} className="card stack-sm">
          <div className="chips">
            <AreaChip area={p.area} solid={false} />
            <Chip tone={p.estado === 'aprobada' ? 'verde' : p.estado === 'rechazada' ? 'rojo' : 'sol'}>
              {p.estado === 'aprobada' ? 'Aprobada por la directiva' : p.estado === 'rechazada' ? 'No aprobada' : 'En revisión'}
            </Chip>
          </div>
          <p className="titulo">{p.titulo}</p>
          <p className="small">{p.detalle}</p>
          <p className="xs muted">Propuesta de {p.autor}</p>
        </article>
      ))}
      {joven ? (
        <form
          className="card stack-sm"
          onSubmit={(e) => {
            e.preventDefault()
            if (!form.titulo.trim()) return
            dispatch({ t: 'nuevaPropuesta', p: { id: `pj${Date.now()}`, juntaId: v.juntaId, titulo: form.titulo.trim(), detalle: form.detalle.trim(), area: form.area, autor: v.corto, fecha: HOY, estado: 'pendiente' } })
            setForm({ titulo: '', detalle: '', area: 'cultura' })
            toast('Propuesta enviada a la directiva')
          }}
        >
          <h3 style={{ fontSize: 17 }}>Propón una actividad</h3>
          <label className="field">
            ¿Qué quieren hacer?
            <input value={form.titulo} maxLength={80} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ej: Campeonato de futbolito nocturno" required />
          </label>
          <label className="field">
            Cuéntale a la directiva
            <textarea value={form.detalle} maxLength={240} onChange={(e) => setForm({ ...form, detalle: e.target.value })} placeholder="Qué necesitan y cuándo" />
          </label>
          <label className="field">
            Área
            <select value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value as AreaId })}>
              {AREAS.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </label>
          <button className="btn">Enviar propuesta</button>
        </form>
      ) : (
        <p className="xs muted">Las propuestas juveniles las presentan vecinos de 14 a 29 años. Puedes apoyarlas en la asamblea.</p>
      )}

      {embajador && (
        <div className="card stack-sm" style={{ background: 'var(--sol-suave)', borderColor: 'var(--sol)' }}>
          <p className="bold">Embajadores digitales</p>
          <p className="small">
            {embajador.id === v.id
              ? 'Eres embajadora digital de tu junta. Ayudas a tus vecinos a usar la app y tus horas quedan certificadas.'
              : `${embajador.corto} es embajadora digital de tu junta. Pídele ayuda si algo de la app no te queda claro.`}
          </p>
        </div>
      )}
    </>
  )
}
