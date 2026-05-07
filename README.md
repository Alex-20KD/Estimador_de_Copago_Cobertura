Markdown
# Agente Estimador de Copago y Cobertura para Pacientes

Sistema fullstack para estimar copago y recomendar clínicas y hospitales (red de Manta) según el síntoma del paciente. 

## Estructura

- `frontend/` (Next.js App Router + Tailwind CSS)
- `backend/` (Express + PostgreSQL/Supabase + Google Gemini)

## Backend - Instalación

El backend ha sido optimizado para conectarse directamente a Supabase sin ORMs intermedios pesados, mejorando la velocidad de respuesta.

```bash
cd backend
npm install
npm run dev
(Nota: Las tablas de la base de datos se manejan directamente desde el SQL Editor de Supabase).

Frontend - Instalación
Bash
cd frontend
npm install
npm run dev
Variables de entorno
Crea un archivo .env en backend/ basado en .env.example. Asegúrate de actualizar las credenciales de la IA y la base de datos:

Fragmento de código
PORT=4000
SUPABASE_URL=[https://tu-proyecto.supabase.co](https://tu-proyecto.supabase.co)
SUPABASE_KEY=tu_anon_key
GEMINI_API_KEY=tu_api_key_de_gemini
Para el frontend, crea un .env en frontend/ basado en .env.example:

Fragmento de código
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
Notas:

coverage_percentage se maneja dinámicamente según el plan del usuario.

Las especialidades se manejan en minúsculas en la base de datos para facilitar búsquedas.

⚡ Endpoints (Arquitectura Optimizada)
Se refactorizó el flujo original de dos pasos (/analyze-symptom + /estimate-copay) a una Single-Step API. Ahora, una sola petición analiza el lenguaje natural con IA, consulta la base de datos y calcula los copagos en tiempo real.

POST /analyze-symptom
Request:

JSON
{ 
  "symptom": "me duele la garganta y tengo fiebre",
  "insurancePlan": "Estandar"
}
Response:

JSON
{
  "success": true,
  "count": 3,
  "results": [
    {
      "hospital": "Hospital Rodríguez Zambrano",
      "location": "Av. 24 y Calle 13",
      "specialty": "medicina general",
      "original_price": "35.00",
      "insurance_coverage": "80%",
      "you_pay": "7.00"
    },
    {
      "hospital": "Clínica Los Esteros",
      "location": "Av. 103 y Calle 119",
      "specialty": "medicina general",
      "original_price": "45.00",
      "insurance_coverage": "70%",
      "you_pay": "13.50"
    }
  ]
}
Deploy Recomendado
Frontend: Vercel

Backend: Render

Base de datos: Supabase