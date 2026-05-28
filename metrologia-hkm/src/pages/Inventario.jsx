import { useState, useMemo } from 'react'
import { Card, Badge, BtnGhost, BtnPrimary, Spinner, Empty } from '../components/UI.jsx'
import s from './Pages.module.css'

const STATUS = ['','Calibrado','A vencer','Vencido','Sem calibração']
const TIPOS  = ['','Dimensional','Temperatura','Pressão/Força','Elétrico/Outro','Calibrador de Rosca','Inspeção de Solda','Dureza','Outro']
const PER_PAGE = 50

function fmtDate(d) { return d ? new Date(d).toLocaleDateString('pt-BR') : '—' }

function exportCSV(list) {
  const cols = ['tag','descricao','tipo','fabricante','modelo','localizacao','faixa','periodicidade','criterio','ultima_cal','proxima_cal','status']
  const head = ['Tag','Descrição','Tipo','Fabricante','Modelo','Localização','Faixa','Periodicidade','Critério IT-CQ-008','Última Calibração','Próxima Calibração','Status']
  const rows = [head, ...list.map(i => cols.map(c => i[c] || ''))]
  const csv  = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
  const a    = document.createElement('a')
  a.href     = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csv)
  a.download = 'BG_Instrumentos.csv'
  a.click()
}

export default function Inventario({ instruments, loading, onEdit, onDelete, onNew }) {
  const [search, setSearch]   = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fTipo,   setFTipo]   = useState('')
  const [page,    setPage]    = useState(0)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return instruments.filter(i =>
      (!q || [i.tag, i.descricao, i.fabricante, i.modelo, i.localizacao].join(' ').toLowerCase().includes(q)) &&
      (!fStatus || i.status === fStatus) &&
      (!fTipo   || i.tipo   === fTipo)
    )
  }, [instruments, search, fStatus, fTipo])

  const total = Math.ceil(filtered.length / PER_PAGE)
  const slice = filtered.slice(page * PER_PAGE, (page+1) * PER_PAGE)

  if (loading) return <Spinner />

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Inventário</h1>
          <p className={s.pageSub}>{filtered.length} de {instruments.length} instrumentos</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          <BtnGhost onClick={() => exportCSV(filtered)}><i className="ti ti-download" /> CSV</BtnGhost>
          <BtnPrimary onClick={onNew}><i className="ti ti-plus" /> Novo</BtnPrimary>
        </div>
      </div>

      <Card>
        <div className={s.toolbar}>
          <input
            placeholder="Buscar por tag, descrição, fabricante, localização..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
            style={{flex:1}}
          />
          <select value={fStatus} onChange={e => { setFStatus(e.target.value); setPage(0) }} style={{width:140}}>
            {STATUS.map(v => <option key={v} value={v}>{v || 'Todos os status'}</option>)}
          </select>
          <select value={fTipo} onChange={e => { setFTipo(e.target.value); setPage(0) }} style={{width:150}}>
            {TIPOS.map(v => <option key={v} value={v}>{v || 'Todos os tipos'}</option>)}
          </select>
        </div>

        {slice.length === 0
          ? <Empty icon="ti-ruler-2" text="Nenhum instrumento encontrado" />
          : <>
            <div style={{overflowX:'auto'}}>
              <table className={s.tbl} style={{minWidth:800}}>
                <thead>
                  <tr>
                    <th style={{width:80}}>Tag</th>
                    <th>Descrição</th>
                    <th style={{width:100}}>Tipo</th>
                    <th style={{width:120}}>Fabricante</th>
                    <th style={{width:85}}>Critério</th>
                    <th style={{width:90}}>Próx. calib.</th>
                    <th style={{width:85}}>Status</th>
                    <th style={{width:70,textAlign:'center'}}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {slice.map(i => (
                    <tr key={i.id}>
                      <td className={s.mono} style={{fontWeight:500}}>{i.tag}</td>
                      <td title={i.descricao} style={{maxWidth:130,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{i.descricao}</td>
                      <td className={s.muted}>{i.tipo||'—'}</td>
                      <td className={s.muted} style={{maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{[i.fabricante,i.modelo].filter(Boolean).join(' ')||'—'}</td>
                      <td style={{color:'var(--blue)',fontSize:10}}>{i.criterio||'—'}</td>
                      <td className={s.mono}>{fmtDate(i.proxima_cal)}</td>
                      <td><Badge status={i.status} /></td>
                      <td style={{textAlign:'center'}}>
                        <div style={{display:'flex',gap:4,justifyContent:'center'}}>
                          <button className={s.actBtn} style={{background:"var(--blue-bg)",color:"var(--blue)",padding:"3px 8px",borderRadius:"4px",border:"none",cursor:"pointer",fontSize:11,fontWeight:500}} onClick={() => onEdit(i)}>
                             Editar
                          </button>
                          <button className={s.actBtn} style={{background:"var(--red-bg)",color:"var(--red)",padding:"3px 8px",borderRadius:"4px",border:"none",cursor:"pointer",fontSize:11,fontWeight:500}} onClick={() => onDelete(i.id)} style={{color:'var(--red)'}}>
                             Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {total > 1 && (
              <div className={s.pager}>
                <button onClick={() => setPage(p => Math.max(0,p-1))} disabled={page===0}>‹ Anterior</button>
                <span>{page+1} / {total}</span>
                <button onClick={() => setPage(p => Math.min(total-1,p+1))} disabled={page>=total-1}>Próxima ›</button>
                <span style={{marginLeft:'auto',color:'var(--text3)'}}>{filtered.length} registros</span>
              </div>
            )}
          </>
        }
      </Card>
    </div>
  )
}
// style patch applied


