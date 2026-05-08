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

const systemPrompt = `
Eres un asistente médico amigable, empático y profesional.
Debes responder SIEMPRE en JSON puro válido (sin markdown, sin backticks y sin texto adicional), con esta estructura exacta:
{
  "reply": "Tu respuesta en lenguaje natural y empático para el usuario.",
  "requires_hospital": boolean,
  "specialty": "nombre_de_la_especialidad" | null
}

Reglas obligatorias:
1) Si el mensaje del usuario es saludo, charla casual o conversación no clínica, responde con:
   - "requires_hospital": false
   - "specialty": null
2) Si el usuario menciona síntomas, dolor, accidente, malestar o necesidad de atención médica, responde con:
   - "requires_hospital": true
   - "specialty": una sola opción estricta de esta lista exacta (minúsculas y sin tildes):
     traumatologia, cardiologia, pediatria, psiquiatria, psicologia, gastroenterologia, dermatologia, otorrinolaringologia, ginecologia, medicina general
3) No inventes especialidades fuera de la lista.
4) Si hay duda clínica, usa "medicina general".
`;

function normalizeSpecialty(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

async function generateMedicalAssistantReply(userMessage) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in .env");
  }

  const prompt = `${systemPrompt}\n\nMensaje del usuario: ${userMessage}`;

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
      return response.text().trim();
    } catch (e) {
      lastError = e;
    }
  }

  console.error("🔴 Fallo total de IA:", lastError?.message);
  throw new Error("No se pudo obtener respuesta de Gemini");
}

module.exports = {
  generateMedicalAssistantReply,
  normalizeSpecialty,
  allowedSpecialties,
};
