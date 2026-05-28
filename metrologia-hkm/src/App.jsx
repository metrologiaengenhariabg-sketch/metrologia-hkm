import { useState, useEffect, useCallback } from 'react'
import { fetchInstrumentos, fetchStats, deleteInstrumento } from './lib/supabase'
import Dashboard   from './pages/Dashboard.jsx'
import Inventario  from './pages/Inventario.jsx'
import Calibracoes from './pages/Calibracoes.jsx'
import Relatorio   from './pages/Relatorio.jsx'
import ITCQ        from './pages/ITCQ.jsx'
import ModalInstrumento from './components/ModalInstrumento.jsx'
import styles from './App.module.css'

const NAV = [
  { id: 'dashboard',   label: 'Dashboard',      icon: 'ti-layout-dashboard' },
  { id: 'inventario',  label: 'Inventário',      icon: 'ti-ruler-2',         badge: true },
  { id: 'calibracoes', label: 'Calibrações',     icon: 'ti-calendar-check' },
  { id: 'relatorio',   label: 'Visão geral',     icon: 'ti-chart-bar',       section: 'Relatórios' },
  { id: 'itcq',        label: 'IT-CQ-008',       icon: 'ti-file-description', section: 'Referência' },
]

export default function App() {
  const [page,        setPage]        = useState('dashboard')
  const [instruments, setInstruments] = useState([])
  const [stats,       setStats]       = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [modal,       setModal]       = useState(false)
  const [editItem,    setEditItem]    = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [data, st] = await Promise.all([fetchInstrumentos(), fetchStats()])
      setInstruments(data)
      setStats(st)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const openNew  = ()    => { setEditItem(null); setModal(true) }
  const openEdit = item  => { setEditItem(item); setModal(true) }
  const onSaved  = ()    => { setModal(false); load() }

  const onDelete = async id => {
    if (!confirm('Remover este instrumento permanentemente?')) return
    await deleteInstrumento(id)
    load()
  }

  const urgentes = instruments.filter(i => i.status === 'Vencido' || i.status === 'A vencer')
  const badge    = urgentes.length || ''

  const pageProps = { instruments, stats, loading, onEdit: openEdit, onDelete, onNew: openNew }

  return (
    <div className={styles.shell}>
      {/* ── Top bar ── */}
      <header className={styles.topbar}>
        <div className={styles.tl}>
          <div className={styles.logo}><i className="ti ti-ruler-measure" /></div>
          <span className={styles.appname}>MetroControl</span>
          <span className={styles.apptag}>HKM Indústria e Comércio</span>
        </div>
        <div className={styles.tr}>
          <button className={styles.tbtn} title="Novo instrumento" onClick={openNew}>
            <i className="ti ti-plus" /> Novo
          </button>
          <div className={styles.avatar}>HK</div>
        </div>
      </header>

      {/* ── Sidebar ── */}
      <nav className={styles.sidebar}>
        {NAV.map(item => (
          <div key={item.id}>
            {item.section && <p className={styles.nsec}>{item.section}</p>}
            <button
              className={`${styles.ni} ${page === item.id ? styles.active : ''}`}
              onClick={() => setPage(item.id)}
            >
              <i className={`ti ${item.icon}`} />
              {item.label}
              {item.badge && badge ? <span className={styles.nbadge}>{badge}</span> : null}
            </button>
          </div>
        ))}
      </nav>

      {/* ── Content ── */}
      <main className={styles.content}>
        {error && (
          <div className={styles.errorBanner}>
            <i className="ti ti-alert-triangle" /> Erro ao conectar ao Supabase: {error}
            <button onClick={load}>Tentar novamente</button>
          </div>
        )}
        {page === 'dashboard'   && <Dashboard   {...pageProps} />}
        {page === 'inventario'  && <Inventario  {...pageProps} />}
        {page === 'calibracoes' && <Calibracoes {...pageProps} />}
        {page === 'relatorio'   && <Relatorio   {...pageProps} />}
        {page === 'itcq'        && <ITCQ />}
      </main>

      {/* ── Modal ── */}
      {modal && (
        <ModalInstrumento
          item={editItem}
          onClose={() => setModal(false)}
          onSaved={onSaved}
        />
      )}
    </div>
  )
}
