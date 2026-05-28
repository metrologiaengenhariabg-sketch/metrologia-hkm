import { useState } from 'react'
import { supabase } from '../lib/supabase'
import s from './Login.module.css'

export default function Login({ onLogin }) {
  const [email,   setEmail]   = useState('')
  const [senha,   setSenha]   = useState('')
  const [loading, setLoading] = useState(false)
  const [erro,    setErro]    = useState('')

  const handleLogin = async e => {
    e.preventDefault()
    if (!email || !senha) { setErro('Preencha e-mail e senha.'); return }
    setLoading(true); setErro('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) {
      setErro('E-mail ou senha incorretos.')
      setLoading(false)
    }
  }

  return (
    <div className={s.bg}>
      <div className={s.card}>
        <div className={s.logo}>
          <i className="ti ti-ruler-measure" />
        </div>
        <h1 className={s.title}>MetroControl</h1>
        <p className={s.sub}>BG Engenharia · Sistema de Metrologia</p>

        <form onSubmit={handleLogin} className={s.form}>
          <div className={s.frow}>
            <label>E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <div className={s.frow}>
            <label>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={e => setSenha(e.target.value)}
            />
          </div>
          {erro && <p className={s.erro}><i className="ti ti-alert-circle" /> {erro}</p>}
          <button type="submit" className={s.btn} disabled={loading}>
            {loading ? <><i className="ti ti-loader-2" style={{animation:'spin .8s linear infinite',display:'inline-block'}} /> Entrando…</> : 'Entrar'}
          </button>
        </form>

        <p className={s.footer}>IT-CQ-008 Rev.03 · Gestão de Instrumentos de Medição</p>
      </div>
    </div>
  )
}


