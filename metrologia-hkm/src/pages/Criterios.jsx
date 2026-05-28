import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { Card, Badge, BtnPrimary, BtnGhost, Spinner, Empty } from '../components/UI.jsx'
import s from './Pages.module.css'

async function fetchCriterios() {
  const { data, error } = await supabase.from('criterios_itcq').select('*').order('equipamento')
  if (error) throw error
  return data
}

async function saveCriterio(form) {
  const { data, error } = await supabase
    .from('criterios_itcq')
    .upsert(form, { onConflict: 'id' })
    .select().single()
  if (error) throw error
  return data
}

async function deleteCriterio(id) {
  const { error } = await supabase.from('criterios_itcq').delete().eq('id', id)
  if (error) throw error
}

const empty = { equipamento:'', tag_prefixo:'', faixa_util:'', periodicidade:'12 meses', criterio:'', norma_ref:'' }

function Modal({ item, onClose, onSaved }) {
  const [form,   setForm]   = useState(item ? { ...item } : empty)
  const [saving, setSaving] = useState(false)
  const [err,    setErr]    = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.equipamento.trim()) { setErr('Informe o nome do equipamento.'); return }
    if (!form.criterio.trim())    { setErr('Informe o critério de aceitação.'); return }
    setSaving(true); setErr('')
    try {
      await saveCriterio(form)
      onSaved()
    } catch(e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:20}}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{background:'var(--surface)',borderRadius:'var(--radius-lg)',border:'0.5px solid var(--border2)',padding:20,width:460,maxWidth:'100%',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 16px 40px rgba(0,0,0,.15)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <span style={{fontSize:14,fontWeight:600}}>{item ? 'Editar critério' : 'Novo critério'}</span>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',fontSize:18,color:'var(--text2)'}}>✕</button>
        </div>

        {[
          ['Equipamento', 'equipamento', 'Ex: Paquímetro'],
          ['Tag / prefixo', 'tag_prefixo', 'Ex: PAQ'],
          ['Faixa de utilização', 'faixa_util', 'Ex: 0–150mm'],
          ['Periodicidade', 'periodicidade', 'Ex: 12 meses'],
          ['Critério de aceitação', 'criterio', 'Ex: 0,07mm'],
          ['Norma de referência', 'norma_ref', 'Ex: NBR ISO 1502'],
        ].map(([label, key, placeholder]) => (
          <div key={key} style={{marginBottom:10}}>
            <label style={{display:'block',fontSize:11,fontWeight:500,color:'var(--text2)',marginBottom:4}}>{label}</label>
            <input
              value={form[key] || ''}
              onChange={e => set(key, e.target.value)}
              placeholder={placeholder}
              style={{width:'100%'}}
            />
          </div>
        ))}

        {err && <p style={{color:'var(--red)',fontSize:11,background:'var(--red-bg)',padding:'6px 8px',borderRadius:'var(--radius-sm)',marginTop:8}}>{err}</p>}

        <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:16,paddingTop:12,borderTop:'0.5px solid var(--border)'}}>
          <BtnGhost onClick={onClose}>Cancelar</BtnGhost>
          <BtnPrimary onClick={handleSave} disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</BtnPrimary>
        </div>
      </div>
    </div>
  )
}

export default function Criterios() {
  const [criterios, setCriterios] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [modal,     setModal]     = useState(false)
  const [editItem,  setEditItem]  = useState(null)

  const load = async () => {
    try {
      setLoading(true)
      const data = await fetchCriterios()
      setCriterios(data)
    } catch(e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return criterios.filter(c =>
      !q || [c.equipamento, c.tag_prefixo, c.criterio].join(' ').toLowerCase().includes(q)
    )
  }, [criterios, search])

  const openNew  = ()    => { setEditItem(null); setModal(true) }
  const openEdit = item  => { setEditItem(item); setModal(true) }
  const onSaved  = ()    => { setModal(false); load() }

  const handleDelete = async id => {
    if (!confirm('Remover este critério?')) return
    await deleteCriterio(id)
    load()
  }

  if (loading) return <Spinner />

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Critérios de aceitação</h1>
          <p className={s.pageSub}>{criterios.length} critérios cadastrados · IT-CQ-008</p>
        </div>
        <BtnPrimary onClick={openNew}><i className="ti ti-plus" /> Novo critério</BtnPrimary>
      </div>

      <Card>
        <div className={s.toolbar}>
          <input
            placeholder="Buscar por equipamento, tag ou critério..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{flex:1}}
          />
        </div>

        {filtered.length === 0
          ? <Empty icon="ti-file-description" text="Nenhum critério encontrado" />
          : <table className={s.tbl}>
              <thead>
                <tr>
                  <th style={{width:'20%'}}>Equipamento</th>
                  <th style={{width:'8%'}}>Tag</th>
                  <th style={{width:'18%'}}>Faixa</th>
                  <th style={{width:'10%'}}>Periodicidade</th>
                  <th style={{width:'18%'}}>Critério</th>
                  <th style={{width:'12%'}}>Norma</th>
                  <th style={{width:'8%',textAlign:'center'}}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td style={{fontWeight:500}}>{c.equipamento}</td>
                    <td style={{fontFamily:'monospace',fontSize:11,fontWeight:600,color:'var(--blue)'}}>{c.tag_prefixo}</td>
                    <td style={{color:'var(--text2)',fontSize:11}}>{c.faixa_util||'—'}</td>
                    <td style={{color:'var(--text2)',fontSize:11}}>{c.periodicidade||'—'}</td>
                    <td style={{color:'var(--blue)',fontWeight:500,fontSize:11}}>{c.criterio}</td>
                    <td style={{color:'var(--text2)',fontSize:11}}>{c.norma_ref||'—'}</td>
                    <td style={{textAlign:'center',whiteSpace:'nowrap'}}>
                      <button
                        onClick={() => openEdit(c)}
                        style={{background:'var(--blue-bg)',color:'var(--blue)',border:'none',borderRadius:4,padding:'3px 7px',cursor:'pointer',fontSize:11,fontWeight:500,marginRight:3}}
                      >✏️</button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        style={{background:'var(--red-bg)',color:'var(--red)',border:'none',borderRadius:4,padding:'3px 7px',cursor:'pointer',fontSize:11,fontWeight:500}}
                      >🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </Card>

      {modal && <Modal item={editItem} onClose={() => setModal(false)} onSaved={onSaved} />}
    </div>
  )
}
