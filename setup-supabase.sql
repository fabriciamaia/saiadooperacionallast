-- =====================================================================
-- SAIA DO OPERACIONAL :: SCHEMA SUPABASE
-- =====================================================================
-- COMO USAR:
-- 1. Crie uma conta grátis em https://supabase.com
-- 2. Crie um projeto novo (escolha região "South America (São Paulo)")
-- 3. Quando o projeto subir, vá em "SQL Editor" no menu lateral
-- 4. Cole TODO esse arquivo e clique "Run"
-- 5. Vá em "Settings → API" e copie:
--    - Project URL (algo tipo https://abcd1234.supabase.co)
--    - anon public key (começa com eyJ...)
-- 6. Cole essas duas chaves no arquivo supabase-config.js
-- =====================================================================

-- TABELA 1 :: PERFIS DAS USUÁRIAS
-- Cada usuária que cria conta tem uma linha aqui
CREATE TABLE IF NOT EXISTS perfis (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  especialidade TEXT,
  fase TEXT, -- expansao, evolucao, nova-fase (Fa atribui depois)
  is_admin BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- TABELA 2 :: ESTADO DA FERRAMENTA POR USUÁRIA
-- Cada usuária tem 1 linha com TODO o estado dela em JSON
-- (rows, área selecionada, etc.)
CREATE TABLE IF NOT EXISTS estado_ferramenta (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  estado JSONB NOT NULL DEFAULT '{"rows":[],"selectedArea":"","areasFinalizadas":[]}'::JSONB,
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- TABELA 3 :: LOG DE ACOMPANHAMENTO
-- Registros que a usuária faz na página de gestão diária
-- (status, observação, data)
CREATE TABLE IF NOT EXISTS log_acompanhamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  row_id TEXT NOT NULL, -- id da atividade dentro do estado JSON
  status TEXT, -- "rodou bem", "preciso ajustar", "voltou pra mim", "concluído"
  observacao TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_log_user ON log_acompanhamento(user_id);
CREATE INDEX IF NOT EXISTS idx_log_row ON log_acompanhamento(row_id);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) — IMPORTANTE
-- Sem isso, qualquer usuária consegue ver dados das outras
-- =====================================================================

ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE estado_ferramenta ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_acompanhamento ENABLE ROW LEVEL SECURITY;

-- POLICIES :: PERFIS
-- usuária vê e edita só o próprio perfil
CREATE POLICY "perfis_select_own" ON perfis
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "perfis_insert_own" ON perfis
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "perfis_update_own" ON perfis
  FOR UPDATE USING (auth.uid() = id);

-- admin vê todos os perfis
CREATE POLICY "perfis_admin_all" ON perfis
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM perfis p WHERE p.id = auth.uid() AND p.is_admin = TRUE)
  );

-- POLICIES :: ESTADO_FERRAMENTA
CREATE POLICY "estado_select_own" ON estado_ferramenta
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "estado_insert_own" ON estado_ferramenta
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "estado_update_own" ON estado_ferramenta
  FOR UPDATE USING (auth.uid() = user_id);

-- admin vê todos os estados
CREATE POLICY "estado_admin_all" ON estado_ferramenta
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM perfis p WHERE p.id = auth.uid() AND p.is_admin = TRUE)
  );

-- POLICIES :: LOG_ACOMPANHAMENTO
CREATE POLICY "log_select_own" ON log_acompanhamento
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "log_insert_own" ON log_acompanhamento
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "log_update_own" ON log_acompanhamento
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "log_delete_own" ON log_acompanhamento
  FOR DELETE USING (auth.uid() = user_id);

-- admin vê todos os logs
CREATE POLICY "log_admin_all" ON log_acompanhamento
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM perfis p WHERE p.id = auth.uid() AND p.is_admin = TRUE)
  );

-- =====================================================================
-- TRIGGER :: criar perfil automaticamente quando usuária faz signup
-- =====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfis (id, nome, email, especialidade)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'especialidade'
  );

  INSERT INTO public.estado_ferramenta (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- COMO TE TORNAR ADMIN (FA)
-- Depois que VOCÊ criar SUA conta normalmente pelo cadastro,
-- volte aqui e rode esse comando trocando seu-email pelo email real:
--
-- UPDATE perfis SET is_admin = TRUE WHERE email = 'seu-email@dominio.com';
-- =====================================================================
