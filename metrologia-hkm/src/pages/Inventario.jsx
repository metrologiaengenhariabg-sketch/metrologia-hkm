import { useState, useMemo } from 'react'
import { Card, Badge, BtnGhost, BtnPrimary, Spinner, Empty } from '../components/UI.jsx'
import s from './Pages.module.css'

const STATUS = ['','Calibrado','A vencer','Vencido','Calibrando','Inativo']
const TIPOS  = ['','Dimensional','Temperatura','Pressão/Força','Elétrico/Outro','Calibrador de Rosca','Inspeção de Solda','Dureza','Outro']
const PER_PAGE = 50

function fmtDate(d) { return d ? new Date(d).toLocaleDateString('pt-BR') : '—' }

function exportCSV(list) {
  const cols = ['tag','descricao','tipo','fabricante','modelo','localizacao','faixa','periodicidade','criterio','ultima_cal','proxima_cal','status']
  const head = ['Tag','Descrição','Tipo','Fabricante','Modelo','Localização','Faixa','Periodicidade','Critério','Última Calibração','Próxima Calibração','Status']
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
      (!q || [i.tag, i.descricao, i.fabricante, i.modelo, i.localizacao, i.num_certificado].join(' ').toLowerCase().includes(q)) &&
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
        <BtnGhost onClick={() => exportCSV(filtered)}><i className="ti ti-download" /> CSV</BtnGhost>
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
            <table className={s.tbl}>
              <thead>
                <tr>
                  <th style={{width:'9%'}}>Tag</th>
                  <th style={{width:'18%'}}>Descrição</th>
                  <th style={{width:'9%'}}>Tipo</th>
                  <th style={{width:'11%'}}>Fabricante</th>
                  <th style={{width:'11%'}}>Responsável</th>
                  <th style={{width:'9%'}}>Setor</th>
                  <th style={{width:'9%'}}>Critério</th>
                  <th style={{width:'10%'}}>Próx. calib.</th>
                  <th style={{width:'8%'}}>Status</th>
                  <th style={{width:'6%',textAlign:'center'}}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {slice.map(i => (
                  <tr key={i.id}>
                    <td style={{fontFamily:'monospace',fontSize:11,fontWeight:600}}>{i.tag}</td>
                    <td title={i.descricao}>{i.descricao}</td>
                    <td style={{color:'var(--text2)',fontSize:11}}>{i.tipo||'—'}</td>
                    <td style={{color:'var(--text2)',fontSize:11}}>{i.fabricante||'—'}</td>
                    <td style={{color:'var(--text2)',fontSize:11}}>{i.responsavel||'—'}</td>
                    <td style={{color:'var(--text2)',fontSize:11}}>{i.setor||'—'}</td>
                    <td style={{color:'var(--blue)',fontSize:11}}>{i.criterio||'—'}</td>
                    <td style={{fontFamily:'monospace',fontSize:11}}>{fmtDate(i.proxima_cal)}</td>
                    <td><Badge status={i.status} /></td>
                    <td style={{textAlign:'center',whiteSpace:'nowrap'}}>
                      <button
                        onClick={() => onEdit(i)}
                        style={{background:'var(--blue-bg)',color:'var(--blue)',border:'none',borderRadius:4,padding:'3px 7px',cursor:'pointer',fontSize:11,fontWeight:500,marginRight:3}}
                      >✏️</button>
                      <button
                        onClick={() => onDelete(i.id)}
                        style={{background:'var(--red-bg)',color:'var(--red)',border:'none',borderRadius:4,padding:'3px 7px',cursor:'pointer',fontSize:11,fontWeight:500}}
                      >🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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



