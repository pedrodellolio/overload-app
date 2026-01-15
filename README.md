# Overload - Rastreador de Treinos
<img width="430" height="720" alt="image" src="https://github.com/user-attachments/assets/311b6b99-8553-4ede-acd7-3d0622ce7f29" />
<img width="430" height="720" alt="image" src="https://github.com/user-attachments/assets/f68edfb3-d47b-4469-8c30-3c9414f8619f" />

## Visao Geral

O **Overload** é uma aplicação web progressiva (PWA) para rastreamento de treinos de musculação. Permite criar rotinas personalizadas, registrar sessões de treino com cargas e acompanhar sua evolução através de gráficos e estatísticas detalhadas.

**Demo:** [https://overload-workout-app.vercel.app](https://overload-workout-app.vercel.app)

## Funcionalidades

- Gestão de treinos personalizados
- Registro de sessões com data, cargas (kg) e anotações
- Lista de exercícios predefinidos por grupo muscular
- Personal Records (PRs) - maiores cargas por exercício
- Heatmap de frequência de treinos (estilo GitHub)
- Gráficos de evolução de cargas
- Histórico de sessões de treino
- Autenticação com Google OAuth
- PWA - instalável em dispositivos móveis e desktop

## Stack

- **Framework:** React 19 + Vite
- **Linguagem:** TypeScript
- **Estilização:** TailwindCSS 4 + DaisyUI
- **Backend:** Supabase (PostgreSQL + Auth)
- **Estado/Cache:** TanStack Query
- **Formulários:** React Hook Form + Zod
- **Gráficos:** Recharts
- **Roteamento:** Wouter
- **Icones:** Lucide React
- **PWA:** vite-plugin-pwa

## Primeiros Passos

**Passos de instalação:**

1. Clone o repositorio: `git clone https://github.com/pedrodellolio/overload-app.git`
2. Instale as dependencias: `pnpm install`
3. Configure as variaveis de ambiente em `.env.local`:
   ```
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica
   ```
4. Execute o script `supabase-schema.sql` no SQL Editor do Supabase
5. Inicie o servidor de desenvolvimento: `pnpm run dev`
