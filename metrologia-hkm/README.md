# MetroControl · HKM Indústria e Comércio

Sistema de gestão de instrumentos de medição baseado na IT-CQ-008 Rev.03.

---

## 🚀 Deploy em 4 passos

### 1. Criar conta no Supabase (gratuito)

1. Acesse **https://supabase.com** → "Start for free"
2. Crie um projeto: nome `metrologia-hkm`, senha forte, região **South America (São Paulo)**
3. Aguarde ~2 minutos o projeto subir

### 2. Criar o banco de dados

1. No painel do Supabase → **SQL Editor** → "New query"
2. Cole o conteúdo do arquivo `schema.sql`
3. Clique em **Run** — tabelas e critérios IT-CQ-008 são criados automaticamente

### 3. Importar os 847 instrumentos

1. No Supabase → **Table Editor** → tabela `instrumentos`
2. Clique em **Import data** → selecione o arquivo `HKM_Instrumentos.csv`  
   *(exporte pelo botão "CSV" dentro do protótipo atual)*
3. Mapeie as colunas e confirme a importação

### 4. Configurar e fazer deploy no Vercel

```bash
# 1. Instalar dependências
npm install

# 2. Criar arquivo de variáveis de ambiente
cp .env.example .env.local
# Preencha com os valores do Supabase:
# Dashboard → Settings → API → Project URL e anon public key

# 3. Testar localmente
npm run dev
# Abra http://localhost:5173

# 4. Deploy no Vercel (gratuito)
npm install -g vercel
vercel
# Siga o assistente — adicione as variáveis de ambiente quando pedido
```

**Resultado:** URL pública tipo `metrologia-hkm.vercel.app` ✅

---

## 📁 Estrutura do projeto

```
metrologia-hkm/
├── schema.sql              ← Execute no Supabase SQL Editor
├── .env.example            ← Copie para .env.local e preencha
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx             ← Navegação principal
    ├── lib/
    │   └── supabase.js     ← Todas as funções de banco de dados
    ├── components/
    │   ├── UI.jsx          ← Componentes reutilizáveis (Badge, Card, etc.)
    │   └── ModalInstrumento.jsx
    └── pages/
        ├── Dashboard.jsx
        ├── Inventario.jsx
        ├── Calibracoes.jsx  ← Também exporta Relatorio e ITCQ
        ├── Relatorio.jsx
        └── ITCQ.jsx
```

---

## ⚙️ Funcionalidades

- ✅ Dashboard com KPIs e alertas automáticos
- ✅ Inventário de 847+ instrumentos com busca e filtros
- ✅ Critérios IT-CQ-008 vinculados automaticamente por tag
- ✅ Status recalculado automaticamente pelo banco (trigger SQL)
- ✅ Calendário de calibrações — vencidas e a vencer
- ✅ Relatórios por tipo e status
- ✅ Página de referência IT-CQ-008 Rev.03
- ✅ Exportação CSV
- ✅ Cadastro e edição de instrumentos
- ✅ Histórico de calibrações (tabela `historico_calibracoes`)

---

## 🔐 Variáveis de ambiente necessárias

| Variável | Onde encontrar |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public |

No Vercel: Settings → Environment Variables → adicione as duas variáveis.

---

## 📦 Stack

| Camada | Tecnologia | Custo |
|---|---|---|
| Front-end | React 18 + Vite | Gratuito |
| Banco de dados | PostgreSQL (Supabase) | Gratuito até 500MB |
| API | Supabase REST automática | Gratuito |
| Autenticação | Supabase Auth | Gratuito |
| Hospedagem | Vercel | Gratuito |
| **Total** | | **R$ 0/mês** |

---

*IT-CQ-008 Rev.03 · HKM Indústria e Comércio S/A · CNPJ 09.493.879/0001-25*
