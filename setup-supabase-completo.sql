-- SCRIPT COMPLETO PARA CONFIGURAÇÃO DO SUPABASE DO ZERO

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
  invite_code TEXT,
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

-- Tabela para solicitações de amizade
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE (sender_id, receiver_id)
);

-- Tabela de amigos
CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE (user_id, friend_id)
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  related_id TEXT,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Inserir configurações padrão para drafts
INSERT INTO draft_settings (max_picks, max_bans, max_pre_bans, point_limit)
VALUES (6, 3, 3, 1500)
ON CONFLICT DO NOTHING;

-- Configurar políticas de segurança (RLS)
-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read any profile" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can read profiles" ON profiles FOR SELECT USING (true);

-- Drafts
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
CREATE POLICY "Players can insert drafts" ON drafts 
  FOR INSERT WITH CHECK (
    (player1->'id')::TEXT LIKE '%' || auth.uid()::TEXT || '%'
  );

-- Draft Details
ALTER TABLE draft_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read draft details" ON draft_details FOR SELECT USING (true);
CREATE POLICY "Players can update their draft details" ON draft_details 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM drafts 
      WHERE drafts.id = draft_details.draft_id AND (
        (player1->'id')::TEXT LIKE '%' || auth.uid()::TEXT || '%' OR 
        (player2->'id')::TEXT LIKE '%' || auth.uid()::TEXT || '%'
      )
    )
  );
CREATE POLICY "Players can insert draft details" ON draft_details 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM drafts 
      WHERE drafts.id = draft_details.draft_id AND 
      (player1->'id')::TEXT LIKE '%' || auth.uid()::TEXT || '%'
    )
  );

-- Draft Settings
ALTER TABLE draft_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read draft settings" ON draft_settings FOR SELECT USING (true);

-- Friends
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their friends" ON friends 
  FOR SELECT USING (
    user_id = auth.uid() OR 
    friend_id = auth.uid()
  );
CREATE POLICY "Users can insert their friends" ON friends 
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );
CREATE POLICY "Users can delete their friends" ON friends 
  FOR DELETE USING (
    user_id = auth.uid() OR 
    friend_id = auth.uid()
  );

-- Friend Requests
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their friend requests" ON friend_requests 
  FOR SELECT USING (
    sender_id = auth.uid() OR 
    receiver_id = auth.uid()
  );
CREATE POLICY "Users can insert friend requests" ON friend_requests 
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
  );
CREATE POLICY "Users can update their friend requests" ON friend_requests 
  FOR UPDATE USING (
    receiver_id = auth.uid()
  );
CREATE POLICY "Users can delete their friend requests" ON friend_requests 
  FOR DELETE USING (
    sender_id = auth.uid() OR 
    receiver_id = auth.uid()
  );

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their notifications" ON notifications 
  FOR SELECT USING (
    user_id = auth.uid()
  );
CREATE POLICY "Users can update their notifications" ON notifications 
  FOR UPDATE USING (
    user_id = auth.uid()
  );
CREATE POLICY "Users can insert notifications" ON notifications 
  FOR INSERT WITH CHECK (
    user_id <> auth.uid() AND
    sender_id = auth.uid()
  );
CREATE POLICY "Users can delete their notifications" ON notifications 
  FOR DELETE USING (
    user_id = auth.uid()
  );

-- Adicionar comentários às colunas importantes para ajudar com o cache do Supabase
COMMENT ON COLUMN drafts.current_pick IS 'Índice do pick atual no draft';
COMMENT ON COLUMN drafts.max_picks IS 'Número máximo de picks permitidos';
COMMENT ON COLUMN drafts.max_bans IS 'Número máximo de bans permitidos';

-- Fim do script 