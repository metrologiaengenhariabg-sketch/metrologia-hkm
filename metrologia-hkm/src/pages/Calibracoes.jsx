// ── Calibrações ──────────────────────────────────────────────
import { Card, CardHeader, Badge, AlertStrip, Spinner, Empty } from '../components/UI.jsx'
import s from './Pages.module.css'

function fmtDate(d) { return d ? new Date(d).toLocaleDateString('pt-BR') : '—' }
function daysDiff(d) { if(!d) return null; const t=new Date();t.setHours(0,0,0,0); return Math.round((new Date(d)-t)/86400000) }

export function Calibracoes({ instruments, loading }) {
  if (loading) return <Spinner />
  const vencidos = [...instruments].filter(i=>i.status==='Vencido').sort((a,b)=>new Date(a.proxima_cal)-new Date(b.proxima_cal))
  const avencer  = [...instruments].filter(i=>i.status==='A vencer').sort((a,b)=>new Date(a.proxima_cal)-new Date(b.proxima_cal))
  const sorted   = [...instruments].filter(i=>i.proxima_cal).sort((a,b)=>new Date(a.proxima_cal)-new Date(b.proxima_cal))

  const CalItem = ({i}) => (
    <div className={s.calItem}>
      <p className={s.calDate}>{fmtDate(i.proxima_cal)}</p>
      <div style={{flex:1,minWidth:0}}>
        <p className={s.calName}>{i.descricao}</p>
        <p className={s.calTag}>{i.tag} · {i.criterio||'—'}</p>
      </div>
    </div>
  )

  return (
    <div>
      <div className={s.pageHeader}>
        <div><h1 className={s.pageTitle}>Calibrações</h1><p className={s.pageSub}>Controle por vencimento · IT-CQ-008</p></div>
      </div>
      {vencidos.length>0 && <AlertStrip type="danger"><strong>{vencidos.length}</strong> com calibração vencida.</AlertStrip>}
      {avencer.length>0  && <AlertStrip type="warn"><strong>{avencer.length}</strong> a vencer nos próximos 30 dias.</AlertStrip>}
      <div className={s.twoCols}>
        <Card>
          <CardHeader title={<><i className="ti ti-alert-triangle" style={{color:'var(--red)',marginRight:5}} />Vencidas ({vencidos.length})</>} />
          {vencidos.length===0 ? <Empty icon="ti-circle-check" text="Nenhuma vencida" /> : vencidos.slice(0,30).map(i=><CalItem key={i.id} i={i}/>)}
        </Card>
        <Card>
          <CardHeader title={<><i className="ti ti-clock" style={{color:'var(--orange)',marginRight:5}} />A vencer — 30 dias ({avencer.length})</>} />
          {avencer.length===0 ? <Empty icon="ti-circle-check" text="Nenhuma a vencer" /> : avencer.map(i=><CalItem key={i.id} i={i}/>)}
        </Card>
      </div>
      <Card>
        <CardHeader title="Todos os instrumentos por vencimento" />
        <div style={{overflowX:'auto'}}>
          <table className={s.tbl} style={{tableLayout:'fixed',width:'100%'}}>
            <colgroup><col style={{width:82}}/><col style={{width:'*'}}/><col style={{width:90}}/><col style={{width:90}}/><col style={{width:90}}/><col style={{width:80}}/><col style={{width:60}}/><col style={{width:85}}/></colgroup>
            <thead><tr><th>Tag</th><th>Descrição</th><th>Tipo</th><th>Últ. calib.</th><th>Próx. calib.</th><th>Período</th><th>Dias</th><th>Status</th></tr></thead>
            <tbody>
              {sorted.slice(0,150).map(i=>{
                const d=daysDiff(i.proxima_cal)
                const dc=d===null?'':d<0?'color:var(--red)':d<=30?'color:var(--orange)':'color:var(--text2)'
                return <tr key={i.id}>
                  <td className={s.mono} style={{fontWeight:500}}>{i.tag}</td>
                  <td title={i.descricao}>{i.descricao}</td>
                  <td className={s.muted}>{i.tipo}</td>
                  <td className={s.mono}>{fmtDate(i.ultima_cal)}</td>
                  <td className={s.mono}>{fmtDate(i.proxima_cal)}</td>
                  <td className={s.muted}>{i.periodicidade||'—'}</td>
                  <td className={s.mono} style={{cssText:dc}}>{d!==null?(d>=0?'+'+d+'d':d+'d'):'—'}</td>
                  <td><Badge status={i.status}/></td>
                </tr>
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ── Relatório ─────────────────────────────────────────────────
export function Relatorio({ instruments, stats, loading }) {
  if (loading) return <Spinner />
  const byTipo   = {}
  const byStatus = {}
  instruments.forEach(i => {
    byTipo[i.tipo]     = (byTipo[i.tipo]||0)+1
    byStatus[i.status] = (byStatus[i.status]||0)+1
  })
  const conf = instruments.length ? Math.round((byStatus['Calibrado']||0)/instruments.length*100) : 0

  return (
    <div>
      <div className={s.pageHeader}><div><h1 className={s.pageTitle}>Visão geral</h1><p className={s.pageSub}>Indicadores consolidados · HKM</p></div></div>
      <div className={s.kpis} style={{gridTemplateColumns:'repeat(3,1fr)'}}>
        {[['Taxa de conformidade',`${conf}%`,'var(--green)'],['Pendências críticas',byStatus['Vencido']||0,'var(--red)'],['Atenção preventiva',byStatus['A vencer']||0,'var(--orange)']].map(([l,v,c])=>(
          <div key={l} style={{background:'var(--surface)',border:'0.5px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'16px'}}>
            <p style={{fontSize:22,fontWeight:600,color:c,lineHeight:1}}>{v}</p>
            <p style={{fontSize:11,color:'var(--text2)',marginTop:4}}>{l}</p>
          </div>
        ))}
      </div>
      <div className={s.twoCols}>
        <Card>
          <CardHeader title="Por tipo de instrumento" />
          <div style={{padding:'12px 16px'}}>
            {Object.entries(byTipo).sort((a,b)=>b[1]-a[1]).map(([k,v])=>(
              <div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:12,padding:'5px 0',borderBottom:'0.5px solid var(--border)'}}>
                <span>{k}</span><span style={{fontWeight:500}}>{v}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Por status" />
          <div style={{padding:'12px 16px'}}>
            {Object.entries(byStatus).map(([k,v])=>(
              <div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'5px 0',borderBottom:'0.5px solid var(--border)'}}>
                <span style={{fontSize:12}}>{k}</span><Badge status={k}>{v}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

// ── IT-CQ-008 ─────────────────────────────────────────────────
const CRITERIOS = [
  ['Alicate Amperímetro','ALC','Tensão/Corrente DC/AC, Resistência','12 meses','±5% da leitura',null],
  ['Aparelho de US','INSP','Controle de ganho / Linearidade','12 meses','±2% / 1mm',null],
  ['Balança','BAL','0–40 Kg / 0–5,01 Kg','12 meses','1% da leitura',null],
  ['Bloco Padrão','BLP','0,50–100,00mm','12 meses','0,005mm',null],
  ['Braço Tridimensional','BTR','0–1500mm','24 meses','±0,07mm',null],
  ['Calibrador Tampão Rosca Métrica','CTRM','—','60 meses','Conforme NBR ISO 1502','NBR ISO 1502'],
  ['Calibrador Tampão Rosca Unificada','CTRU','—','60 meses','Conforme ANSI/ASME B1.2','ANSI/ASME B1.2'],
  ['Calibrador Tampão Rosca NPT','CTRN','—','60 meses','Conforme ANSI/ASME B1.20.1','ANSI/ASME B1.20.1'],
  ['Calibrador Anel de Rosca','CAR','—','60 meses','Conforme NBR ISO 1502 e ANSI/ASME B1.20.1','NBR ISO 1502'],
  ['Calibrador de Folga','CF','0,05–1,00mm','12 meses','Conforme DIN 2275','DIN 2275'],
  ['Calibrador de Solda','CS','0 a 25/30/45mm','12 meses','±0,3mm',null],
  ['Calibre Passa Não Passa','CNP','6,3–20mm','12 meses','±0,2mm',null],
  ['Célula de Carga','CC','0–600 / 0–300 tf','12 meses','2% da leitura',null],
  ['Clinômetro Digital','MI','0–90°','12 meses','±0,3°',null],
  ['Condutivímetro','CNV','0–2000 µS/cm','24 meses','3% da leitura',null],
  ['Controlador de Temperatura','CT','-50–1200°C','12 meses','3°C',null],
  ['Cronômetro Digital','CMD','0–50s','12 meses','0,01s',null],
  ['Detector de Gás','DG','O₂/CO₂/CH₄/H₂O','6 meses','±2,0 / ±2,1',null],
  ['Durômetro','DUR','Shore D/A','12 meses','2 Shore / 1,3 Shore',null],
  ['Durômetro Portátil Digital','MTK','70–960 HLD','12 meses','10 HLD',null],
  ['Escala','ESC','0–1m / 0–2m','12 meses','1,3mm',null],
  ['Esquadro de Aço','EA','90°','12 meses','1° / retitude 0,2mm',null],
  ['Esquadro Combinado','EC','90°','12 meses',"0°30' / retitude 0,05mm",null],
  ['Fluxômetro','BB','3–25 l/min','12 meses','1 l/min',null],
  ['Goniômetro','GP','0–360°','12 meses',"0°10'",null],
  ['Holiday Detector','HD','0–90W','24 meses','±0,12W',null],
  ['Luxímetro','LUX','0–199.999 Lx','6 meses','±15 Lx',null],
  ['Malha de Pressão','MAP','0–25 bar','12 meses','1,3% do FE',null],
  ['Manômetro','MAN','Diversas faixas','12 meses','3% do FE',null],
  ['Teste de Aderência Pull Off','ETA','0–25 MPa','24 meses','1,1 MPa',null],
  ['Manovacuômetro','MVA','Diversas faixas','12 meses','3% do FE',null],
  ['Bloco de Massa Padrão','BMP','5,5 Kg','12 meses','±100g',null],
  ['Medidor de Camada','MC','0–1500µm','12 meses','0,04µm',null],
  ['Medidor de Camada Úmida','MEE','51–762µm','12 meses','0,04µm',null],
  ['Medidor de Espessura','SP','0–1000µm','12 meses','0,04µm',null],
  ['Micrômetro de Rosca','MR','25–50mm','12 meses','0,007mm',null],
  ['Micrômetro Externo','ME','Diversas faixas','12 meses','0,007 / 0,010mm',null],
  ['Micrômetro Interno','MIT','Diversas faixas','12 meses','0,007mm',null],
  ['Multímetro','MUL','Tensão/Corrente DC/AC, Resistência','12 meses','±5% da leitura',null],
  ['Nível de Bolhas','NB','—','12 meses','0,1mm',null],
  ['Nível Ótico','NO','0–100m','12 meses','≤1mm/Km',null],
  ['Paquímetro','PAQ','Diversas faixas','12 meses','0,07mm / 0,3mm',null],
  ['Paquímetro de Profundidade','PQP','0–150mm','12 meses','0,07mm',null],
  ['Projetor de Perfil','PROJ','0–180° / 0–50mm','36 meses',"0°10' / 0,020mm",null],
  ['Registrador Gráfico','REG','-200–1260°C','3 meses','6,7°C',null],
  ['Relógio Apalpador','RA','0–0,8 / 0–1,5mm','12 meses','0,07mm',null],
  ['Relógio Comparador','RC','0–0,25" / 0–10mm','12 meses','0,07mm',null],
  ['Rugosímetro','RUG','0–350µm / 0–12,7mm','12/60 meses','0,13µm / 0,007mm',null],
  ['Súbito','SUB','Diversas faixas','12 meses','0,007mm',null],
  ['Transferidor de Grau','TGR','0–180°','12 meses',"0°15'00\"",null],
  ['Teodolito DGT10','TDL','0–360°','18 meses','0,7°',null],
  ['Termo-higrômetro','TER','0–50°C / 5–95%UR','12 meses','2°C / 6,7%UR',null],
  ['Termômetro Infravermelho','TI','-30–550°C','12 meses','5°C',null],
  ['Termômetro Digital','PIR','0–1300°C','12 meses','2°C',null],
  ['Termopar','TP','-270–1260°C','3 meses','6,7°C',null],
  ['Torquímetro','TOQ','200–1000 Nm','12 meses','4% da leitura',null],
  ['Transferidor de Ângulo','TA','0–180°','12 meses','0,7°',null],
  ['Trena','TR','0–5M / 0–8M / 0–30M','12 meses','1,3mm',null],
  ['Tubo Decantador','TD','0–100mL','12 meses','±0,2mL',null],
  ['YOKE','YO','0–5500g','12 meses','±0,2g',null],
]

import { useState } from 'react'
export function ITCQ() {
  const [q, setQ] = useState('')
  const list = CRITERIOS.filter(r => !q || r[0].toLowerCase().includes(q.toLowerCase()) || r[1].toLowerCase().includes(q.toLowerCase()))
  return (
    <div>
      <div className={s.pageHeader}><div><h1 className={s.pageTitle}>IT-CQ-008 Rev.03</h1><p className={s.pageSub}>Critérios de aceitação · HKM · 08/02/2024</p></div></div>
      <Card>
        <div className={s.toolbar}>
          <input placeholder="Buscar equipamento ou tag..." value={q} onChange={e=>setQ(e.target.value)} style={{flex:1}} />
        </div>
        <table className={s.tbl}>
          <thead><tr><th>Equipamento</th><th>Tag</th><th>Faixa de utilização</th><th>Periodicidade</th><th>Critério de aceitação</th><th>Norma</th></tr></thead>
          <tbody>
            {list.map(r=>(
              <tr key={r[1]}>
                <td>{r[0]}</td>
                <td className={s.mono} style={{fontWeight:500}}>{r[1]}</td>
                <td className={s.muted}>{r[2]}</td>
                <td className={s.muted}>{r[3]}</td>
                <td style={{color:'var(--blue)',fontWeight:500}}>{r[4]}</td>
                <td className={s.muted}>{r[5]||'—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

export default Calibracoes
