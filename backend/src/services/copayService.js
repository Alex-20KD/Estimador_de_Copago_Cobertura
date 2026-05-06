const { prisma } = require("../db/prisma");

async function estimateCopay(specialty, insurancePlanName) {
  const plan = await prisma.insurancePlan.findFirst({
    where: {
      name: { equals: insurancePlanName, mode: "insensitive" }
    }
  });

  if (!plan) {
    const err = new Error("Insurance plan not found");
    err.status = 404;
    throw err;
  }

  const hospitals = await prisma.hospital.findMany({
    where: {
      specialty: { equals: specialty, mode: "insensitive" }
    }
  });

  const results = hospitals.map((hospital) => {
    const copay = hospital.baseCost * (1 - plan.coveragePercentage);
    const roundedCopay = Math.round(copay * 100) / 100;

    return {
      id: hospital.id,
      name: hospital.name,
      specialty: hospital.specialty,
      totalCost: hospital.baseCost,
      copay: roundedCopay
    };
  });

  results.sort((a, b) => a.copay - b.copay);

  return { plan, hospitals: results };
}

module.exports = { estimateCopay };
