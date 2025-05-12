-- Ativar extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela de perfis para armazenar dados adicionais do usuário
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  player_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar função para criar um perfil automaticamente ao criar um usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, player_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    UPPER(SUBSTRING(MD5(NEW.email) FROM 1 FOR 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil ao criar usuário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tabela de drafts
CREATE TABLE IF NOT EXISTS drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phase TEXT NOT NULL,
  turn TEXT NOT NULL,
  player1 JSONB NOT NULL,
  player2 JSONB NOT NULL,
  prebans JSONB DEFAULT '[]'::jsonb NOT NULL,
  picks JSONB DEFAULT '{"player1":[],"player2":[]}'::jsonb NOT NULL,
  current_pick INTEGER DEFAULT 0 NOT NULL,
  max_picks INTEGER DEFAULT 6 NOT NULL,
  max_bans INTEGER DEFAULT 3 NOT NULL,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  winner TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela de detalhes dos drafts
CREATE TABLE IF NOT EXISTS draft_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draft_id UUID REFERENCES drafts(id) ON DELETE CASCADE,
  player1_deck_id TEXT,
  player2_deck_id TEXT,
  status TEXT DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabela para configurações de draft
CREATE TABLE IF NOT EXISTS draft_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  max_picks INTEGER DEFAULT 6 NOT NULL,
  max_bans INTEGER DEFAULT 3 NOT NULL,
  max_pre_bans INTEGER DEFAULT 3 NOT NULL,
  point_limit INTEGER DEFAULT 1500 NOT NULL,
  character_costs JSONB DEFAULT '{}'::jsonb NOT NULL,
  weapon_costs JSONB DEFAULT '{}'::jsonb NOT NULL,
  constellation_multipliers JSONB DEFAULT '{"0":1.0,"1":1.1,"2":1.2,"3":1.3,"4":1.4,"5":1.5,"6":1.6}'::jsonb NOT NULL,
  refinement_multipliers JSONB DEFAULT '{"1":1.0,"2":1.1,"3":1.2,"4":1.3,"5":1.4}'::jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Adicionar política RLS para permitir acesso aos próprios dados
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read any profile" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Permitir acesso anônimo para verificar IDs de jogadores
CREATE POLICY "Anyone can read profiles" ON profiles FOR SELECT USING (true);

-- Configurar segurança para drafts
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players can read their drafts" ON drafts 
  FOR SELECT USING (
    (player1->'id')::TEXT LIKE '%' || auth.uid()::TEXT || '%' OR 
    (player2->'id')::TEXT LIKE '%' || auth.uid()::TEXT || '%'
  );
CREATE POLICY "Players can update their drafts" ON drafts 
  FOR UPDATE USING (
    (player1->'id')::TEXT LIKE '%' || auth.uid()::TEXT || '%' OR 
    (player2->'id')::TEXT LIKE '%' || auth.uid()::TEXT || '%'
  );
CREATE POLICY "Authenticated users can create drafts" ON drafts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Configurar segurança para detalhes de draft
ALTER TABLE draft_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read draft details" ON draft_details FOR SELECT USING (true);
CREATE POLICY "Users can update their draft details" ON draft_details 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM drafts 
      WHERE drafts.id = draft_details.draft_id AND 
      ((player1->'id')::TEXT LIKE '%' || auth.uid()::TEXT || '%' OR 
       (player2->'id')::TEXT LIKE '%' || auth.uid()::TEXT || '%')
    )
  );
CREATE POLICY "Authenticated users can create draft details" ON draft_details FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Adicionar configuração padrão
INSERT INTO draft_settings (id) VALUES (uuid_generate_v4()) ON CONFLICT DO NOTHING;

-- Função para atualizar o timestamp de atualização
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adicionar triggers para atualizar o timestamp
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drafts_updated_at
  BEFORE UPDATE ON drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_draft_details_updated_at
  BEFORE UPDATE ON draft_details
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_draft_settings_updated_at
  BEFORE UPDATE ON draft_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 