const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemPrompt = `
  Eres un asistente médico experto. 
  Tu tarea es mapear los síntomas del paciente a una especialidad médica.
  Debes responder ÚNICAMENTE con un objeto JSON con el formato: {"specialty": "nombre_especialidad"}
  Usa nombres de especialidades en español, minúsculas y sin tildes.
`;  

async function mapSymptomToSpecialty(symptom) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in .env");
  } 

  const prompt = `${systemPrompt}\n\nSíntoma del paciente: ${symptom}`;
  
  // Lista optimizada según lo que descubrimos en tu terminal
  const preferredModels = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-pro-latest"];
  let lastError;

  for (const modelName of preferredModels) {
    try { 
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanText = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanText);

      if (parsed.specialty) {
        return String(parsed.specialty).trim().toLowerCase();
      }
    } catch (e) {
      lastError = e;
      // Solo logueamos errores críticos en producción si es necesario
    }
  }

  console.error("🔴 Fallo total de IA:", lastError?.message);
  return "medicina general"; // Fallback seguro
}

module.exports = { mapSymptomToSpecialty };