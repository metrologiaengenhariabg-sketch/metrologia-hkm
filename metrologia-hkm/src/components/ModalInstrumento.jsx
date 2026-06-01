import { useState, useEffect, useCallback } from 'react'
import { upsertInstrumento } from '../lib/supabase'
import { BtnPrimary, BtnGhost } from './UI.jsx'
import s from './ModalInstrumento.module.css'

const CRITERIOS_MAP = {
  ALC:'±5% da leitura', MUL:'±5% da leitura', BAL:'1% da leitura',
  BLP:'0,005mm', BTR:'±0,07mm', CTRM:'Conforme NBR ISO 1502',
  CTRU:'Conforme ANSI/ASME B1.2', CTRN:'Conforme ANSI/ASME B1.20.1',
  CAR:'Conforme NBR ISO 1502 e ANSI/ASME B1.20.1', CF:'Conforme DIN 2275',
  CS:'±0,3mm', CNP:'±0,2mm', CC:'2% da leitura', MI:'±0,3°',
  CNV:'3% da leitura', CT:'3°C', CMD:'0,01s', DG:'±2,0%',
  DUR:'2 Shore / 1,3 Shore', MTK:'10 HLD', ESC:'1,3mm',
  EA:"1° / 0,2mm", EC:"0°30' / 0,05mm", GP:"0°10'", HD:'±0,12W',
  LUX:'±15 Lx', MAP:'1,3% do FE', MAN:'3% do FE', MN:'3% do FE',
  ETA:'1,1 MPa', MVA:'3% do FE', BMP:'±100g', MC:'0,04µm',
  MEE:'0,04µm', SP:'0,04µm', MR:'0,007mm', ME:'0,007mm',
  MIT:'0,007mm', NO:'≤1mm/Km', NB:'0,1mm', PQ:'0,07mm',
  PAQ:'0,07mm', PQP:'0,07mm', REG:'6,7°C', RA:'0,07mm',
  RC:'0,07mm', RUG:'0,13µm', SUB:'0,007mm', TGR:"0°15'",
  TRG:"0°15'", TA:'0,7°', TDL:'0,7°', TER:'2°C / 6,7%UR',
  TI:'5°C', PIR:'2°C', TP:'6,7°C', TOQ:'4% da leitura',
  TR:'1,3mm', TD:'±0,2mL', YO:'±0,2g', PT:'±0,2g', BB:'1 l/min',
}

function suggestCriterio(tag) {
  if (!tag) return ''
  const upper = tag.toUpperCase().replace(/[-_\d].*/, '')
  return CRITERIOS_MAP[upper] || ''
}

