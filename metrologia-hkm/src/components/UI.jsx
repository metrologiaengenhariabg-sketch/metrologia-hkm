import s from './UI.module.css'

export function Badge({ status }) {
  const cls = {
    'Calibrado':       s.ok,
    'A vencer':        s.warn,
    'Vencido':         s.danger,
    'Inativo':  s.gray,
    'Inativo':         s.gray,
  }[status] || s.gray
  return <span className={`${s.badge} ${cls}`}>{status}</span>
}

export function Card({ children, className = '' }) {
  return <div className={`${s.card} ${className}`}>{children}</div>
}

export function CardHeader({ title, action }) {
  return (
    <div className={s.cardHeader}>
      <span className={s.cardTitle}>{title}</span>
      {action}
    </div>
  )
}

export function KPICard({ icon, value, label, color }) {
  return (
    <div className={s.kpi}>
      <div className={s.kpiIcon} style={{ background: color + '22', color }}>
        <i className={`ti ${icon}`} />
      </div>
      <p className={s.kpiVal} style={{ color }}>{value}</p>
      <p className={s.kpiLabel}>{label}</p>
    </div>
  )
}

export function AlertStrip({ type = 'danger', children }) {
  return (
    <div className={`${s.alert} ${type === 'warn' ? s.alertWarn : s.alertDanger}`}>
      <i className={`ti ${type === 'warn' ? 'ti-clock' : 'ti-alert-triangle'}`} />
      {children}
    </div>
  )
}

export function BtnPrimary({ onClick, children, disabled }) {
  return <button className={s.btnPrimary} onClick={onClick} disabled={disabled}>{children}</button>
}

export function BtnGhost({ onClick, children, disabled }) {
  return <button className={s.btnGhost} onClick={onClick} disabled={disabled}>{children}</button>
}

export function Spinner() {
  return <div className={s.spinner}><i className="ti ti-loader-2" /></div>
}

export function Empty({ icon = 'ti-inbox', text = 'Nenhum resultado' }) {
  return (
    <div className={s.empty}>
      <i className={`ti ${icon}`} />
      <p>{text}</p>
    </div>
  )
}

