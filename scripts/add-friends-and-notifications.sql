-- Criação das tabelas para o sistema de amigos e notificações

-- Alterar a tabela de profiles para armazenar o status online
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Tabela para armazenar amizades
CREATE TABLE IF NOT EXISTS friends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- Índices para melhorar a performance de consultas em amizades
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);

-- Tabela para solicitações de amizade
CREATE TABLE IF NOT EXISTS friend_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

-- Índices para melhorar a performance de consultas em solicitações de amizade
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender_id ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver_id ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);

-- Tabela para notificações
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('draft_invite', 'friend_request', 'friend_accepted', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    related_id TEXT,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted BOOLEAN DEFAULT FALSE
);

-- Índices para melhorar a performance de consultas em notificações
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Função para atualizar o timestamp de last_active sempre que o usuário fizer login
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET last_active = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o timestamp de last_active quando um usuário fizer login
DROP TRIGGER IF EXISTS trigger_update_last_active ON auth.users;
CREATE TRIGGER trigger_update_last_active
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION update_last_active();

-- Função para criar uma notificação de solicitação de amizade
CREATE OR REPLACE FUNCTION create_friend_request_notification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'pending' THEN
        -- Notificação para o destinatário da solicitação
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            action_url,
            related_id,
            sender_id,
            read,
            created_at
        ) VALUES (
            NEW.receiver_id,
            'friend_request',
            'Nova Solicitação de Amizade',
            (SELECT name FROM profiles WHERE id = NEW.sender_id) || ' quer ser seu amigo.',
            '/friends',
            NEW.id,
            NEW.sender_id,
            FALSE,
            NOW()
        );
    ELSIF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
        -- Notificação para o remetente quando a solicitação for aceita
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            action_url,
            related_id,
            sender_id,
            read,
            created_at
        ) VALUES (
            NEW.sender_id,
            'friend_accepted',
            'Solicitação de Amizade Aceita',
            (SELECT name FROM profiles WHERE id = NEW.receiver_id) || ' aceitou sua solicitação de amizade.',
            '/friends',
            NEW.id,
            NEW.receiver_id,
            FALSE,
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar notificações de solicitação de amizade
DROP TRIGGER IF EXISTS trigger_friend_request_notification ON friend_requests;
CREATE TRIGGER trigger_friend_request_notification
AFTER INSERT OR UPDATE OF status ON friend_requests
FOR EACH ROW
EXECUTE FUNCTION create_friend_request_notification();

-- Permissões RLS

-- Permissões para a tabela friends
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias amizades"
ON friends FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem adicionar amigos"
ON friends FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem remover suas próprias amizades"
ON friends FOR DELETE
USING (auth.uid() = user_id);

-- Permissões para a tabela friend_requests
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver solicitações enviadas ou recebidas"
ON friend_requests FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Usuários podem enviar solicitações"
ON friend_requests FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Remetentes podem cancelar solicitações"
ON friend_requests FOR DELETE
USING (auth.uid() = sender_id);

CREATE POLICY "Destinatários podem atualizar o status da solicitação"
ON friend_requests FOR UPDATE
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);

-- Permissões para a tabela notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias notificações"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem marcar suas notificações como lidas"
ON notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Qualquer usuário autenticado pode criar notificações"
ON notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem excluir suas próprias notificações"
ON notifications FOR DELETE
USING (auth.uid() = user_id); 