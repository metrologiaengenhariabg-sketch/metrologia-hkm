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
.bg {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.card {
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 36px 32px;
  width: 360px;
  max-width: 100%;
  box-shadow: var(--shadow);
  text-align: center;
}

.logo {
  width: 48px; height: 48px;
  border-radius: 12px;
  background: var(--blue);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
  margin: 0 auto 16px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -.02em;
  margin-bottom: 4px;
}

.sub {
  font-size: 12px;
  color: var(--text2);
  margin-bottom: 28px;
}

.form { text-align: left; }

.frow {
  margin-bottom: 14px;
}
.frow label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: var(--text2);
  margin-bottom: 5px;
}
.frow input {
  width: 100%;
}

.erro {
  display: flex; align-items: center; gap: 5px;
  color: var(--red);
  background: var(--red-bg);
  border-radius: var(--radius-sm);
  padding: 7px 10px;
  font-size: 11px;
  margin-bottom: 12px;
}

.btn {
  width: 100%;
  background: var(--blue);
  color: #fff;
  border: none;
  padding: 9px;
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  transition: background .15s;
  margin-top: 4px;
}
.btn:hover:not(:disabled) { background: #0C447C; }
.btn:disabled { opacity: .6; cursor: not-allowed; }

.footer {
  font-size: 10px;
  color: var(--text3);
  margin-top: 24px;
}

@keyframes spin { to { transform: rotate(360deg); } }
