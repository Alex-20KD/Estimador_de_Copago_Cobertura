const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const insurancePlans = [
  { name: "Basico", coveragePercentage: 0.6 },
  { name: "Estandar", coveragePercentage: 0.75 },
  { name: "Premium", coveragePercentage: 0.9 }
];

const hospitals = [
  { name: "Hospital Central", specialty: "cardiologia", baseCost: 1200 },
  { name: "Clinica Norte", specialty: "cardiologia", baseCost: 950 },
  { name: "Hospital del Rio", specialty: "neurologia", baseCost: 1400 },
  { name: "San Martin", specialty: "pediatria", baseCost: 600 },
  { name: "Clinica Sur", specialty: "traumatologia", baseCost: 800 },
  { name: "Centro Dermatologico", specialty: "dermatologia", baseCost: 500 },
  { name: "Clinica Pacifico", specialty: "gastroenterologia", baseCost: 700 }
];

async function main() {
  for (const plan of insurancePlans) {
    await prisma.insurancePlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan
    });
  }

  for (const hospital of hospitals) {
    await prisma.hospital.upsert({
      where: { name: hospital.name },
      update: hospital,
      create: hospital
    });
  }
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
