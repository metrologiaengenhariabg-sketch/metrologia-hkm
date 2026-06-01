import { useState, useMemo } from 'react'
import { Card, Spinner, Empty } from '../components/UI.jsx'
import { supabase } from '../lib/supabase'
import s from './Pages.module.css'

export default function ITCQ() {
  const [criterios, setCriterios] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')

  useState(() => {
    supabase.from('criterios_itcq').select('*').order('equipamento')
      .then(({ data }) => { setCriterios(data || []); setLoading(false) })
  })

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return criterios.filter(c =>
      !q || [c.equipamento, c.tag_prefixo, c.criterio, c.norma_ref].join(' ').toLowerCase().includes(q)
    )
  }, [criterios, search])

  if (loading) return <Spinner />

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>IT-CQ-008</h1>
          <p className={s.pageSub}>Critérios de aceitação de referência · Rev.03</p>
        </div>
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
                  <th>Equipamento</th>
                  <th style={{width:'8%'}}>Tag</th>
                  <th style={{width:'18%'}}>Faixa</th>
                  <th style={{width:'10%'}}>Periodicidade</th>
                  <th style={{width:'18%'}}>Critério</th>
                  <th style={{width:'14%'}}>Norma</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </Card>
    </div>
  )
}
