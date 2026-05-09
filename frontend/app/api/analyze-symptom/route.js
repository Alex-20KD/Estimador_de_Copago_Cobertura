import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

// Inicializar Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Inicializar Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Especialidades válidas
const allowedSpecialties = new Set([
  "medicina general",
  "cardiologia",
  "pediatria",
  "traumatologia",
  "psiquiatria",
  "psicologia",
  "gastroenterologia",
  "dermatologia",
  "otorrinolaringologia",
  "ginecologia"
]);

// Mapear síntoma a especialidad usando Gemini
async function mapSymptomToSpecialty(symptom) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const systemPrompt = `
    Eres un clasificador médico experto.
    Debes devolver ÚNICAMENTE una especialidad válida en JSON estricto:
    {"specialty":"<valor>"}
    Solo puedes elegir una de estas opciones (minúsculas, sin tildes):
    [medicina general, cardiologia, pediatria, traumatologia, psiquiatria, psicologia, gastroenterologia, dermatologia, otorrinolaringologia, ginecologia].
    Si no hay suficiente contexto clínico, elige "medicina general".
  `;

  try {
    const result = await model.generateContent(`${systemPrompt}\n\nSíntoma: ${symptom}`);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);
    
    return allowedSpecialties.has(parsed.specialty) ? parsed.specialty : "medicina general";
  } catch {
    return "medicina general";
  }
}

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

function adjustCoverageByPlan(baseCoverage, insurancePlan) {
  const plan = normalizePlan(insurancePlan);
  const safeBaseCoverage = clampPercentage(Number(baseCoverage) || 0);

  if (plan === "basico") {
    return clampPercentage(safeBaseCoverage - 20);
  }

  if (plan === "premium") {
    return 100;
  }

  return safeBaseCoverage;
}

async function fetchCostsBySpecialty(specialty) {
  return supabase
    .from("facilities")
    .select(`
      name,
      address,
      costs!inner (
        consultation_price,
        coverage_percentage,
        specialty_name
      )
    `)
    .ilike("costs.specialty_name", `%${specialty}%`);
}

export async function POST(req) {
  try {
    const { symptom, insurancePlan } = await req.json();

    if (!symptom) {
      return Response.json(
        { success: false, error: "El síntoma es requerido" },
        { status: 400 }
      );
    }

    const suggestedSpecialty = normalizeSpecialty(await mapSymptomToSpecialty(symptom)) || "medicina general";
    let resolvedSpecialty = suggestedSpecialty;

    let { data: facilities, error } = await fetchCostsBySpecialty(resolvedSpecialty);
    if (error) throw error;

    if (!facilities || facilities.length === 0) {
      resolvedSpecialty = "medicina general";
      const fallbackResult = await fetchCostsBySpecialty(resolvedSpecialty);
      if (fallbackResult.error) throw fallbackResult.error;
      facilities = fallbackResult.data;
    }

    if (!facilities || facilities.length === 0) {
      return Response.json(
        {
          success: true,
          specialty: resolvedSpecialty,
          results: []
        },
        { status: 200 }
      );
    }

    const formattedResults = facilities.flatMap((facility) => {
      const costRows = Array.isArray(facility.costs) ? facility.costs : [];
      return costRows.map((cost) => {
        const consultationPrice = Number(cost.consultation_price) || 0;
        const adjustedCoverage = adjustCoverageByPlan(
          cost.coverage_percentage,
          insurancePlan
        );
        const finalCopay = consultationPrice * (1 - adjustedCoverage / 100);

        return {
          hospital: facility.name ?? "Hospital no disponible",
          location: facility.address ?? "Ubicación no disponible",
          specialty: resolvedSpecialty,
          original_price: consultationPrice.toFixed(2),
          insurance_coverage: `${adjustedCoverage.toFixed(2)}%`,
          you_pay: finalCopay.toFixed(2)
        };
      });
    });

    return Response.json(
      {
        success: true,
        count: formattedResults.length,
        results: formattedResults
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error analyzing symptom:", error);
    return Response.json(
      {
        success: false,
        error: "Error interno en el procesamiento médico"
      },
      { status: 502 }
    );
  }
}
