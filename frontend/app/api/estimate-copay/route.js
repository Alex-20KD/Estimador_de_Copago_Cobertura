import { createClient } from "@supabase/supabase-js";

// Inicializar Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function normalizeSpecialty(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizePlan(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function clampPercentage(value) {
  return Math.min(100, Math.max(0, value));
}

async function getInsurancePlan(insurancePlanName) {
  const { data, error } = await supabase
    .from("insurance_plans")
    .select("name, coverage_percentage")
    .ilike("name", `%${insurancePlanName}%`)
    .limit(1);

  if (error) throw error;

  if (!data || data.length === 0) {
    const err = new Error("Insurance plan not found");
    err.status = 404;
    throw err;
  }

  return {
    name: data[0].name,
    coveragePercentage: data[0].coverage_percentage / 100
  };
}

async function fetchFacilitiesBySpecialty(specialty) {
  const { data, error } = await supabase
    .from("facilities")
    .select(`
      id,
      name,
      address,
      costs!inner (
        consultation_price,
        coverage_percentage,
        specialty_name
      )
    `)
    .ilike("costs.specialty_name", `%${specialty}%`);

  if (error) throw error;
  return data || [];
}

export async function POST(req) {
  try {
    const { specialty, insurancePlan } = await req.json();

    // Validaciones de seguridad
    if (!specialty || typeof specialty !== "string") {
      return Response.json(
        {
          success: false,
          error: "specialty is required and must be a string"
        },
        { status: 400 }
      );
    }

    if (!insurancePlan || typeof insurancePlan !== "string") {
      return Response.json(
        {
          success: false,
          error: "insurancePlan is required and must be a string"
        },
        { status: 400 }
      );
    }

    // Obtener el plan de seguros de Supabase
    const plan = await getInsurancePlan(insurancePlan);

    // Obtener las facilidades que coincidan con la especialidad
    let facilities = await fetchFacilitiesBySpecialty(specialty);

    if (!facilities || facilities.length === 0) {
      // Fallback a medicina general si no hay resultados
      facilities = await fetchFacilitiesBySpecialty("medicina general");
    }

    if (!facilities || facilities.length === 0) {
      return Response.json(
        { success: true, specialty: specialty, hospitals: [] },
        { status: 200 }
      );
    }

    // Formatear los resultados
    const hospitals = facilities
      .flatMap((facility) => {
        const costRows = Array.isArray(facility.costs) ? facility.costs : [];
        return costRows.map((cost) => {
          const consultationPrice = Number(cost.consultation_price) || 0;
          const baseCoverage = Number(cost.coverage_percentage) || 0;
          const adjustedCoverage = clampPercentage(baseCoverage);
          const copay =
            consultationPrice * (1 - adjustedCoverage / 100 * plan.coveragePercentage);

          return {
            id: facility.id,
            name: facility.name,
            location: facility.address,
            specialty: specialty,
            totalCost: consultationPrice.toFixed(2),
            coverage: `${adjustedCoverage.toFixed(2)}%`,
            copay: copay.toFixed(2)
          };
        });
      })
      .sort((a, b) => parseFloat(a.copay) - parseFloat(b.copay));

    return Response.json(
      {
        success: true,
        specialty,
        insurancePlan: plan.name,
        coveragePercentage: `${(plan.coveragePercentage * 100).toFixed(2)}%`,
        recommendedHospital: hospitals[0] || null,
        hospitalCount: hospitals.length,
        hospitals
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error estimating copay:", error);
    
    if (error.message === "Insurance plan not found") {
      return Response.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: false,
        error: "Error interno en la estimación del copago"
      },
      { status: 502 }
    );
  }
}
