import { useState, useMemo } from 'react'
import { Card, Badge, BtnPrimary, BtnGhost, Spinner, Empty } from '../components/UI.jsx'
import { supabase } from '../lib/supabase'
import s from './Pages.module.css'

function fmtDate(d) { return d ? new Date(d).toLocaleDateString('pt-BR') : '—' }
function daysDiff(d) {
  if (!d) return null
  const diff = Math.round((new Date(d) - new Date()) / 86400000)
  return diff
}

function InstrRow({ i, selected, onToggle, onEdit }) {
  const days = daysDiff(i.proxima_cal)
  const daysLabel = days === null ? '—' : days < 0 ? `${Math.abs(days)}d vencido` : `${days}d restantes`
  const daysColor = days === null ? 'var(--text3)' : days < 0 ? 'var(--red)' : days <= 30 ? 'var(--orange)' : 'var(--green)'

  return (
    <tr style={{background: selected ? 'var(--blue-bg)' : ''}}>
      <td style={{textAlign:'center',width:36}}>
        <input type="checkbox" checked={selected} onChange={() => onToggle(i)} />
      </td>
      <td style={{fontFamily:'monospace',fontSize:11,fontWeight:600}}>{i.tag}</td>
      <td style={{fontSize:12}}>{i.descricao}</td>
      <td style={{fontSize:11,color:'var(--text2)'}}>{i.tipo||'—'}</td>
      <td style={{fontSize:11,color:'var(--text2)'}}>{i.responsavel||'—'}</td>
      <td style={{fontSize:11,color:'var(--text2)'}}>{i.setor||'—'}</td>
      <td style={{fontFamily:'monospace',fontSize:11}}>{fmtDate(i.proxima_cal)}</td>
      <td style={{fontSize:11,fontWeight:500,color:daysColor}}>{daysLabel}</td>
      <td><Badge status={i.status} /></td>
      <td style={{textAlign:'center'}}>
        <button onClick={() => onEdit(i)} style={{background:'var(--blue-bg)',color:'var(--blue)',border:'none',borderRadius:4,padding:'3px 7px',cursor:'pointer',fontSize:11}}>✏️</button>
      </td>
    </tr>
  )
}

