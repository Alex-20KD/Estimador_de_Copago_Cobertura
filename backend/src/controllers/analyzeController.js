const { mapSymptomToSpecialty } = require("../services/aiService");

async function analyzeSymptom(req, res, next) {
  try {
    const { symptom } = req.body;

    // Validación de seguridad (le agregué el trim para evitar espacios en blanco)
    if (!symptom || typeof symptom !== "string" || symptom.trim() === "") {
      return res.status(400).json({ error: "symptom is required" });
    }

    // 🔥 Adiós al mock. Aquí ocurre la magia real con OpenAI:
    const specialty = await mapSymptomToSpecialty(symptom);

    // Retornamos el JSON dinámico
    return res.json({ specialty });
  } catch (error) {
    // Si OpenAI falla, el catch lo captura y se lo pasa a Express
    return next(error);
  }
}

module.exports = { analyzeSymptom };
