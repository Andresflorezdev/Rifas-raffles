# Rifas & Raffles Platform

Plataforma web moderna, rápida y segura para la creación, gestión y administración en tiempo real de rifas y sorteos digitales. Desarrollada con **React 19**, **TypeScript**, **Vite** y **Supabase**.

---

## Características Principales

- **Autenticación Passwordless (OTP)**: Acceso seguro mediante código de un solo uso por correo electrónico.
- **Gestión Integral de Rifas**: Creación, edición, eliminación y cambio de estados (*activa, pausada, finalizada, cancelada, archivada*).
- **Generación Automática de Números**: Al crear una rifa en base de datos, se generan automáticamente los registros de números vía triggers de PostgreSQL.
- **Doble Vista de Control**:
  - **Vista Tablero**: Cuadrícula interactiva con código visual por colores (*disponible, apartado, pagado*).
  - **Vista Tabla**: Lista detallada estilo hoja de cálculo para visualización y edición rápida.
- **Gestión de Compradores y Ventas**: Asignación de nombres, notas y control de pagos por cada número con validaciones en tiempo real.
- **Gestión de Imágenes**: Carga optimizada a Supabase Storage con previsualizaciones, soporte para JPG/PNG/WebP y truncado responsivo.
- **Diseño Moderno & Modo Oscuro**: Tokens CSS semánticos, tema claro/oscuro persistente y arquitectura modular sin dependencias pesadas.

---

## Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript | Componentes declarativos con tipado estricto |
| **Build Tool** | Vite | Servidor de desarrollo instantáneo y bundling optimizado |
| **Routing** | React Router v7 | Rutas públicas, privadas y lazy-loading por página |
| **State Management** | Zustand | Estado global reactivo para autenticación y tema |
| **Backend & Base de Datos** | Supabase (PostgreSQL) | Autenticación, base de datos relacional, triggers y RLS |
| **Almacenamiento** | Supabase Storage | Bucket dedicado para imágenes de premios |
| **Estilos** | CSS Moderno & Custom Properties | Sistema de diseño tokenizado y modular |
| **Iconografía** | Lucide React | Iconos vectoriales consistentes y accesibles |

---

## Estructura del Proyecto

```text
Rifas-raffles/
├── src/
│   ├── components/            # Componentes reutilizables de UI
│   │   ├── raffles/           # Componentes del módulo de rifas (tablero, modales, tabla, etc.)
│   │   ├── AppHeader.tsx      # Barra superior con marca y toggle de tema
│   │   ├── ProtectedRoute.tsx # Guardián de rutas autenticadas
│   │   └── PublicOnlyRoute.tsx# Guardián para rutas públicas (login/registro)
│   ├── hooks/                 # Custom hooks (lógica de negocio desacoplada)
│   │   ├── useAuthStore.ts    # Store global de sesión
│   │   ├── useNumberEditor.ts # Lógica y validación del editor de números
│   │   ├── useProfile.ts      # Gestión y sanitización de perfil
│   │   ├── useRaffle.ts       # Detalle y operaciones de una rifa
│   │   ├── useRaffleEdit.ts   # Formulario y cambios en edición de rifa
│   │   ├── useRaffleForm.ts   # Creación y subida de imágenes de nueva rifa
│   │   └── useRaffles.ts      # Listado y métricas de rifas
│   ├── lib/                   # Clientes de terceros y utilidades base
│   │   ├── errorMessages.ts   # Normalización de errores amigables al usuario
│   │   └── supabaseClient.ts  # Inicialización del cliente Supabase
│   ├── pages/                 # Vistas principales de la aplicación
│   │   ├── Home.tsx           # Dashboard de rifas del usuario
│   │   ├── LoginRegistro.tsx  # Ingreso/registro mediante OTP
│   │   ├── MiCuenta.tsx       # Perfil del usuario autenticado
│   │   ├── RaffleDetail.tsx   # Panel de control de una rifa
│   │   ├── RaffleForm.tsx     # Creación de nueva rifa
│   │   └── VerifyCode.tsx     # Verificación del código OTP
│   ├── routes.tsx             # Configuración centralizada de rutas y Lazy Loading
│   ├── services/              # Capa de comunicación con la API / Base de datos
│   │   ├── profileService.ts  # Consultas y mutaciones de perfiles
│   │   ├── raffleNumberService.ts # Actualizaciones de números individuales
│   │   └── raffleService.ts   # CRUD de rifas y subida de imágenes
│   ├── store/                 # Stores globales (Zustand)
│   ├── styles/                # Módulos CSS segmentados por responsabilidad
│   │   ├── auth.css           # Estilos de login, registro y verificación
│   │   ├── base.css           # Reseteo y tipografía base
│   │   ├── forms.css          # Formularios generales y cuenta
│   │   ├── image-upload.css   # Tarjeta de subida y vista previa de imagen
│   │   ├── layout.css         # Shell de aplicación y grid general
│   │   ├── modals.css         # Estilos de ventanas modales
│   │   ├── raffle-detail.css  # Tablero, tabla y toolbar del detalle
│   │   ├── states.css         # Estados de carga y alertas
│   │   └── tokens.css         # Paleta de colores, sombras y radios
│   ├── types/                 # Definiciones de tipos TypeScript
│   └── App.tsx                # Entrada de componentes raíz
├── ARCHITECTURE.md            # Documento de arquitectura y decisiones técnicas
├── SUPABASE.md                # Guía de configuración, DDL, RLS y triggers de backend
└── vite.config.ts             # Configuración del empaquetador
```

---

## Instalación y Configuración Local

### 1. Prerrequisitos
- **Node.js**: v18.0.0 o superior
- **pnpm** (o npm / yarn)

### 2. Clonar e Instalar Dependencias
```bash
git clone https://github.com/Andresflorezdev/Rifas-raffles.git
cd Rifas-raffles
pnpm install
```

### 3. Configurar Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto tomando como base `.env.example`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-publica
```

> [!NOTE]
> Para la configuración completa de la base de datos, triggers y políticas RLS de Supabase, consulta la guía detallada en [SUPABASE.md](./SUPABASE.md).

### 4. Iniciar Servidor de Desarrollo
```bash
pnpm dev
```
La aplicación estará disponible en `http://localhost:5173`.

---

## Scripts Disponibles

- `pnpm dev`: Inicia el servidor de desarrollo local con Vite.
- `pnpm build`: Ejecuta la verificación de tipos con `tsc -b` y compila el bundle de producción en `dist/`.
- `pnpm preview`: Previsualiza localmente el build de producción.
- `pnpm lint`: Ejecuta ESLint para analizar el código fuente.

---

## Documentación Adicional

- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Decisiones técnicas, principios de diseño, desacoplamiento de capas y optimizaciones.
- **[SUPABASE.md](./SUPABASE.md)**: Guía metodológica para la configuración de backend, modelado de datos, políticas RLS, triggers y pruebas de verificación en Supabase.
