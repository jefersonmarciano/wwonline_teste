import { createClient } from '@supabase/supabase-js';

// É necessário substituir estas variáveis pelas suas credenciais reais do Supabase
const supabaseUrl = 'https://tpiohzdsxmovyxpfzamt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwaW9oemRzeG1vdnl4cGZ6YW10Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTQzNDMwMywiZXhwIjoyMDYxMDEwMzAzfQ.DrB2D8EqkUEB7ktaPNfNp8S_jewfzuNO8P01eB9Aa2M';

// Criar cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para recuperar o usuário atual
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Função para verificar se o usuário está autenticado
export const isUserAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

// Função para fazer login com email e senha
export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log("Tentando fazer login com email:", email);
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (response.error) {
      console.error("Erro do Supabase:", response.error);
    }
    
    return response;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    throw error;
  }
};

// Função para criar um novo usuário
export const signUpWithEmail = async (email: string, password: string, metadata?: any) => {
  try {
    console.log("Tentando criar usuário com email:", email);
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    
    if (response.error) {
      console.error("Erro do Supabase ao criar usuário:", response.error);
    } else {
      console.log("Usuário criado com sucesso:", response.data);
    }
    
    return response;
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw error;
  }
};

// Função para fazer logout
export const signOut = async () => {
  return await supabase.auth.signOut();
};

// Função para atualizar o perfil do usuário
export const updateProfile = async (userId: string, updates: any) => {
  return await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
};

// Função para recuperar o perfil do usuário
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { data, error };
};

// Função para fazer login com uma conta fixa para testes
export const signInForTesting = async () => {
  try {
    console.log("Tentando fazer login com a conta de teste");
    
    // Primeiro tenta criar o usuário de teste (se não existir)
    await supabase.auth.signUp({
      email: 'teste@example.com',
      password: 'Teste@123',
      options: {
        data: { name: 'Usuário de Teste' }
      }
    });
    
    // Agora tenta fazer login com as credenciais
    const response = await supabase.auth.signInWithPassword({
      email: 'teste@example.com',
      password: 'Teste@123',
    });
    
    if (response.error) {
      console.error("Erro ao fazer login de teste:", response.error);
    } else {
      console.log("Login de teste bem-sucedido");
    }
    
    return response;
  } catch (error) {
    console.error("Erro ao fazer login de teste:", error);
    throw error;
  }
}; 