# FX Control — Setup Guide

## 1. Supabase Setup

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto nuevo
2. En el SQL Editor, ejecuta en orden:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/003_expenses.sql`
3. Copia las credenciales: Project URL y anon public key

## 2. Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

## 3. Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 4. Deploy en Vercel

1. Conecta el repositorio en [vercel.com](https://vercel.com)
2. Agrega las variables de entorno en el dashboard de Vercel
3. Deploy automático en cada push

## Estructura del proyecto

```
src/
├── app/
│   ├── (app)/              # Rutas protegidas (requieren auth)
│   │   ├── dashboard/      # Dashboard con estadísticas
│   │   ├── clients/        # Gestión de clientes
│   │   └── transactions/   # Registro de compras
│   ├── auth/               # Login / Register
│   └── layout.tsx
├── components/
│   ├── auth/               # Formularios de autenticación
│   ├── clients/            # Componentes de clientes
│   ├── dashboard/          # Cards de estadísticas
│   ├── layout/             # Sidebar y topbar
│   ├── transactions/       # Formularios de transacciones
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── actions/            # Server Actions (auth, clients, transactions)
│   └── supabase/           # Clientes de Supabase (client, server, middleware)
└── types/                  # TypeScript types
```

## Flujo de uso

1. **Registro** → Crea tu cuenta
2. **Clientes** → Agrega los clientes que te venden divisas
3. **Transacciones** → Registra cada compra:
   - Selecciona cliente
   - Indica monto (ej: 50 USD)
   - Tasa de compra (lo que pagas, ej: 550)
   - Tasa de mercado (referencia, ej: 600)
   - El sistema calcula la ganancia automáticamente
4. **Marcar entregado** → Cuando el cliente entrega los billetes
5. **Dashboard** → Ve tus estadísticas diarias, semanales y mensuales
