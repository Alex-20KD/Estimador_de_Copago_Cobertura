// const { estimateCopay } = require("../services/copayService");

async function estimateCopayController(req, res, next) {
  try {
    const { specialty, insurancePlan } = req.body;

    if (!specialty || typeof specialty !== "string") {
      return res.status(400).json({ error: "specialty is required" });
    }

    if (!insurancePlan || typeof insurancePlan !== "string") {
      return res.status(400).json({ error: "insurancePlan is required" });
    }

    // Aquí irá la lógica de Prisma en el futuro
    // const { plan, hospitals } = await estimateCopay(specialty, insurancePlan);

    // Retornamos el mock exacto que espera el frontend
    const hospitals = [
      {
        id: 2,
        name: "Clinica Norte",
        specialty: "cardiologia",
        totalCost: 950,
        copay: 237.5
      }
    ];

    return res.json({
      specialty: "cardiologia",
      insurancePlan: "Estandar",
      recommendedHospital: {
        id: 2,
        name: "Clinica Norte",
        specialty: "cardiologia",
        totalCost: 950,
        copay: 237.5
      },
      hospitals
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { estimateCopayController };
