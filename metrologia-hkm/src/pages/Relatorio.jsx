import { useMemo } from 'react'
import { Card, Badge, Spinner, Empty } from '../components/UI.jsx'
import s from './Pages.module.css'

function fmtDate(d) { return d ? new Date(d).toLocaleDateString('pt-BR') : '—' }

export default function Relatorio({ instruments, loading }) {
  if (loading) return <Spinner />

  const total      = instruments.length
  const calibrados = instruments.filter(i => i.status === 'Calibrado').length
  const avencer    = instruments.filter(i => i.status === 'A vencer').length
  const vencidos   = instruments.filter(i => i.status === 'Vencido').length
  const calibrando = instruments.filter(i => i.status === 'Calibrando').length
  const inativos   = instruments.filter(i => i.status === 'Inativo').length

  const conformidade = total > 0 ? Math.round((calibrados / total) * 100) : 0

  // Por tipo
  const porTipo = useMemo(() => {
    const map = {}
    instruments.forEach(i => {
      const t = i.tipo || 'Não informado'
      if (!map[t]) map[t] = { total:0, calibrado:0, avencer:0, vencido:0, inativo:0, calibrando:0 }
      map[t].total++
      if (i.status === 'Calibrado')  map[t].calibrado++
      if (i.status === 'A vencer')   map[t].avencer++
      if (i.status === 'Vencido')    map[t].vencido++
      if (i.status === 'Inativo')    map[t].inativo++
      if (i.status === 'Calibrando') map[t].calibrando++
    })
    return Object.entries(map).sort((a,b) => b[1].total - a[1].total)
  }, [instruments])

  // Por setor
  const porSetor = useMemo(() => {
    const map = {}
    instruments.forEach(i => {
      const t = i.setor || 'Não informado'
      if (!map[t]) map[t] = { total:0, vencido:0 }
      map[t].total++
      if (i.status === 'Vencido' || i.status === 'A vencer') map[t].vencido++
    })
    return Object.entries(map).sort((a,b) => b[1].total - a[1].total)
  }, [instruments])

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <h1 className={s.pageTitle}>Visão geral</h1>
          <p className={s.pageSub}>Indicadores e análise do parque de instrumentos</p>
        </div>
      </div>

      {/* Taxa de conformidade */}
      <Card>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0'}}>
          <div>
            <p style={{fontSize:13,fontWeight:600,marginBottom:4}}>Taxa de conformidade</p>
            <p style={{fontSize:11,color:'var(--text2)'}}>Instrumentos calibrados em dia / total ativo</p>
          </div>
          <div style={{textAlign:'right'}}>
            <p style={{fontSize:32,fontWeight:700,color: conformidade >= 80 ? 'var(--green)' : conformidade >= 60 ? 'var(--orange)' : 'var(--red)'}}>{conformidade}%</p>
            <p style={{fontSize:11,color:'var(--text2)'}}>{calibrados} de {total} instrumentos</p>
          </div>
        </div>
        <div style={{background:'var(--bg)',borderRadius:4,height:8,marginTop:8}}>
          <div style={{
            background: conformidade >= 80 ? 'var(--green)' : conformidade >= 60 ? 'var(--orange)' : 'var(--red)',
            width:`${conformidade}%`, height:'100%', borderRadius:4, transition:'width .5s'
          }} />
        </div>
      </Card>

      {/* Resumo por status */}
      <div className={s.kpis} style={{marginTop:16}}>
        {[
          ['Calibrado',  calibrados,  'var(--green)'],
          ['A vencer',   avencer,     'var(--orange)'],
          ['Vencido',    vencidos,    'var(--red)'],
          ['Calibrando', calibrando,  'var(--blue)'],
          ['Inativo',    inativos,    'var(--gray)'],
        ].map(([label, val, color]) => (
          <div key={label} style={{background:'var(--surface)',border:'0.5px solid var(--border)',borderRadius:'var(--radius)',padding:'12px 16px'}}>
            <p style={{fontSize:24,fontWeight:700,color}}>{val}</p>
            <p style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{label}</p>
            <p style={{fontSize:10,color:'var(--text3)'}}>{total > 0 ? Math.round((val/total)*100) : 0}% do total</p>
          </div>
        ))}
      </div>

      {/* Por tipo */}
      <Card style={{marginTop:16}}>
        <p style={{fontSize:13,fontWeight:600,marginBottom:12}}>Instrumentos por tipo</p>
        <table className={s.tbl}>
          <thead>
            <tr>
              <th>Tipo</th>
              <th style={{width:70,textAlign:'center'}}>Total</th>
              <th style={{width:80,textAlign:'center'}}>Calibrado</th>
              <th style={{width:70,textAlign:'center'}}>A vencer</th>
              <th style={{width:70,textAlign:'center'}}>Vencido</th>
              <th style={{width:80,textAlign:'center'}}>Calibrando</th>
              <th style={{width:70,textAlign:'center'}}>Inativo</th>
            </tr>
          </thead>
          <tbody>
            {porTipo.map(([tipo, v]) => (
              <tr key={tipo}>
                <td style={{fontWeight:500}}>{tipo}</td>
                <td style={{textAlign:'center',fontWeight:600}}>{v.total}</td>
                <td style={{textAlign:'center',color:'var(--green)'}}>{v.calibrado}</td>
                <td style={{textAlign:'center',color:'var(--orange)'}}>{v.avencer}</td>
                <td style={{textAlign:'center',color:'var(--red)'}}>{v.vencido}</td>
                <td style={{textAlign:'center',color:'var(--blue)'}}>{v.calibrando}</td>
                <td style={{textAlign:'center',color:'var(--gray)'}}>{v.inativo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Por setor */}
      <Card style={{marginTop:16}}>
        <p style={{fontSize:13,fontWeight:600,marginBottom:12}}>Instrumentos por setor</p>
        {porSetor.length === 0 || (porSetor.length === 1 && porSetor[0][0] === 'Não informado')
          ? <Empty text="Nenhum setor cadastrado nos instrumentos" />
          : <table className={s.tbl}>
              <thead>
                <tr>
                  <th>Setor</th>
                  <th style={{width:70,textAlign:'center'}}>Total</th>
                  <th style={{width:120,textAlign:'center'}}>Vencidos / A vencer</th>
                </tr>
              </thead>
              <tbody>
                {porSetor.map(([setor, v]) => (
                  <tr key={setor}>
                    <td style={{fontWeight:500}}>{setor}</td>
                    <td style={{textAlign:'center',fontWeight:600}}>{v.total}</td>
                    <td style={{textAlign:'center',color: v.vencido > 0 ? 'var(--red)' : 'var(--green)'}}>
                      {v.vencido} {v.vencido > 0 ? '⚠️' : '✅'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </Card>
    </div>
  )
}
