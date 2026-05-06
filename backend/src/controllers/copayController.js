const { estimateCopay } = require("../services/copayService");

async function estimateCopayController(req, res, next) {
  try {
    const { specialty, insurancePlan } = req.body;

    if (!specialty || typeof specialty !== "string") {
      return res.status(400).json({ error: "specialty is required" });
    }

    if (!insurancePlan || typeof insurancePlan !== "string") {
      return res.status(400).json({ error: "insurancePlan is required" });
    }

    const { plan, hospitals } = await estimateCopay(specialty, insurancePlan);
    const recommendedHospital = hospitals[0] || null;

    return res.json({
      specialty,
      insurancePlan: plan.name,
      recommendedHospital,
      hospitals
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { estimateCopayController };
