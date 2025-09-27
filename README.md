# Rifas da Sorte

Sistema completo de rifas online com painel administrativo, sistema de compra de números, pacotes promocionais e seleção de vencedores.

## 🚀 Funcionalidades

### Para Usuários
- ✅ Cadastro e autenticação
- ✅ Visualização de rifas ativas
- ✅ Compra de números individuais
- ✅ Compra de pacotes promocionais
- ✅ Dashboard pessoal
- ✅ Histórico de compras

### Para Administradores
- ✅ Painel administrativo completo
- ✅ Criação de rifas personalizadas
- ✅ Configuração de pacotes promocionais
- ✅ Gerenciamento de números
- ✅ Seleção de vencedores (aleatória ou manual)
- ✅ Estatísticas e relatórios
- ✅ Controle de status das rifas

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Banco de Dados**: SQLite com Prisma ORM
- **Autenticação**: NextAuth.js
- **UI Components**: Radix UI
- **Ícones**: Lucide React

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd rifasdasorte
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

4. Configure o banco de dados:
```bash
npm run db:push
npm run db:generate
```

5. Execute o projeto:
```bash
npm run dev
```

O sistema estará disponível em `http://localhost:3000`

## 🎯 Como Usar

### Primeiro Acesso (Admin)
1. Acesse `/auth/signup` e crie uma conta
2. No banco de dados, altere o campo `role` para `ADMIN` na tabela `User`
3. Acesse `/admin` para gerenciar o sistema

### Criando uma Rifa
1. Faça login como admin
2. Acesse "Nova Rifa"
3. Preencha as informações básicas
4. Configure os pacotes promocionais (opcional)
5. Salve a rifa

### Participando de uma Rifa
1. Faça login como usuário
2. Escolha uma rifa ativa
3. Selecione os números desejados
4. Complete o pagamento
5. Aguarde o sorteio

### Definindo o Vencedor
1. Como admin, acesse a rifa
2. Clique em "Definir Vencedor"
3. Escolha entre seleção aleatória ou manual
4. Confirme o vencedor

## 🏗️ Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── admin/             # Painel administrativo
│   ├── api/               # API Routes
│   ├── auth/              # Páginas de autenticação
│   ├── dashboard/         # Dashboard do usuário
│   ├── purchase/          # Páginas de compra
│   └── raffle/            # Páginas de rifas
├── components/            # Componentes reutilizáveis
│   └── ui/               # Componentes de UI
├── lib/                   # Utilitários e configurações
└── types/                 # Definições de tipos
```

## 🔧 Configurações Avançadas

### Integração com Pagamentos
O sistema está preparado para integração com provedores de pagamento como Stripe, PayPal, etc. Atualmente, o pagamento é simulado para demonstração.

### Personalização
- Cores e temas podem ser alterados em `tailwind.config.js`
- Componentes de UI podem ser customizados em `src/components/ui/`
- Estilos globais em `src/app/globals.css`

## 📊 Banco de Dados

O sistema utiliza as seguintes entidades principais:
- **User**: Usuários do sistema
- **Raffle**: Rifas criadas
- **RaffleNumber**: Números das rifas
- **Package**: Pacotes promocionais
- **Purchase**: Compras realizadas

## 🚀 Deploy

Para fazer deploy em produção:

1. Configure as variáveis de ambiente de produção
2. Configure um banco de dados PostgreSQL ou MySQL
3. Execute as migrações do Prisma
4. Faça deploy em plataformas como Vercel, Netlify, etc.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🆘 Suporte

Para suporte, entre em contato através dos issues do GitHub ou email.

---

Desenvolvido com ❤️ para facilitar a criação e gerenciamento de rifas online.