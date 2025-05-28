import { createClient } from '@supabase/supabase-js';

// Certifique-se de que as variáveis de ambiente estão definidas para evitar erros
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Verificar variáveis de ambiente
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Variáveis de ambiente do Supabase não configuradas corretamente');
}

// Configurações adicionais de segurança e CORS
const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    // Definir um tipo de fluxo válido para auth
    flowType: 'implicit' as const
  },
  global: {
    headers: {
      'X-Client-Info': 'next-js-client/1.0.0',
    }
  },
  // Adicionar configuração para aumentar o timeout nas requisições
  fetch: (url: string, options: RequestInit = {}) => {
    // Aumentar timeout de resposta para 30 segundos para evitar falhas em redes lentas
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), 30000);
    
    return fetch(url, {
      ...options,
      signal: timeoutController.signal,
      credentials: 'include', // Importante para cookies
    }).finally(() => clearTimeout(timeoutId));
  }
};

// Criar cliente do Supabase com opções adicionais
export const supabase = createClient(supabaseUrl, supabaseAnonKey, options);

// Logs de depuração para requisições
console.log('🔄 Cliente Supabase inicializado com URL:', supabaseUrl ? `${supabaseUrl.substring(0, 15)}...` : 'não definida');

// Função para recuperar o usuário atual
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('❌ Erro ao obter usuário atual:', error);
    return null;
  }
};

// Função para verificar se o usuário está autenticado
export const isUserAuthenticated = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('❌ Erro ao verificar autenticação:', error);
    return false;
  }
};

// Função para fazer login com email e senha
export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log("Tentando fazer login com email:", email);
    
    // Limpar cookies antes do login para evitar problemas
    if (typeof document !== "undefined") {
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    }
    
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (response.error) {
      console.error("Erro do Supabase:", response.error);
    } else {
      console.log("Login bem-sucedido, sessão:", !!response.data.session);
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
      
      // Verificar se precisamos criar um perfil manualmente
      if (response.data.user) {
        try {
          // Verificar se já existe um perfil
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', response.data.user.id)
            .single();
            
          if (!existingProfile) {
            // Criar perfil manualmente se não existir
            await supabase
              .from('profiles')
              .insert({
                id: response.data.user.id,
                name: metadata?.name || email.split('@')[0],
                email: email,
                player_id: metadata?.player_id || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            console.log("Perfil criado manualmente para o novo usuário");
          }
        } catch (profileError) {
          console.error("Erro ao verificar/criar perfil:", profileError);
        }
      }
    }
    
    return response;
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw error;
  }
};

// Função para fazer logout
export const signOut = async () => {
  try {
    const response = await supabase.auth.signOut();
    
    // Limpar cookies e storage manualmente após logout
    if (typeof document !== "undefined") {
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
    }
    
    return response;
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    throw error;
  }
};

// Função para atualizar o perfil do usuário
export const updateProfile = async (userId: string, updates: any) => {
  try {
    // Verificar se o perfil existe
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (!existingProfile) {
      // Criar perfil se não existir
      return await supabase
        .from('profiles')
        .insert({
          id: userId,
          ...updates,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }
    
    // Atualizar perfil existente
    return await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    throw error;
  }
};

// Função para recuperar o perfil do usuário
export const getProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // Perfil não encontrado, tentar criar um básico
      const user = await getCurrentUser();
      if (user) {
        await supabase
          .from('profiles')
          .insert({
            id: userId,
            name: user.email?.split('@')[0] || 'Usuário',
            email: user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        // Tentar buscar novamente após criar
        return await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
      }
    }
    
    return { data, error };
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return { data: null, error };
  }
};

// Função para fazer login com uma conta fixa para testes
export const signInForTesting = async () => {
  try {
    console.log("Tentando fazer login com a conta de teste");
    
    // Limpar cookies antes do login para evitar problemas
    if (typeof document !== "undefined") {
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    }
    
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
      
      // Assegurar que existe um perfil para o usuário de teste
      if (response.data.user) {
        await updateProfile(response.data.user.id, {
          name: 'Usuário de Teste',
          player_id: 'TEST001'
        });
      }
    }
    
    return response;
  } catch (error) {
    console.error("Erro ao fazer login de teste:", error);
    throw error;
  }
}; 