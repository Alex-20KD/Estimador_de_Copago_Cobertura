const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemPrompt = `
  Eres un asistente médico experto. 
  Tu tarea es mapear los síntomas del paciente a una especialidad médica.
  Debes responder ÚNICAMENTE con un objeto JSON con el formato: {"specialty": "nombre_especialidad"}
  Usa nombres de especialidades en español, minúsculas y sin tildes.
`;

// Función de debug sugerida por tu agente
async function debugListModels(apiVersion = "v1beta") {
  const key = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models?key=${encodeURIComponent(key)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) return;

    const compatibles = (data.models || [])
      .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
      .map((m) => m.name);
    
    console.log(`\n🔍 Modelos disponibles en tu API KEY (${apiVersion}):`);
    console.log(compatibles);
    console.log("--------------------------------------------------");
  } catch (e) {
    // Ignoramos errores de red en el debug
  }
}

async function mapSymptomToSpecialty(symptom) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in .env");
  }

  // 1. Ejecutamos el debug para ver la lista real en tu terminal
  await debugListModels("v1beta");

  const prompt = `${systemPrompt}\n\nSíntoma del paciente: ${symptom}`;

  // 2. Sistema de Fallback de tu agente
  // Intentará flash primero, luego con el prefijo models/, y si todo falla, usará el robusto gemini-pro
const preferredModels = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-3-flash-preview"];  let lastError;

  for (const modelName of preferredModels) {
    try {
      console.log(`⏳ Intentando IA con el modelo: ${modelName}...`);
      
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      const cleanText = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanText);

      if (!parsed.specialty) throw new Error("El JSON no contiene 'specialty'");

      console.log(`✅ ¡Éxito! El modelo ${modelName} respondió correctamente.\n`);
      return String(parsed.specialty).trim().toLowerCase();

    } catch (e) {
      lastError = e;
      console.error(`❌ El modelo ${modelName} falló:`, e.message);
      // El ciclo continúa con el siguiente modelo de la lista
    }
  }

  // 3. Si por alguna razón TODOS fallan, devolvemos un valor por defecto para no tumbar tu frontend
  console.error("🔴 Todos los modelos fallaron. Último error:", lastError.message);
  return "medicina general"; 
}

module.exports = { mapSymptomToSpecialty }; 