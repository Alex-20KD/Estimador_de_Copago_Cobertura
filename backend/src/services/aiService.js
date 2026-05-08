const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const allowedSpecialties = new Set([
  "medicina general",
  "cardiologia",
  "pediatria",
  "traumatologia",
  "psiquiatria",
  "psicologia",
  "gastroenterologia",
  "dermatologia",
  "otorrinolaringologia",
  "ginecologia",
]);

const fallbackSpecialty = "medicina general";
const emergencyCardioRegex = /\b(me muero|infarto|paro|paro cardiaco|taquicardia|taquicardias)\b/i;

const systemPrompt = `
  Eres un clasificador médico experto.
  Debes devolver ÚNICAMENTE una especialidad válida en JSON estricto:
  {"specialty":"<valor>"}
  Solo puedes elegir una de estas opciones (minúsculas, sin tildes):
  [medicina general, cardiologia, pediatria, traumatologia, psiquiatria, psicologia, gastroenterologia, dermatologia, otorrinolaringologia, ginecologia].
  Regla de cardiologia: para dolores de corazon, pecho, presion alta, infartos, paros cardiacos, taquicardias y cualquier emergencia cardiovascular.
  Si el usuario escribe "me muero", "infarto" o "paro", NO uses "urgencias": asigna segun el organo afectado (por ejemplo, cardiologia para emergencia cardiovascular).
  No inventes especialidades fuera de esa lista.
  Si no hay suficiente contexto clínico, elige "medicina general".
`;

function normalizeSpecialty(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

async function mapSymptomToSpecialty(symptom) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in .env");
  }

  if (emergencyCardioRegex.test(String(symptom ?? ""))) {
    return "cardiologia";
  }

  const prompt = `${systemPrompt}\n\nSíntoma del paciente: ${symptom}`;

  const preferredModels = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-pro-latest"];
  let lastError;

  for (const modelName of preferredModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0,
        },
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const cleanText = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanText);

      if (parsed.specialty) {
        const normalizedSpecialty = normalizeSpecialty(parsed.specialty);
        if (allowedSpecialties.has(normalizedSpecialty)) {
          return normalizedSpecialty;
        }
      }
    } catch (e) {
      lastError = e;
    }
  }

  console.error("🔴 Fallo total de IA:", lastError?.message);
  return fallbackSpecialty;
}

module.exports = { mapSymptomToSpecialty };
