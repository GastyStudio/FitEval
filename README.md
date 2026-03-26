<div align="center">

# ⚡ FitEval

### *No hay excusas, hay datos.*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-00C7B7?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)

**Herramienta profesional para que entrenadores personales evalúen, registren y analicen el nivel físico de sus clientes — y generen reportes PDF en segundos.**

[🚀 Ver en vivo](https://fiteval.vercel.app) · [🐛 Reportar un bug](https://github.com/gastycoriaok/fiteval/issues) · [💡 Sugerir una feature](https://github.com/gastycoriaok/fiteval/issues)

</div>

---

## 🎯 ¿Qué es FitEval?

FitEval es una **web app para entrenadores personales** que permite:

- 📋 **Registrar clientes** con sus datos físicos y objetivos
- 🏋️ **Evaluar el nivel** en tests de fuerza (peso corporal y gimnasio)
- 📊 **Calcular automáticamente** el IMC y el nivel general (principiante / intermedio / avanzado)
- ⚠️ **Detectar alertas** según lesiones o limitaciones físicas reportadas
- 📄 **Generar PDFs profesionales** con el informe completo del cliente, listos para compartir

---

## 🖼️ Vista previa

> *Evaluación completa → Informe PDF dark mode con los datos del cliente, niveles de fuerza y alertas de lesiones.*

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Next.js 16 (App Router) + React 19 |
| **Estilos** | Tailwind CSS 4 |
| **ORM** | Prisma 6 |
| **Base de datos** | PostgreSQL (Neon) |
| **Generación PDF** | jsPDF |
| **Deploy** | Vercel |

---

## ⚙️ Instalación local

### Prerrequisitos
- Node.js 18+
- Una base de datos PostgreSQL (podés usar [Neon](https://neon.tech) gratis)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/gastycoriaok/fiteval.git
cd fiteval

# 2. Instalar dependencias (genera el cliente de Prisma automáticamente)
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu DATABASE_URL
```

Crear un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://usuario:password@host/fiteval?sslmode=require"
```

```bash
# 4. Aplicar migraciones a la base de datos
npx prisma db push

# 5. Levantar el servidor de desarrollo
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en el navegador. 🎉

---

## 📁 Estructura del proyecto

```
fiteval/
├── app/
│   ├── api/
│   │   └── clients/          # Endpoints REST (GET, POST)
│   │       └── [id]/         # Endpoint por cliente (GET, DELETE)
│   ├── clients/              # Páginas de clientes
│   ├── layout.js             # Layout global
│   └── page.js               # Página principal
├── components/               # Componentes reutilizables
├── lib/
│   ├── prisma.js             # Singleton de Prisma Client
│   ├── generarPDF.js         # Lógica de generación de PDF con jsPDF
│   └── alertas.js            # Motor de alertas por lesiones
├── prisma/
│   └── schema.prisma         # Modelos: Trainer, Client, Evaluation
└── public/                   # Assets estáticos
```

---

## 🗃️ Modelos de datos

```prisma
model Trainer    { id, email, name, password, clients[] }
model Client     { id, firstName, lastName, age, sex, weight, height, objetivo, experiencia, lesiones?, evaluation }
model Evaluation { id, flexiones, sentadilla, dominadas, plancha, banca?, pesoMuerto?, nivelGeneral, imc, frecuencia }
```

---

## 🚀 Deploy en Vercel

1. Conectar el repositorio en [vercel.com](https://vercel.com)
2. Agregar la variable de entorno `DATABASE_URL` en **Settings → Environment Variables**
3. El script `postinstall` ejecuta `prisma generate` automáticamente en cada deploy

```bash
# Build command (configurado en package.json)
prisma generate && next build
```

---

## 📄 Licencia

MIT © [Gastón Coria](https://github.com/gastycoriaok) — Hecho con 🧡 en Argentina
