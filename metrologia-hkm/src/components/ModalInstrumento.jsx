import { useState, useEffect } from 'react'
import { upsertInstrumento } from '../lib/supabase'
import { BtnPrimary, BtnGhost } from './UI.jsx'
import s from './ModalInstrumento.module.css'

const TIPOS = [
  'Dimensional','Temperatura','Pressão/Força',
  'Elétrico/Outro','Calibrador de Rosca',
  'Inspeção de Solda','Dureza','Outro'
]

const CRITERIOS_MAP = {
  ALC:'±5% da leitura', MUL:'±5% da leitura', BAL:'1% da leitura',
  BLP:'0,005mm', BTR:'±0,07mm', CTRM:'Conforme NBR ISO 1502',
  CTRU:'Conforme ANSI/ASME B1.2', CTRN:'Conforme ANSI/ASME B1.20.1',
  CAR:'Conforme NBR ISO 1502 e ANSI/ASME B1.20.1', CF:'Conforme DIN 2275',
  CS:'±0,3mm', CNP:'±0,2mm', CC:'2% da leitura', MI:'±0,3°',
  CNV:'3% da leitura', CT:'3°C', CMD:'0,01s', DG:'±2,0%',
  DUR:'2 Shore / 1,3 Shore', MTK:'10 HLD', ESC:'1,3mm',
  EA:'1° / 0,2mm', EC:"0°30' / 0,05mm", GP:"0°10'", HD:'±0,12W',
  LUX:'±15 Lx', MAP:'1,3% do FE', MAN:'3% do FE', MN:'3% do FE',
  ETA:'1,1 MPa', MVA:'3% do FE', BMP:'±100g', MC:'0,04µm',
  MEE:'0,04µm', SP:'0,04µm', MR:'0,007mm', ME:'0,007mm',
  MIT:'0,007mm', NO:'≤1mm/Km', NB:'0,1mm', PQ:'0,07mm',
  PAQ:'0,07mm', PQP:'0,07mm', REG:'6,7°C', RA:'0,07mm',
  RC:'0,07mm', REC:'0,07mm', RUG:'0,13µm', SUB:'0,007mm',
  TGR:"0°15'", TRG:"0°15'", TA:'0,7°', TDL:'0,7°',
  TER:'2°C / 6,7%UR', TI:'5°C', PIR:'2°C', TP:'6,7°C',
  TOQ:'4% da leitura', TR:'1,3mm', TD:'±0,2mL',
  YO:'±0,2g', PT:'±0,2g', BB:'1 l/min', TEA:'1,1 MPa',
}

function suggestCriterio(tag) {
  if (!tag) return ''
  const upper = tag.toUpperCase().replace(/[-_\d].*/, '')
  return CRITERIOS_MAP[upper] || ''
}

const empty = {
  tag:'', descricao:'', tipo:'Dimensional', fabricante:'',
  modelo:'', serie:'', localizacao:'', faixa:'',
  periodicidade:'12 meses', criterio:'', ultima_cal:'', proxima_cal:'', observacao:''
}

export default function ModalInstrumento({ item, onClose, onSaved }) {
  const [form,    setForm]    = useState(item ? { ...item, ultima_cal: item.ultima_cal?.slice(0,10) || '', proxima_cal: item.proxima_cal?.slice(0,10) || '' } : empty)
  const [saving,  setSaving]  = useState(false)
  const [err,     setErr]     = useState('')
  const [suggest, setSuggest] = useState('')

  useEffect(() => {
    setSuggest(suggestCriterio(form.tag))
  }, [form.tag])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.descricao.trim()) { setErr('Informe a descrição.'); return }
    if (!form.tag.trim())       { setErr('Informe a tag/número.'); return }
    setSaving(true); setErr('')
    try {
      const payload = {
        ...form,
        ultima_cal:   form.ultima_cal   || null,
        proxima_cal:  form.proxima_cal  || null,
      }
      if (item?.id) payload.id = item.id
      await upsertInstrumento(payload)
      onSaved()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  const F = ({ label, children }) => (
    <div className={s.frow}>
      <label className={s.label}>{label}</label>
      {children}
    </div>
  )

  return (
    <div className={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={s.modal}>
        <div className={s.mhead}>
          <span className={s.mtitle}>{item ? 'Editar instrumento' : 'Novo instrumento'}</span>
          <button className={s.close} onClick={onClose}><i className="ti ti-x" /></button>
        </div>

        <div className={s.body}>
          <div className={s.grid2}>
            <F label="Tag / nº patrimônio">
              <input value={form.tag} onChange={e => set('tag', e.target.value)} placeholder="Ex: PAQ-001" />
            </F>
            <F label="Tipo">
              <select value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                {TIPOS.map(t => <option key={t}>{t}</option>)}
              </select>
            </F>
          </div>

          <F label="Descrição">
            <input value={form.descricao} onChange={e => set('descricao', e.target.value)} placeholder="Ex: Paquímetro digital 150mm" style={{width:'100%'}}/>
          </F>

          <div className={s.grid2}>
            <F label="Fabricante"><input value={form.fabricante} onChange={e => set('fabricante', e.target.value)} /></F>
            <F label="Modelo">    <input value={form.modelo}     onChange={e => set('modelo',     e.target.value)} /></F>
          </div>

          <div className={s.grid2}>
            <F label="Série">         <input value={form.serie}        onChange={e => set('serie',        e.target.value)} /></F>
            <F label="Localização">   <input value={form.localizacao}  onChange={e => set('localizacao',  e.target.value)} /></F>
          </div>

          <div className={s.grid2}>
            <F label="Última calibração">  <input type="date" value={form.ultima_cal}  onChange={e => set('ultima_cal',  e.target.value)} /></F>
            <F label="Próxima calibração"> <input type="date" value={form.proxima_cal} onChange={e => set('proxima_cal', e.target.value)} /></F>
          </div>

          <div className={s.grid2}>
            <F label="Periodicidade">
              <input value={form.periodicidade} onChange={e => set('periodicidade', e.target.value)} placeholder="Ex: 12 meses" />
            </F>
            <F label="Faixa de utilização">
              <input value={form.faixa} onChange={e => set('faixa', e.target.value)} placeholder="Ex: 0–150mm" />
            </F>
          </div>

          <F label="Critério de aceitação (IT-CQ-008)">
            <input value={form.criterio} onChange={e => set('criterio', e.target.value)} placeholder="Ex: 0,07mm" style={{width:'100%'}} />
            {suggest && !form.criterio && (
              <div className={s.hint}>
                Sugestão IT-CQ-008: <strong>{suggest}</strong>
                <button onClick={() => set('criterio', suggest)}>Usar</button>
              </div>
            )}
          </F>

          <F label="Observação">
            <textarea rows={2} value={form.observacao} onChange={e => set('observacao', e.target.value)} style={{width:'100%', resize:'none'}} />
          </F>

          {err && <p className={s.err}><i className="ti ti-alert-circle" /> {err}</p>}
        </div>

        <div className={s.footer}>
          <BtnGhost onClick={onClose}>Cancelar</BtnGhost>
          <BtnPrimary onClick={handleSave} disabled={saving}>
            {saving ? <><i className="ti ti-loader-2" style={{animation:'spin .8s linear infinite',display:'inline-block'}} /> Salvando…</> : 'Salvar instrumento'}
          </BtnPrimary>
        </div>
      </div>
    </div>
  )
}
