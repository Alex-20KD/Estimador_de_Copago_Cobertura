const { mapSymptomToSpecialty } = require("../services/aiService");

async function analyzeSymptom(req, res, next) {
  try {
    const { symptom } = req.body;

    if (!symptom || typeof symptom !== "string") {
      return res.status(400).json({ error: "symptom is required" });
    }

    const specialty = await mapSymptomToSpecialty(symptom);

    return res.json({ specialty });
  } catch (error) {
    return next(error);
  }
}

module.exports = { analyzeSymptom };
