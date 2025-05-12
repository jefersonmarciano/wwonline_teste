# Configuração de Variáveis de Ambiente

Este projeto requer algumas variáveis de ambiente para funcionar corretamente, especialmente para a integração com o Supabase.

## Variáveis Obrigatórias

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```
# URL e chave do Supabase (substitua pelos valores reais do seu projeto)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-key-do-supabase

# Variáveis adicionais do aplicativo
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Como Obter os Valores do Supabase

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para **Configurações do Projeto** > **API**
4. Copie a URL na seção **URL do Projeto**
5. Copie a chave anônima na seção **anon key**

## Em Ambiente de Desenvolvimento

Em desenvolvimento, se você não tiver as variáveis de ambiente configuradas, o middleware permitirá a navegação sem verificação de autenticação. Entretanto, recursos que dependem do Supabase não funcionarão.

## Em Ambiente de Produção

Em produção, **é essencial** que você configure corretamente estas variáveis de ambiente, caso contrário, a aplicação não funcionará.

### Configuração no Vercel

Se estiver hospedando no Vercel:

1. Vá para o seu projeto no painel do Vercel
2. Navegue até **Settings** > **Environment Variables**
3. Adicione as variáveis de ambiente listadas acima

### Configuração em Outras Plataformas

Para outras plataformas de hospedagem, consulte a documentação específica sobre como configurar variáveis de ambiente. 