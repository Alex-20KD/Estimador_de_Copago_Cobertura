// Comentamos la base de datos por ahora
// const { prisma } = require("../db/prisma");

async function estimateCopay(specialty, insurancePlanName) {
  
  // --- MOCK DE BASE DE DATOS (Hasta que tengamos Supabase) ---
  const mockPlans = [
    { name: "Estandar", coveragePercentage: 0.75 },
    { name: "Premium", coveragePercentage: 0.90 },
    { name: "Basico", coveragePercentage: 0.50 }
  ];

  const mockHospitals = [
    { id: 1, name: "Clinica Sur", specialty: "traumatologia", baseCost: 800 },
    { id: 2, name: "Clinica Norte", specialty: "cardiologia", baseCost: 950 },
    { id: 3, name: "Hospital Central", specialty: "cardiologia", baseCost: 1200 },
    { id: 4, name: "Centro Oftalmologico", specialty: "oftalmologia", baseCost: 300 },
    { id: 5, name: "Clinica Manta", specialty: "oftalmologia", baseCost: 450 }
  ];
  // ----------------------------------------------------------

  // Buscamos el plan en nuestros datos falsos
  const plan = mockPlans.find(p => p.name.toLowerCase() === insurancePlanName.toLowerCase());

  if (!plan) {
    const err = new Error("Insurance plan not found");
    err.status = 404;
    throw err;
  }

  // Filtramos los hospitales por la especialidad que venga de la IA
  const hospitals = mockHospitals.filter(h => h.specialty.toLowerCase() === specialty.toLowerCase());

  const results = hospitals.map((hospital) => {
    // La fórmula mágica: Costo * (1 - Porcentaje de Cobertura)
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

  // Ordenamos para que el más barato aparezca primero
  results.sort((a, b) => a.copay - b.copay);

  return { plan, hospitals: results };
}

module.exports = { estimateCopay };

