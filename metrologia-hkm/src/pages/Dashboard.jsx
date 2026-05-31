import { KPICard, Card, CardHeader, AlertStrip, Badge, Spinner, Empty } from '../components/UI.jsx'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
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

const STATUS_COLORS = {
  'Calibrado':  '#22c55e',
  'A vencer':   '#f97316',
  'Vencido':    '#ef4444',
  'Calibrando': '#3b82f6',
  'Inativo':    '#9ca3af',
}

export default function Dashboard({ instruments, stats, loading, onNew }) {
  if (loading) return <Spinner />

  const vencidos    = instruments.filter(i => i.status === 'Vencido')
  const avencer     = instruments.filter(i => i.status === 'A vencer')
  const calibrados  = instruments.filter(i => i.status === 'Calibrado')
  const calibrando  = instruments.filter(i => i.status === 'Calibrando')
  const inativos    = instruments.filter(i => i.status === 'Inativo')

  const urgentes = [...vencidos, ...avencer]
    .sort((a,b) => new Date(a.proxima_cal) - new Date(b.proxima_cal))
    .slice(0,20)

  const proximas = [...instruments]
    .filter(i => i.proxima_cal)
    .sort((a,b) => new Date(a.proxima_cal) - new Date(b.proxima_cal))
    .slice(0,6)

  // Gráfico pizza — status
  const pieData = [
    { name: 'Calibrado',  value: calibrados.length  },
    { name: 'A vencer',   value: avencer.length      },
    { name: 'Vencido',    value: vencidos.length     },
    { name: 'Calibrando', value: calibrando.length   },
    { name: 'Inativo',    value: inativos.length     },
  ].filter(d => d.value > 0)

  // Gráfico barras — vencimentos próximos 6 meses
  const hoje = new Date()
  const meses = Array.from({length:6}, (_,i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth()+i, 1)
    return {
      mes: d.toLocaleDateString('pt-BR',{month:'short', year:'2-digit'}),
      ano: d.getFullYear(),
      mes_num: d.getMonth(),
      count: 0
    }
  })
  instruments.forEach(i => {
    if (!i.proxima_cal) return
    const d = new Date(i.proxima_cal)
    const idx = meses.findIndex(m => m.ano === d.getFullYear() && m.mes_num === d.getMonth())
    if (idx >= 0) meses[idx].count++
  })

  // Gráfico barras — por setor
  const setorMap = {}
  instruments.forEach(i => {
    const s = i.setor || 'Não informado'
    setorMap[s] = (setorMap[s] || 0) + 1
  })
  const setorData = Object.entries(setorMap)
    .sort((a,b) => b[1]-a[1])
    .slice(0,8)
    .map(([name,value]) => ({name, value}))

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
        <KPICard icon="ti-refresh"         value={calibrando.length}  label="Calibrando"            color="var(--blue)"   />
        <KPICard icon="ti-minus-vertical"  value={inativos.length}    label="Inativo"               color="var(--gray)"   />
      </div>

      <div className={s.twoCols}>
        {/* Gráfico Pizza — Status */}
        <Card>
          <CardHeader title="Distribuição por status" />
          <div style={{padding:'8px 0'}}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pieData.map((entry,i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] || '#9ca3af'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v,n) => [v, n]} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Gráfico Barras — Vencimentos por mês */}
        <Card>
          <CardHeader title="Calibrações nos próximos 6 meses" />
          <div style={{padding:'8px 0'}}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={meses} margin={{top:5,right:10,left:-20,bottom:5}}>
                <XAxis dataKey="mes" tick={{fontSize:11}} />
                <YAxis tick={{fontSize:11}} />
                <Tooltip />
                <Bar dataKey="count" name="Instrumentos" fill="var(--blue)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Gráfico Barras — Por setor */}
      <Card>
        <CardHeader title="Instrumentos por setor" />
        <div style={{padding:'8px 0'}}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={setorData} layout="vertical" margin={{top:5,right:20,left:80,bottom:5}}>
              <XAxis type="number" tick={{fontSize:11}} />
              <YAxis type="category" dataKey="name" tick={{fontSize:11}} width={80} />
              <Tooltip />
              <Bar dataKey="value" name="Instrumentos" fill="var(--blue)" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className={s.twoCols}>
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

        <Card>
          <CardHeader title="Instrumentos com atenção" />
          {urgentes.length === 0
            ? <Empty icon="ti-circle-check" text="Todos os instrumentos estão em dia" />
            : <table className={s.tbl}>
                <thead>
                  <tr>
                    <th>Tag</th><th>Descrição</th>
                    <th>Próx. calibração</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {urgentes.slice(0,8).map(i => (
                    <tr key={i.id}>
                      <td className={s.mono}>{i.tag}</td>
                      <td>{i.descricao}</td>
                      <td className={s.mono}>{fmtDate(i.proxima_cal)}</td>
                      <td><Badge status={i.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
          }
        </Card>
      </div>
    </div>
  )
}