function ModalSolicitacao({ instrumentos, onClose, onSent }) {
  const [nome,    setNome]    = useState('')
  const [email,   setEmail]   = useState('')
  const [obs,     setObs]     = useState('')
  const [sending, setSending] = useState(false)
  const [err,     setErr]     = useState('')

  const handleSend = async () => {
    if (!nome.trim() || !email.trim()) { setErr('Informe seu nome e e-mail.'); return }
    setSending(true); setErr('')
    try {
      const lista = instrumentos.map(i =>
        `• ${i.tag} — ${i.descricao} (${i.tipo||'—'}) — Venc: ${fmtDate(i.proxima_cal)}`
      ).join('\n')

      const html = `
        <h2>Solicitação de Calibração — MetroControl</h2>
        <p><strong>Cliente:</strong> ${nome}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        ${obs ? `<p><strong>Observação:</strong> ${obs}</p>` : ''}
        <hr/>
        <h3>${instrumentos.length} instrumento(s) para calibrar:</h3>
        <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">
          <thead style="background:#f3f4f6">
            <tr><th>Tag</th><th>Descrição</th><th>Tipo</th><th>Próx. Calibração</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${instrumentos.map(i => `
              <tr>
                <td><strong>${i.tag}</strong></td>
                <td>${i.descricao}</td>
                <td>${i.tipo||'—'}</td>
                <td>${fmtDate(i.proxima_cal)}</td>
                <td>${i.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <br/>
        <p style="color:#6b7280;font-size:12px">Enviado via MetroControl · BG Metrologia & Engenharia</p>
      `

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer re_YNyr47qk_cagfBvTzYGviacqCBKCjoyRb'
        },
        body: JSON.stringify({
          from: 'MetroControl <onboarding@resend.dev>',
          to: ['comercial01@bgmetrologia.com.br'],
          reply_to: email,
          subject: `Solicitação de Calibração — ${nome} — ${instrumentos.length} instrumento(s)`,
          html
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Erro ao enviar e-mail')
      }

      onSent()
    } catch(e) {
      setErr(e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:20}}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{background:'var(--surface)',borderRadius:'var(--radius-lg)',border:'0.5px solid var(--border2)',padding:24,width:480,maxWidth:'100%',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 16px 40px rgba(0,0,0,.15)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <span style={{fontSize:14,fontWeight:600}}>Solicitar calibração — {instrumentos.length} instrumento(s)</span>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',fontSize:18,color:'var(--text2)'}}>✕</button>
        </div>

        <p style={{fontSize:12,color:'var(--text2)',marginBottom:16}}>
          Preencha seus dados e enviaremos a solicitação para o comercial da BG Metrologia.
        </p>

        <div style={{marginBottom:10}}>
          <label style={{display:'block',fontSize:11,fontWeight:500,color:'var(--text2)',marginBottom:4}}>Seu nome / empresa *</label>
          <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: João Silva — HKM" style={{width:'100%'}} />
        </div>

        <div style={{marginBottom:10}}>
          <label style={{display:'block',fontSize:11,fontWeight:500,color:'var(--text2)',marginBottom:4}}>Seu e-mail de contato *</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@empresa.com.br" style={{width:'100%'}} />
        </div>

        <div style={{marginBottom:16}}>
          <label style={{display:'block',fontSize:11,fontWeight:500,color:'var(--text2)',marginBottom:4}}>Observação (opcional)</label>
          <textarea rows={3} value={obs} onChange={e => setObs(e.target.value)} placeholder="Ex: Urgente, prazo até 30/06..." style={{width:'100%',resize:'none'}} />
        </div>

        <div style={{background:'var(--bg)',borderRadius:'var(--radius)',padding:'10px 12px',marginBottom:16,maxHeight:120,overflowY:'auto'}}>
          <p style={{fontSize:11,fontWeight:500,marginBottom:6}}>Instrumentos selecionados:</p>
          {instrumentos.map(i => (
            <p key={i.id} style={{fontSize:11,color:'var(--text2)',margin:'2px 0'}}>• <strong>{i.tag}</strong> — {i.descricao}</p>
          ))}
        </div>

        {err && <p style={{color:'var(--red)',fontSize:11,background:'var(--red-bg)',padding:'6px 8px',borderRadius:'var(--radius-sm)',marginBottom:12}}>{err}</p>}

        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <BtnGhost onClick={onClose}>Cancelar</BtnGhost>
          <BtnPrimary onClick={handleSend} disabled={sending}>
            {sending ? 'Enviando…' : '📧 Enviar solicitação'}
          </BtnPrimary>
        </div>
      </div>
    </div>
  )
}

const TABS = ['Vencidos', 'A vencer', 'Calibrando']

export default function Calibracoes({ instruments, loading, onEdit }) {
  const [tab,      setTab]      = useState('Vencidos')
  const [search,   setSearch]   = useState('')
  const [fTipo,    setFTipo]    = useState('')
  const [fSetor,   setSetor]    = useState('')
  const [selected, setSelected] = useState([])
  const [modal,    setModal]    = useState(false)
  const [success,  setSuccess]  = useState(false)

  if (loading) return <Spinner />

  const vencidos   = instruments.filter(i => i.status === 'Vencido')
  const avencer    = instruments.filter(i => i.status === 'A vencer')
  const calibrando = instruments.filter(i => i.status === 'Calibrando')

  const baseList = tab === 'Vencidos' ? vencidos : tab === 'A vencer' ? avencer : calibrando

  const tipos  = [...new Set(instruments.map(i => i.tipo).filter(Boolean))].sort()
  const setores = [...new Set(instruments.map(i => i.setor).filter(Boolean))].sort()

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return baseList.filter(i =>
      (!q || [i.tag, i.descricao, i.fabricante].join(' ').toLowerCase().includes(q)) &&
      (!fTipo  || i.tipo  === fTipo) &&
      (!fSetor || i.setor === fSetor)
    )
  }, [baseList, search, fTipo, fSetor])

  const toggleSelect = (i) => {
    setSelected(prev =>
      prev.find(s => s.id === i.id) ? prev.filter(s => s.id !== i.id) : [...prev, i]
    )
  }

  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([])
    else setSelected(filtered)
  }

  const handleSent = () => {
    setModal(false)
    setSelected([])
    setSuccess(true)
    setTimeout(() => setSuccess(false), 5000)
  }

  const exportCSV = () => {
    const list = selected.length > 0 ? selected : filtered
    const cols = ['tag','descricao','tipo','responsavel','setor','proxima_cal','status']
    const head = ['Tag','Descrição','Tipo','Responsável','Setor','Próx. Calibração','Status']
    const rows = [head, ...list.map(i => cols.map(c => i[c] || ''))]
    const csv  = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
    const a    = document.createElement('a')
    a.href     = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csv)
    a.download = `calibracoes_${tab.toLowerCase()}.csv`
    a.click()
  }

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Calibrações</h1>
          <p className={s.pageSub}>Gestão de calibrações por status</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          {selected.length > 0 && (
            <BtnPrimary onClick={() => setModal(true)}>
              📧 Solicitar calibração ({selected.length})
            </BtnPrimary>
          )}
          <BtnGhost onClick={exportCSV}>
            <i className="ti ti-download" /> CSV {selected.length > 0 ? `(${selected.length})` : ''}
          </BtnGhost>
        </div>
      </div>

      {success && (
        <div style={{background:'var(--green-bg)',color:'var(--green)',padding:'10px 16px',borderRadius:'var(--radius)',marginBottom:16,fontSize:13,fontWeight:500}}>
          ✅ Solicitação enviada com sucesso para o comercial da BG Metrologia!
        </div>
      )}

      {/* Tabs */}
      <div style={{display:'flex',gap:4,marginBottom:16}}>
        {TABS.map(t => {
          const count = t === 'Vencidos' ? vencidos.length : t === 'A vencer' ? avencer.length : calibrando.length
          return (
            <button key={t} onClick={() => { setTab(t); setSelected([]) }}
              style={{
                padding:'6px 14px', borderRadius:'var(--radius)', border:'1px solid var(--border)',
                background: tab === t ? 'var(--blue)' : 'var(--surface)',
                color: tab === t ? '#fff' : 'var(--text)',
                fontSize:12, fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', gap:6
              }}>
              {t}
              <span style={{
                background: tab === t ? 'rgba(255,255,255,.25)' : 'var(--bg)',
                borderRadius:10, padding:'1px 7px', fontSize:11
              }}>{count}</span>
            </button>
          )
        })}
      </div>

      <Card>
        <div className={s.toolbar}>
          <input
            placeholder="Buscar por tag ou descrição..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{flex:1}}
          />
          <select value={fTipo} onChange={e => setFTipo(e.target.value)} style={{width:130}}>
            <option value="">Todos os tipos</option>
            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={fSetor} onChange={e => setSetor(e.target.value)} style={{width:130}}>
            <option value="">Todos os setores</option>
            {setores.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {filtered.length === 0
          ? <Empty icon="ti-circle-check" text="Nenhum instrumento encontrado" />
          : <table className={s.tbl}>
              <thead>
                <tr>
                  <th style={{width:36,textAlign:'center'}}>
                    <input type="checkbox"
                      checked={selected.length === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                  <th>Tag</th>
                  <th>Descrição</th>
                  <th>Tipo</th>
                  <th>Responsável</th>
                  <th>Setor</th>
                  <th>Próx. calib.</th>
                  <th>Dias</th>
                  <th>Status</th>
                  <th style={{textAlign:'center'}}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(i => (
                  <InstrRow
                    key={i.id}
                    i={i}
                    selected={!!selected.find(s => s.id === i.id)}
                    onToggle={toggleSelect}
                    onEdit={onEdit}
                  />
                ))}
              </tbody>
            </table>
        }
        <div style={{padding:'8px 0',fontSize:11,color:'var(--text3)'}}>
          {filtered.length} instrumento(s) · {selected.length} selecionado(s)
        </div>
      </Card>

      {modal && (
        <ModalSolicitacao
          instrumentos={selected}
          onClose={() => setModal(false)}
          onSent={handleSent}
        />
      )}
    </div>
  )
}
