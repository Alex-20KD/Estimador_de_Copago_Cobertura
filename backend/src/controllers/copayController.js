const { estimateCopay } = require("../services/copayService");

async function estimateCopayController(req, res, next) {
  try {
    const { specialty, insurancePlan } = req.body;

    // Tus validaciones de seguridad (Misión 2)
    if (!specialty || typeof specialty !== "string") {
      return res.status(400).json({ error: "specialty is required" });
    }

    if (!insurancePlan || typeof insurancePlan !== "string") {
      return res.status(400).json({ error: "insurancePlan is required" });
    }

    // 🔥 Conectamos con el motor de cálculo del servicio
    const { plan, hospitals } = await estimateCopay(specialty, insurancePlan);

    // Retornamos la respuesta dinámica
    return res.json({
      specialty,
      insurancePlan: plan.name,
      recommendedHospital: hospitals[0] || null, // El más barato según el sort del servicio
      hospitals
    });
  } catch (error) {
    // Si el plan no existe (error 404 en el servicio), next(error) lo captura
    return next(error);
  }
}

module.exports = { estimateCopayController };
