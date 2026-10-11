# cecymethod.com

Página de Cecilia Rivera, nutrióloga (@cecy.method): página de inicio pública, acceso de pacientes por correo (sin contraseña) y consultorio privado.

- **Inicio** (`/`): quién es, cómo trabaja, precios, preguntas y contacto. Es el enlace de Instagram.
- **Pacientes** (`/entrar`, `/mi-plan`): su día, su semana, porciones y equivalentes, su rutina con videos y su avance. Solo ven lo que Cecy activa.
- **Consultorio** (`/consultorio`): pacientes, historia clínica (solo Cecy), análisis, mediciones, plan de alimentación, rutina, seguimientos y biblioteca de videos.

## Tecnología

Next.js 15 (Vercel) + Supabase (Postgres, inicio de sesión por correo, almacenamiento de videos). Las reglas de privacidad viven en la base de datos (Row Level Security, `supabase/migrations/0001_init.sql`): cada paciente solo puede leer su propia fila, su plan si está visible y su rutina si está visible; la historia clínica (`patient_private`) y los seguimientos solo los lee la nutrióloga (`app_admins`).

## Puesta en marcha

1. **Supabase**: crear proyecto en región UE (Frankfurt). En SQL Editor correr `supabase/migrations/0001_init.sql` y luego `supabase/seed.sql`.
2. **Supabase > Authentication**:
   - Providers > Email: activar; desactivar "Allow new users to sign up" (solo Cecy da de alta).
   - URL Configuration: Site URL `https://cecymethod.com`; Redirect URLs `https://cecymethod.com/**`.
   - Email Templates: pegar `supabase/templates/magic-link.html` e `invite.html`.
   - SMTP propio (recomendado, el de Supabase tiene límite bajo de correos): p. ej. Resend con el dominio.
3. **Vercel**: importar el repositorio y poner las variables de `.env.example`.
4. **Dominio**: apuntar cecymethod.com a Vercel.
5. Cecy entra en `/entrar` con `cecilia.nutdxb@gmail.com` (está en `app_admins`). La primera vez hay que crear su usuario en Supabase > Authentication > Users > Invite.

## Desarrollo

```bash
npm install
cp .env.example .env.local   # llenar
npm run dev
npm run typecheck
npx tsx scripts/seed-sql.ts  # regenera supabase/seed.sql si cambia la guía de glúteos
```

## Planes que prepara Claude

El editor de plan acepta pegar un JSON con la forma de `Plan` (`lib/types.ts`): `titulo, inicio, proxima_revision, objetivo, kcal, proteina, horarios[5], enfoques[], porciones{grupo: [5]}, menu{Lunes..Sábado: [5 × {titulo, detalle}]}, domingo, suplementos[], tips[]`.
