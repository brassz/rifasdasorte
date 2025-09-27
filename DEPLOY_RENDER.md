# Deploy para Render - Rifas da Sorte

Este guia explica como fazer o deploy da aplicação **Rifas da Sorte** no Render.

## Pré-requisitos

1. Conta no [Render](https://render.com)
2. Repositório Git com o código da aplicação
3. Código commitado e pushado para o repositório

## Arquivos de Configuração Criados

Os seguintes arquivos foram criados/modificados para o deploy:

- `render.yaml` - Configuração do serviço Render
- `build.sh` - Script de build personalizado
- `package.json` - Scripts de build atualizados
- `prisma/schema.prisma` - Atualizado para PostgreSQL
- `src/app/api/health/route.ts` - Endpoint de health check
- `env.example` - Variáveis de ambiente atualizadas

## Passos para Deploy

### 1. Preparar o Repositório

Certifique-se de que todos os arquivos estão commitados:

```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### 2. Criar Serviço no Render

1. Acesse o [Render Dashboard](https://dashboard.render.com)
2. Clique em "New +" → "Blueprint"
3. Conecte seu repositório Git
4. O Render detectará automaticamente o arquivo `render.yaml`

### 3. Configurar Variáveis de Ambiente

As seguintes variáveis serão configuradas automaticamente pelo `render.yaml`:

- `NODE_ENV` - Será definido como "production"
- `DATABASE_URL` - Será conectado automaticamente ao PostgreSQL
- `NEXTAUTH_SECRET` - Será gerado automaticamente
- `NEXTAUTH_URL` - Você precisará definir manualmente

**Variáveis que você precisa configurar manualmente:**

1. No dashboard do Render, vá para seu serviço web
2. Clique na aba "Environment"
3. Adicione as seguintes variáveis:

```
NEXTAUTH_URL=https://seu-app-name.onrender.com
GOOGLE_CLIENT_ID=seu-google-client-id (opcional)
GOOGLE_CLIENT_SECRET=seu-google-client-secret (opcional)
STRIPE_PUBLISHABLE_KEY=sua-stripe-publishable-key (opcional)
STRIPE_SECRET_KEY=sua-stripe-secret-key (opcional)
STRIPE_WEBHOOK_SECRET=seu-stripe-webhook-secret (opcional)
```

### 4. Deploy

1. Após configurar as variáveis, clique em "Create Blueprint"
2. O Render criará automaticamente:
   - Um serviço web (Next.js app)
   - Um banco PostgreSQL
3. O deploy iniciará automaticamente

### 5. Verificar o Deploy

- Acesse a URL fornecida pelo Render
- Verifique o health check em: `https://seu-app.onrender.com/api/health`
- Teste as funcionalidades principais da aplicação

## Estrutura dos Serviços

### Web Service
- **Runtime:** Node.js
- **Build Command:** `npm ci && npm run build`
- **Start Command:** `npm start`
- **Health Check:** `/api/health`

### Database
- **Tipo:** PostgreSQL
- **Plano:** Starter (gratuito)
- **Conexão:** Automática via `DATABASE_URL`

## Troubleshooting

### Problemas Comuns

1. **Erro de build do Prisma:**
   - Verifique se `postinstall` está no package.json
   - Certifique-se que `DATABASE_URL` está configurada

2. **Erro de autenticação NextAuth:**
   - Verifique se `NEXTAUTH_URL` está correto
   - Certifique-se que `NEXTAUTH_SECRET` foi gerado

3. **Erro de conexão com banco:**
   - Verifique se o serviço PostgreSQL foi criado
   - Confirme que `DATABASE_URL` está sendo injetada automaticamente

### Logs

Para verificar logs:
1. Vá para o dashboard do Render
2. Selecione seu serviço
3. Clique na aba "Logs"

## Custos

- **Web Service:** Gratuito (com limitações)
- **PostgreSQL:** Gratuito (90 dias, depois $7/mês)
- **Bandwidth:** 100GB/mês grátis

## Atualizações

Para fazer updates:
1. Faça push das mudanças para o repositório
2. O Render fará deploy automático da branch main

## Backup

Configure backups regulares do PostgreSQL:
1. Vá para o serviço de banco
2. Configure backup automático nas configurações

---

**Nota:** Este setup é otimizado para desenvolvimento e aplicações pequenas. Para produção com alto tráfego, considere planos pagos e configurações adicionais de segurança.