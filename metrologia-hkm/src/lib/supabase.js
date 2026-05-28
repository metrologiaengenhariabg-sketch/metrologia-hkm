import { createClient } from '@supabase/supabase-js'

// Substitua pelos valores do seu projeto Supabase:
// Dashboard → Settings → API
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

// ── Instrumentos ─────────────────────────────────────────────

export async function fetchInstrumentos(filters = {}) {
  let q = supabase
    .from('instrumentos')
    .select('*')
    .order('proxima_cal', { ascending: true, nullsFirst: false })

  if (filters.status) q = q.eq('status', filters.status)
  if (filters.tipo)   q = q.eq('tipo', filters.tipo)
  if (filters.search) {
    q = q.or(
      `tag.ilike.%${filters.search}%,` +
      `descricao.ilike.%${filters.search}%,` +
      `fabricante.ilike.%${filters.search}%,` +
      `localizacao.ilike.%${filters.search}%`
    )
  }

  const { data, error } = await q
  if (error) throw error
  return data
}

export async function upsertInstrumento(instrumento) {
  const { data, error } = await supabase
    .from('instrumentos')
    .upsert(instrumento, { onConflict: 'id' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteInstrumento(id) {
  const { error } = await supabase
    .from('instrumentos')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── Critérios IT-CQ-008 ──────────────────────────────────────

export async function fetchCriterios() {
  const { data, error } = await supabase
    .from('criterios_itcq')
    .select('*')
    .order('equipamento')
  if (error) throw error
  return data
}

// ── Histórico de calibrações ─────────────────────────────────

export async function fetchHistorico(instrumentoId) {
  const { data, error } = await supabase
    .from('historico_calibracoes')
    .select('*')
    .eq('instrumento_id', instrumentoId)
    .order('data_calibracao', { ascending: false })
  if (error) throw error
  return data
}

export async function addHistorico(registro) {
  const { data, error } = await supabase
    .from('historico_calibracoes')
    .insert(registro)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Estatísticas (Dashboard) ─────────────────────────────────

export async function fetchStats() {
  const { data, error } = await supabase
    .from('instrumentos')
    .select('status, tipo')
  if (error) throw error

  const byStatus = {}
  const byTipo   = {}
  for (const row of data) {
    byStatus[row.status] = (byStatus[row.status] || 0) + 1
    byTipo[row.tipo]     = (byTipo[row.tipo]     || 0) + 1
  }
  return { total: data.length, byStatus, byTipo }
}