export default function ModalInstrumento({ item, onClose, onSaved }) {
  const [tag,          setTag]          = useState(item?.tag || '')
  const [descricao,    setDescricao]    = useState(item?.descricao || '')
  const [tipo,         setTipo]         = useState(item?.tipo || '')
  const [fabricante,   setFabricante]   = useState(item?.fabricante || '')
  const [modelo,       setModelo]       = useState(item?.modelo || '')
  const [serie,        setSerie]        = useState(item?.serie || '')
  const [num_certificado, setNumCertificado] = useState(item?.num_certificado || '')
  const [localizacao,  setLocalizacao]  = useState(item?.localizacao || '')
  const [responsavel,  setResponsavel]  = useState(item?.responsavel || '')
  const [setor,        setSetor]        = useState(item?.setor || '')
  const [data_retirada,setDataRetirada] = useState(item?.data_retirada?.slice(0,10) || '')
  const [faixa,        setFaixa]        = useState(item?.faixa || '')
  const [periodicidade,setPeriodicidade]= useState(item?.periodicidade || '')
  const [criterio,     setCriterio]     = useState(item?.criterio || '')
  const [calibrado_por, setCalibradoPor] = useState(item?.calibrado_por || '')
  const [ultima_cal,   setUltimaCal]    = useState(item?.ultima_cal?.slice(0,10) || '')
  const [proxima_cal,  setProximaCal]   = useState(item?.proxima_cal?.slice(0,10) || '')
  const [observacao,   setObservacao]   = useState(item?.observacao || '')
  const [status,       setStatus]       = useState(item?.status || '')
  const [saving,       setSaving]       = useState(false)
  const [err,          setErr]          = useState('')

  const suggest = suggestCriterio(tag)

  const handleSave = async () => {
    if (!tag.trim() && !descricao.trim()) { setErr('Informe pelo menos a Tag ou a Descrição.'); return }
    setSaving(true); setErr('')
    try {
      const payload = {
        tag, descricao, tipo, fabricante, modelo, serie,
        localizacao, responsavel, setor, data_retirada: data_retirada || null, calibrado_por, num_certificado, faixa, periodicidade, criterio, observacao,
        ...(status ? { status } : {}),
        ultima_cal:  ultima_cal  || null,
        proxima_cal: proxima_cal || null,
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

  return (
    <div className={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={s.modal}>
        <div className={s.mhead}>
          <span className={s.mtitle}>{item ? 'Editar instrumento' : 'Novo instrumento'}</span>
          <button className={s.close} onClick={onClose}><i className="ti ti-x" /></button>
        </div>

        <div className={s.body}>
          <div className={s.grid2}>
            <div className={s.frow}>
              <label className={s.label}>Tag / nº patrimônio</label>
              <input value={tag} onChange={e => setTag(e.target.value)} placeholder="Ex: PAQ-001" />
            </div>
            <div className={s.frow}>
              <label className={s.label}>Tipo (opcional)</label>
              <input value={tipo} onChange={e => setTipo(e.target.value)} placeholder="Ex: Dimensional..." />
            </div>
          </div>

          <div className={s.frow}>
            <label className={s.label}>Descrição</label>
            <input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Ex: Paquímetro digital 150mm" style={{width:'100%'}} />
          </div>

          <div className={s.grid2}>
            <div className={s.frow}>
              <label className={s.label}>Fabricante</label>
              <input value={fabricante} onChange={e => setFabricante(e.target.value)} />
            </div>
            <div className={s.frow}>
              <label className={s.label}>Modelo</label>
              <input value={modelo} onChange={e => setModelo(e.target.value)} />
            </div>
          </div>

          <div className={s.grid2}>
            <div className={s.frow}>
              <label className={s.label}>Responsável pela retirada</label>
              <input value={responsavel} onChange={e => setResponsavel(e.target.value)} placeholder="Nome do responsável" />
            </div>
            <div className={s.frow}>
              <label className={s.label}>Setor</label>
              <input value={setor} onChange={e => setSetor(e.target.value)} placeholder="Ex: Manutenção, Qualidade..." />
            </div>
          </div>

          <div className={s.frow}>
            <label className={s.label}>Data de retirada</label>
            <input type="date" value={data_retirada} onChange={e => setDataRetirada(e.target.value)} style={{width:'100%'}} />
          </div>

          <div className={s.grid2}>
            <div className={s.frow}>
              <label className={s.label}>Série</label>
              <input value={serie} onChange={e => setSerie(e.target.value)} />
            </div>
            <div className={s.frow}>
              <label className={s.label}>Nº Certificado</label>
              <input value={num_certificado} onChange={e => setNumCertificado(e.target.value)} placeholder="Ex: CAL-2024-001" />
            </div>
          </div>

          <div className={s.frow}>
            <label className={s.label}>Localização</label>
            <input value={localizacao} onChange={e => setLocalizacao(e.target.value)} style={{width:'100%'}} />
          </div>

          <div className={s.grid2}>
            <div className={s.frow}>
              <label className={s.label}>Última calibração</label>
              <input type="date" value={ultima_cal} onChange={e => setUltimaCal(e.target.value)} />
            </div>
            <div className={s.frow}>
              <label className={s.label}>Próxima calibração</label>
              <input type="date" value={proxima_cal} onChange={e => setProximaCal(e.target.value)} />
            </div>
          </div>

          <div className={s.frow}>
            <label className={s.label}>Calibrado por (laboratório / técnico)</label>
            <input value={calibrado_por} onChange={e => setCalibradoPor(e.target.value)} placeholder="Ex: Lab. ABC, João Silva..." style={{width:'100%'}} />
          </div>

          <div className={s.grid2}>
            <div className={s.frow}>
              <label className={s.label}>Periodicidade</label>
              <input value={periodicidade} onChange={e => setPeriodicidade(e.target.value)} placeholder="Ex: 12 meses" />
            </div>
            <div className={s.frow}>
              <label className={s.label}>Faixa de utilização</label>
              <input value={faixa} onChange={e => setFaixa(e.target.value)} placeholder="Ex: 0–150mm" />
            </div>
          </div>

          <div className={s.frow}>
            <label className={s.label}>Critério de aceitação (IT-CQ-008)</label>
            <input value={criterio} onChange={e => setCriterio(e.target.value)} placeholder="Ex: 0,07mm" style={{width:'100%'}} />
            {suggest && !criterio && (
              <div className={s.hint}>
                Sugestão IT-CQ-008: <strong>{suggest}</strong>
                <button onClick={() => setCriterio(suggest)}>Usar</button>
              </div>
            )}
          </div>

          <div className={s.frow}>
            <label className={s.label}>Observação</label>
            <textarea rows={2} value={observacao} onChange={e => setObservacao(e.target.value)} style={{width:'100%', resize:'none'}} />
          </div>

          <div className={s.frow}>
            <label className={s.label}>Status (deixe em branco para calcular automaticamente)</label>
            <select value={status} onChange={e => setStatus(e.target.value)} style={{width:'100%'}}>
              <option value="">Automático (pela data)</option>
              <option value="Calibrando">🔄 Calibrando</option>
              <option value="Inativo">⚫ Inativo</option>
            </select>
          </div>

          {err && <p className={s.err}><i className="ti ti-alert-circle" /> {err}</p>}
        </div>

        <div className={s.footer}>
          <BtnGhost onClick={onClose}>Cancelar</BtnGhost>
          <BtnPrimary onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar instrumento'}
          </BtnPrimary>
        </div>
      </div>
    </div>
  )
}


