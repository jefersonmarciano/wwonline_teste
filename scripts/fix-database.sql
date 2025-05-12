-- Ativar extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Corrigir tabela de amigos
-- Primeiro, verificar se a tabela existe
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'friends') THEN
    -- Tabela existe, verificar estrutura
    BEGIN
      -- Tentar corrigir a tabela descartando e recriando
      DROP TABLE IF EXISTS friends CASCADE;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao tentar descartar a tabela friends: %', SQLERRM;
    END;
  END IF;
END $$;

-- Recriar a tabela friends com a estrutura correta
CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, friend_id)
);

-- Corrigir tabela de solicitações de amizade
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'friend_requests') THEN
    -- Tabela existe, verificar estrutura
    BEGIN
      -- Tentar corrigir a tabela descartando e recriando
      DROP TABLE IF EXISTS friend_requests CASCADE;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao tentar descartar a tabela friend_requests: %', SQLERRM;
    END;
  END IF;
END $$;

-- Recriar a tabela friend_requests com a estrutura correta
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(sender_id, receiver_id)
);

-- Corrigir tabela de notificações
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') THEN
    -- Tabela existe, verificar estrutura
    BEGIN
      -- Tentar corrigir a tabela descartando e recriando
      DROP TABLE IF EXISTS notifications CASCADE;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao tentar descartar a tabela notifications: %', SQLERRM;
    END;
  END IF;
END $$;

-- Recriar a tabela notifications com a estrutura correta
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  related_id TEXT,
  sender_id TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Configurar políticas de segurança para friends
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Users can read their own friends" ON friends;
DROP POLICY IF EXISTS "Users can update their own friends" ON friends;
DROP POLICY IF EXISTS "Users can delete their own friends" ON friends;
DROP POLICY IF EXISTS "Users can insert friends" ON friends;

-- Criar novas políticas
CREATE POLICY "Users can read their own friends" 
  ON friends FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can update their own friends" 
  ON friends FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own friends" 
  ON friends FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert friends" 
  ON friends FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Configurar políticas de segurança para friend_requests
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Users can read their own friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can update their own friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can delete their own friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can insert friend requests" ON friend_requests;

-- Criar novas políticas
CREATE POLICY "Users can read their own friend requests" 
  ON friend_requests FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can update their own friend requests" 
  ON friend_requests FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can delete their own friend requests" 
  ON friend_requests FOR DELETE USING (auth.uid() = sender_id);
CREATE POLICY "Users can insert friend requests" 
  ON friend_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Configurar políticas de segurança para notificações
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Users can read their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;

-- Criar novas políticas
CREATE POLICY "Users can read their own notifications" 
  ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" 
  ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notifications" 
  ON notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert notifications" 
  ON notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Função para atualizar o timestamp de atualização
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adicionar triggers para atualizar o timestamp
DROP TRIGGER IF EXISTS update_friends_updated_at ON friends;
CREATE TRIGGER update_friends_updated_at
  BEFORE UPDATE ON friends
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_friend_requests_updated_at ON friend_requests;
CREATE TRIGGER update_friend_requests_updated_at
  BEFORE UPDATE ON friend_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verificar e corrigir a tabela de drafts
ALTER TABLE IF EXISTS drafts
  RENAME COLUMN IF EXISTS "createdAt" TO created_at;

ALTER TABLE IF EXISTS drafts
  RENAME COLUMN IF EXISTS "updatedAt" TO updated_at; 