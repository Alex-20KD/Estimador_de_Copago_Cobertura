// const { mapSymptomToSpecialty } = require("../services/aiService");

async function analyzeSymptom(req, res, next) {
  try {
    const { symptom } = req.body;

    if (!symptom || typeof symptom !== "string") {
      return res.status(400).json({ error: "symptom is required" });
    }

    // Aquí irá la lógica de OpenAI en el futuro
    // const specialty = await mapSymptomToSpecialty(symptom);

    // Retornamos el mock exacto que espera el frontend
    return res.json({ specialty: "cardiologia" });
  } catch (error) {
    return next(error);
  }
}

module.exports = { analyzeSymptom };
