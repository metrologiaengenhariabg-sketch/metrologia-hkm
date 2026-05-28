import { KPICard, Card, CardHeader, AlertStrip, Badge, Spinner, Empty } from '../components/UI.jsx'
import s from './Pages.module.css'

function daysDiff(proxStr) {
  if (!proxStr) return null
  const d = new Date(proxStr)
  const t = new Date(); t.setHours(0,0,0,0)
  return Math.round((d - t) / 86400000)
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

export default function Dashboard({ instruments, stats, loading, onNew }) {
  if (loading) return <Spinner />

  const vencidos  = instruments.filter(i => i.status === 'Vencido')
  const avencer   = instruments.filter(i => i.status === 'A vencer')
  const calibrados = instruments.filter(i => i.status === 'Calibrado')
  const semcal    = instruments.filter(i => i.status === 'Sem calibração')

  const urgentes = [...vencidos, ...avencer]
    .sort((a,b) => new Date(a.proxima_cal) - new Date(b.proxima_cal))
    .slice(0,20)

  const proximas = [...instruments]
    .filter(i => i.proxima_cal)
    .sort((a,b) => new Date(a.proxima_cal) - new Date(b.proxima_cal))
    .slice(0,6)

  const byStatus = {
    'Calibrado': calibrados.length,
    'A vencer':  avencer.length,
    'Vencido':   vencidos.length,
    'Sem calibração': semcal.length,
  }
  const cols = { 'Calibrado':'var(--green)', 'A vencer':'var(--orange)', 'Vencido':'var(--red)', 'Sem calibração':'var(--gray)' }

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Dashboard</h1>
          <p className={s.pageSub}>HKM Indústria e Comércio · IT-CQ-008 Rev.03</p>
        </div>
        <button className={s.btnPrimary} onClick={onNew}><i className="ti ti-plus" /> Novo instrumento</button>
      </div>

      {vencidos.length > 0 && <AlertStrip type="danger"><strong>{vencidos.length}</strong>&nbsp;instrumento(s) com calibração vencida — ação imediata necessária.</AlertStrip>}
      {avencer.length  > 0 && <AlertStrip type="warn"><strong>{avencer.length}</strong>&nbsp;instrumento(s) a vencer nos próximos 30 dias.</AlertStrip>}

      <div className={s.kpis}>
        <KPICard icon="ti-ruler-2"         value={instruments.length} label="Total de instrumentos" color="var(--blue)"   />
        <KPICard icon="ti-circle-check"    value={calibrados.length}  label="Calibrados"            color="var(--green)"  />
        <KPICard icon="ti-clock"           value={avencer.length}     label="A vencer (30d)"        color="var(--orange)" />
        <KPICard icon="ti-alert-triangle"  value={vencidos.length}    label="Calibração vencida"    color="var(--red)"    />
        <KPICard icon="ti-minus-vertical"  value={semcal.length}      label="Sem calibração"        color="var(--gray)"   />
      </div>

      <div className={s.twoCols}>
        <Card>
          <CardHeader title="Status do parque" />
          <div style={{padding:'14px 16px'}}>
            {Object.entries(byStatus).map(([k,v]) => {
              const pct = instruments.length ? Math.round(v/instruments.length*100) : 0
              return (
                <div key={k} style={{marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:3}}>
                    <span>{k}</span>
                    <span style={{color:'var(--text2)'}}>{v} ({pct}%)</span>
                  </div>
                  <div style={{height:5,borderRadius:99,background:'var(--bg2)',overflow:'hidden'}}>
                    <div style={{height:'100%',borderRadius:99,width:`${pct}%`,background:cols[k],transition:'width .4s'}} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <CardHeader title="Próximas calibrações" />
          {proximas.length === 0 ? <Empty text="Sem calibrações agendadas" /> :
            proximas.map(i => {
              const d = daysDiff(i.proxima_cal)
              const col = d < 0 ? 'var(--red)' : d <= 30 ? 'var(--orange)' : 'var(--text2)'
              return (
                <div key={i.id} className={s.calItem}>
                  <p className={s.calDate} style={{color:col}}>{fmtDate(i.proxima_cal)}</p>
                  <div style={{flex:1,minWidth:0}}>
                    <p className={s.calName}>{i.descricao}</p>
                    <p className={s.calTag}>{i.tag}</p>
                  </div>
                  <Badge status={i.status} />
                </div>
              )
            })
          }
        </Card>
      </div>

      <Card>
        <CardHeader title="Instrumentos com atenção" />
        {urgentes.length === 0
          ? <Empty icon="ti-circle-check" text="Todos os instrumentos estão em dia" />
          : <table className={s.tbl}>
              <thead>
                <tr>
                  <th>Tag</th><th>Descrição</th><th>Tipo</th>
                  <th>Próx. calibração</th><th>Critério IT-CQ-008</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {urgentes.map(i => (
                  <tr key={i.id}>
                    <td className={s.mono}>{i.tag}</td>
                    <td>{i.descricao}</td>
                    <td className={s.muted}>{i.tipo}</td>
                    <td className={s.mono}>{fmtDate(i.proxima_cal)}</td>
                    <td style={{color:'var(--blue)',fontSize:11}}>{i.criterio||'—'}</td>
                    <td><Badge status={i.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </Card>
    </div>
  )
}


