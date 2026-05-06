# Agente Estimador de Copago y Cobertura para Pacientes

Sistema fullstack para estimar copago y recomendar hospitales segun el sintoma del paciente.

## Estructura

- frontend/ (Next.js App Router + Tailwind)
- backend/ (Express + Prisma + PostgreSQL + OpenAI)

## Backend - Instalacion

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## Frontend - Instalacion

```bash
cd frontend
npm install
npm run dev
```

## Variables de entorno

Crea un archivo `.env` en `backend/` basado en `.env.example`.

```
PORT=4000
DATABASE_URL=postgresql://postgres:password@localhost:5432/copay?schema=public
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
```

Para el frontend, crea `.env` en `frontend/` basado en `.env.example`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Notas:
- `coveragePercentage` se guarda como decimal entre 0 y 1.
- Las especialidades se manejan en minusculas para facilitar busquedas.

## Endpoints

### POST /analyze-symptom

Request:
```json
{ "symptom": "dolor de pecho" }
```

Response:
```json
{ "specialty": "cardiologia" }
```

### POST /estimate-copay

Request:
```json
{ "specialty": "cardiologia", "insurancePlan": "Estandar" }
```

Response:
```json
{
  "specialty": "cardiologia",
  "insurancePlan": "Estandar",
  "recommendedHospital": {
    "id": 2,
    "name": "Clinica Norte",
    "specialty": "cardiologia",
    "totalCost": 950,
    "copay": 237.5
  },
  "hospitals": [
    {
      "id": 2,
      "name": "Clinica Norte",
      "specialty": "cardiologia",
      "totalCost": 950,
      "copay": 237.5
    }
  ]
}
```

## Deploy

- Frontend: Vercel
- Backend: Railway o Render
- Base de datos: Supabase
