-- ============================================================
-- MetroControl HKM — Schema Supabase
-- IT-CQ-008 Rev.03 · 08/02/2024
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================================

-- 1. Tabela principal de instrumentos
CREATE TABLE IF NOT EXISTS instrumentos (
  id            BIGSERIAL PRIMARY KEY,
  tag           TEXT NOT NULL,
  descricao     TEXT NOT NULL,
  tipo          TEXT,
  fabricante    TEXT,
  modelo        TEXT,
  serie         TEXT,
  localizacao   TEXT,
  faixa         TEXT,
  unidade       TEXT,
  periodicidade TEXT,
  criterio      TEXT,      -- critério de aceitação IT-CQ-008
  ultima_cal    DATE,      -- data da última calibração
  proxima_cal   DATE,      -- data da próxima calibração
  status        TEXT DEFAULT 'Sem calibração'
                CHECK (status IN ('Calibrado','A vencer','Vencido','Sem calibração','Inativo')),
  observacao    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de critérios IT-CQ-008 (referência)
CREATE TABLE IF NOT EXISTS criterios_itcq (
  id              BIGSERIAL PRIMARY KEY,
  equipamento     TEXT NOT NULL,
  tag_prefixo     TEXT NOT NULL,
  faixa_util      TEXT,
  periodicidade   TEXT,
  criterio        TEXT NOT NULL,
  norma_ref       TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de histórico de calibrações
CREATE TABLE IF NOT EXISTS historico_calibracoes (
  id                BIGSERIAL PRIMARY KEY,
  instrumento_id    BIGINT REFERENCES instrumentos(id) ON DELETE CASCADE,
  data_calibracao   DATE NOT NULL,
  proxima_calibracao DATE,
  laboratorio       TEXT,
  certificado_num   TEXT,
  resultado         TEXT CHECK (resultado IN ('Aprovado','Reprovado','Condicional')),
  observacao        TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_instrumentos_updated
  BEFORE UPDATE ON instrumentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. Trigger para recalcular status automaticamente
CREATE OR REPLACE FUNCTION recalc_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.proxima_cal IS NULL THEN
    NEW.status = 'Sem calibração';
  ELSIF NEW.proxima_cal < CURRENT_DATE THEN
    NEW.status = 'Vencido';
  ELSIF NEW.proxima_cal <= CURRENT_DATE + INTERVAL '30 days' THEN
    NEW.status = 'A vencer';
  ELSE
    NEW.status = 'Calibrado';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_status_auto
  BEFORE INSERT OR UPDATE ON instrumentos
  FOR EACH ROW EXECUTE FUNCTION recalc_status();

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS idx_instrumentos_tag      ON instrumentos(tag);
CREATE INDEX IF NOT EXISTS idx_instrumentos_status   ON instrumentos(status);
CREATE INDEX IF NOT EXISTS idx_instrumentos_tipo     ON instrumentos(tipo);
CREATE INDEX IF NOT EXISTS idx_instrumentos_proxcal  ON instrumentos(proxima_cal);
CREATE INDEX IF NOT EXISTS idx_historico_instrumento ON historico_calibracoes(instrumento_id);

-- 7. Row Level Security (RLS) — habilitar autenticação por usuário
ALTER TABLE instrumentos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_calibracoes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE criterios_itcq         ENABLE ROW LEVEL SECURITY;

-- Política: usuários autenticados leem tudo
CREATE POLICY "leitura_autenticados" ON instrumentos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "leitura_autenticados" ON criterios_itcq
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "leitura_autenticados" ON historico_calibracoes
  FOR SELECT TO authenticated USING (true);

-- Política: usuários autenticados podem inserir/editar/deletar
CREATE POLICY "escrita_autenticados" ON instrumentos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "escrita_autenticados" ON historico_calibracoes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Inserir critérios IT-CQ-008 como referência
INSERT INTO criterios_itcq (equipamento, tag_prefixo, faixa_util, periodicidade, criterio, norma_ref) VALUES
('Alicate Amperímetro',         'ALC',  'Tensão/Corrente DC/AC, Resistência', '12 meses', '±5% da leitura',              NULL),
('Aparelho de US',              'INSP', 'Controle de ganho / Linearidade',    '12 meses', '±2% / 1mm',                   NULL),
('Balança',                     'BAL',  '0–40 Kg / 0–5,01 Kg',               '12 meses', '1% da leitura',               NULL),
('Bloco Padrão',                'BLP',  '0,50–100,00mm',                      '12 meses', '0,005mm',                     NULL),
('Braço Tridimensional',        'BTR',  '0–1500mm',                           '24 meses', '±0,07mm',                     NULL),
('Calibrador Tampão Rosca Métrica', 'CTRM', '—',                             '60 meses', 'Conforme NBR ISO 1502',        'NBR ISO 1502'),
('Calibrador Tampão Rosca Unificada','CTRU','—',                              '60 meses', 'Conforme ANSI/ASME B1.2',     'ANSI/ASME B1.2'),
('Calibrador Tampão Rosca NPT', 'CTRN', '—',                                 '60 meses', 'Conforme ANSI/ASME B1.20.1',  'ANSI/ASME B1.20.1'),
('Calibrador Anel de Rosca',    'CAR',  '—',                                  '60 meses', 'Conforme NBR ISO 1502 e ANSI/ASME B1.20.1', 'NBR ISO 1502'),
('Calibrador de Folga',         'CF',   '0,05–1,00mm',                        '12 meses', 'Conforme DIN 2275',           'DIN 2275'),
('Calibrador de Solda',         'CS',   '0 a 25/30/45mm',                     '12 meses', '±0,3mm',                     NULL),
('Calibre Passa Não Passa',     'CNP',  '6,3–20mm',                           '12 meses', '±0,2mm',                     NULL),
('Célula de Carga',             'CC',   '0–600 / 0–300 tf',                   '12 meses', '2% da leitura',               NULL),
('Clinômetro Digital',          'MI',   '0–90°',                              '12 meses', '±0,3°',                       NULL),
('Condutivímetro',              'CNV',  '0–2000 µS/cm',                       '24 meses', '3% da leitura',               NULL),
('Controlador de Temperatura',  'CT',   '-50–1200°C',                         '12 meses', '3°C',                         NULL),
('Cronômetro Digital',          'CMD',  '0–50s',                              '12 meses', '0,01s',                       NULL),
('Detector de Gás',             'DG',   'O₂/CO₂/CH₄/H₂O',                    '6 meses',  '±2,0 / ±2,1',                 NULL),
('Durômetro',                   'DUR',  'Shore D/A',                          '12 meses', '2 Shore / 1,3 Shore',         NULL),
('Durômetro Portátil Digital',  'MTK',  '70–960 HLD',                         '12 meses', '10 HLD',                      NULL),
('Escala',                      'ESC',  '0–1m / 0–2m',                        '12 meses', '1,3mm',                       NULL),
('Esquadro de Aço',             'EA',   '90°',                                '12 meses', '1° / retitude 0,2mm',         NULL),
('Esquadro Combinado',          'EC',   '90°',                                '12 meses', '0°30'' / retitude 0,05mm',    NULL),
('Fluxômetro',                  'BB',   '3–25 l/min',                         '12 meses', '1 l/min',                     NULL),
('Goniômetro',                  'GP',   '0–360°',                             '12 meses', '0°10''',                      NULL),
('Holiday Detector',            'HD',   '0–90W',                              '24 meses', '±0,12W',                      NULL),
('Luxímetro',                   'LUX',  '0–199.999 Lx',                       '6 meses',  '±15 Lx',                      NULL),
('Malha de Pressão',            'MAP',  '0–25 bar',                           '12 meses', '1,3% do FE',                  NULL),
('Manômetro',                   'MAN',  'Diversas faixas',                    '12 meses', '3% do FE',                    NULL),
('Teste de Aderência Pull Off',  'ETA',  '0–25 MPa',                          '24 meses', '1,1 MPa',                     NULL),
('Manovacuômetro',              'MVA',  'Diversas faixas',                    '12 meses', '3% do FE',                    NULL),
('Bloco de Massa Padrão',       'BMP',  '5,5 Kg',                             '12 meses', '±100g',                       NULL),
('Medidor de Camada',           'MC',   '0–1500µm',                           '12 meses', '0,04µm',                      NULL),
('Medidor de Camada Úmida',     'MEE',  '51–762µm',                           '12 meses', '0,04µm',                      NULL),
('Medidor de Espessura',        'SP',   '0–1000µm',                           '12 meses', '0,04µm',                      NULL),
('Micrômetro de Rosca',         'MR',   '25–50mm',                            '12 meses', '0,007mm',                     NULL),
('Micrômetro Externo',          'ME',   'Diversas faixas',                    '12 meses', '0,007 / 0,010mm',             NULL),
('Micrômetro Interno',          'MIT',  'Diversas faixas',                    '12 meses', '0,007mm',                     NULL),
('Multímetro',                  'MUL',  'Tensão/Corrente DC/AC, Resistência', '12 meses', '±5% da leitura',              NULL),
('Nível de Bolhas',             'NB',   '—',                                  '12 meses', '0,1mm',                       NULL),
('Nível Ótico',                 'NO',   '0–100m',                             '12 meses', '≤1mm/Km',                     NULL),
('Paquímetro',                  'PAQ',  'Diversas faixas',                    '12 meses', '0,07mm / 0,3mm',              NULL),
('Paquímetro de Profundidade',  'PQP',  '0–150mm',                            '12 meses', '0,07mm',                      NULL),
('Projetor de Perfil',          'PROJ', '0–180° / 0–50mm',                    '36 meses', '0°10'' / 0,020mm',            NULL),
('Registrador Gráfico',         'REG',  '-200–1260°C',                        '3 meses',  '6,7°C',                       NULL),
('Relógio Apalpador',           'RA',   '0–0,8 / 0–1,5mm',                   '12 meses', '0,07mm',                      NULL),
('Relógio Comparador',          'RC',   '0–0,25" / 0–10mm',                  '12 meses', '0,07mm',                      NULL),
('Rugosímetro',                 'RUG',  '0–350µm / 0–12,7mm',                '12/60 meses','0,13µm / 0,007mm',          NULL),
('Súbito',                      'SUB',  'Diversas faixas',                    '12 meses', '0,007mm',                     NULL),
('Transferidor de Grau',        'TGR',  '0–180°',                             '12 meses', '0°15''00"',                   NULL),
('Teodolito DGT10',             'TDL',  '0–360°',                             '18 meses', '0,7°',                        NULL),
('Termo-higrômetro',            'TER',  '0–50°C / 5–95%UR',                  '12 meses', '2°C / 6,7%UR',                NULL),
('Termômetro Infravermelho',    'TI',   '-30–550°C',                          '12 meses', '5°C',                         NULL),
('Termômetro Digital',          'PIR',  '0–1300°C',                           '12 meses', '2°C',                         NULL),
('Termopar',                    'TP',   '-270–1260°C',                        '3 meses',  '6,7°C',                       NULL),
('Torquímetro',                 'TOQ',  '200–1000 Nm',                        '12 meses', '4% da leitura',               NULL),
('Transferidor de Ângulo',      'TA',   '0–180°',                             '12 meses', '0,7°',                        NULL),
('Trena',                       'TR',   '0–5M / 0–8M / 0–30M',               '12 meses', '1,3mm',                       NULL),
('Tubo Decantador',             'TD',   '0–100mL',                            '12 meses', '±0,2mL',                      NULL),
('YOKE',                        'YO',   '0–5500g',                            '12 meses', '±0,2g',                       NULL);

-- ============================================================
-- FIM DO SCHEMA
-- Próximo passo: importe o CSV via Dashboard > Table Editor
-- ============================================================
