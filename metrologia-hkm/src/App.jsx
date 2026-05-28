import { useState, useEffect, useCallback } from 'react'
import { supabase, fetchInstrumentos, fetchStats, deleteInstrumento } from './lib/supabase'
import Dashboard   from './pages/Dashboard.jsx'
import Inventario  from './pages/Inventario.jsx'
import Calibracoes from './pages/Calibracoes.jsx'
import Relatorio   from './pages/Relatorio.jsx'
import ITCQ        from './pages/ITCQ.jsx'
import Criterios   from './pages/Criterios.jsx'
import Login       from './pages/Login.jsx'
import ModalInstrumento from './components/ModalInstrumento.jsx'
import styles from './App.module.css'

const NAV = [
  { id: 'dashboard',   label: 'Dashboard',    icon: 'ti-layout-dashboard' },
  { id: 'inventario',  label: 'Inventário',   icon: 'ti-ruler-2', badge: true },
  { id: 'calibracoes', label: 'Calibrações',  icon: 'ti-calendar-check' },
  { id: 'relatorio',   label: 'Visão geral',  icon: 'ti-chart-bar', section: 'Relatórios' },
  { id: 'criterios',   label: 'Critérios',    icon: 'ti-list-check', section: 'Referência' },
  { id: 'itcq',        label: 'IT-CQ-008',    icon: 'ti-file-description' },
]

export default function App() {
  const [session,     setSession]     = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [page,        setPage]        = useState('dashboard')
  const [instruments, setInstruments] = useState([])
  const [stats,       setStats]       = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [modal,       setModal]       = useState(false)
  const [editItem,    setEditItem]    = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => { await supabase.auth.signOut() }

  const load = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const [data, st] = await Promise.all([fetchInstrumentos(), fetchStats()])
      setInstruments(data); setStats(st)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (session) load() }, [session, load])

  const openNew  = ()   => { setEditItem(null); setModal(true) }
  const openEdit = item => { setEditItem(item); setModal(true) }
  const onSaved  = ()   => { setModal(false); load() }
  const onDelete = async id => {
    if (!confirm('Remover este instrumento permanentemente?')) return
    await deleteInstrumento(id); load()
  }

  const urgentes = instruments.filter(i => i.status === 'Vencido' || i.status === 'A vencer')
  const badge    = urgentes.length || ''
  const pageProps = { instruments, stats, loading, onEdit: openEdit, onDelete, onNew: openNew }

  if (authLoading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'var(--text2)',fontSize:13}}>
      Carregando…
    </div>
  )

  if (!session) return <Login />

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.tl}>
          <img src="/bg_Logo.jpeg" alt="BG Metrologia" style={{height:38,width:'auto',maxWidth:160,objectFit:'contain',borderRadius:4}} />
        </div>
        <div className={styles.tr}>
          <button className={styles.tbtn} onClick={openNew}><i className="ti ti-plus" /> Novo</button>
          <button className={styles.tbtnLogout} onClick={handleLogout} title="Sair"><i className="ti ti-logout" /></button>
          <div className={styles.avatar}>BG</div>
        </div>
      </header>

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

      <main className={styles.content}>
        {error && (
          <div className={styles.errorBanner}>
            <i className="ti ti-alert-triangle" /> Erro: {error}
            <button onClick={load}>Tentar novamente</button>
          </div>
        )}
        {page === 'dashboard'   && <Dashboard   {...pageProps} />}
        {page === 'inventario'  && <Inventario  {...pageProps} />}
        {page === 'calibracoes' && <Calibracoes {...pageProps} />}
        {page === 'relatorio'   && <Relatorio   {...pageProps} />}
        {page === 'criterios'   && <Criterios />}
        {page === 'itcq'        && <ITCQ />}
      </main>

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
