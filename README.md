# Heritage Housing - Unified Web Platform

Plataforma web unificada para Heritage Housing que incluye:

- **Alquileres vacacionales**: Listado de propiedades, detalle, calendario de disponibilidad y flujo de reserva con Stripe
- **Remodelaciones**: Portfolio de proyectos con before/after y formulario de contacto
- **Admin Dashboard**: Gestión de reservas, propiedades, calendario unificado y proyectos

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- PostgreSQL (Supabase) + Prisma
- Clerk (auth admin)
- Stripe (pagos)
- Resend (emails)
- iCal sync (Airbnb/Booking)

## Getting Started

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

3. Generar cliente Prisma:
```bash
npm run db:generate
```

4. Aplicar migraciones:
```bash
npm run db:push
```

5. Iniciar desarrollo:
```bash
npm run dev
```

## Estructura del Proyecto

```
/app
  /(public)/           # Páginas públicas
    page.tsx           # Landing
    /alquileres        # Propiedades
    /remodelaciones    # Portfolio
  /(admin)/            # Dashboard admin (Clerk)
    /admin
/components
  /ui                  # shadcn/ui
  /property            # Cards, gallery
  /booking             # Booking flow
  /calendar            # Calendars
  /renovation          # Projects, sliders
  /shared              # Navbar, Footer, WhatsApp
/lib
  /services            # Lógica de negocio
  /repositories        # Acceso a datos
  /validations         # Zod schemas
/prisma
  schema.prisma        # Modelo de datos
```

## API Routes

- `POST /api/stripe/checkout` - Crear sesión de pago
- `POST /api/stripe/webhook` - Webhook de Stripe
- `GET /api/ical/[propertyId]` - Exportar iCal
- `POST /api/sync/ical` - Sincronizar iCal (cron)
- `POST /api/leads` - Guardar lead

## Variables de Entorno

Ver `.env.example` para todas las variables requeridas.
