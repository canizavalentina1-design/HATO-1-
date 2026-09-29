# Hato

Base de Hato, sistema SaaS de gestión ganadera de carne. La primera etapa establece el esqueleto Next.js y el modelo multi-tenant de Supabase.

## Arranque

1. Copiar `.env.example` a `.env.local` y completar las credenciales de Supabase.
2. Ejecutar `npm install` y `npm run dev`.
3. Aplicar `supabase/migrations/0001_foundation.sql` en el proyecto Supabase.

La política de producto excluye completamente cualquier funcionalidad de lechería.
