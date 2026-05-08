const {
    generateMedicalAssistantReply,
    normalizeSpecialty,
    allowedSpecialties
} = require('../services/aiService');
const supabase = require('../db/supabase');

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
        .from('facilities')
        .select(`
            name,
            address,
            costs!inner (
                consultation_price,
                coverage_percentage,
                specialty_name
            )
        `)
        .eq('costs.specialty_name', specialty);
}

async function analyzeSymptom(req, res) {
    try {
        const { symptom, insurancePlan } = req.body;

        if (!symptom) {
            return res.status(400).json({
                botReply: "Por favor, cuéntame tu síntoma para poder ayudarte.",
                hospitalData: null
            });
        }

        const geminiRawReply = await generateMedicalAssistantReply(symptom);
        const cleanedGeminiReply = String(geminiRawReply ?? "").replace(/```json|```/gi, "").trim();

        let parsed;
        try {
            parsed = JSON.parse(cleanedGeminiReply);
        } catch (parseError) {
            return res.status(502).json({
                botReply: "No pude procesar tu mensaje en este momento. Intenta nuevamente, por favor.",
                hospitalData: null
            });
        }

        const reply = typeof parsed?.reply === "string" && parsed.reply.trim()
            ? parsed.reply.trim()
            : "Gracias por escribir. ¿Puedes contarme un poco más para orientarte mejor?";

        const requiresHospital = parsed?.requires_hospital === true;
        const normalizedSpecialty = parsed?.specialty == null
            ? null
            : normalizeSpecialty(parsed.specialty);

        if (requiresHospital && (!normalizedSpecialty || !allowedSpecialties.has(normalizedSpecialty))) {
            return res.status(502).json({
                botReply: "No pude identificar la especialidad médica correctamente. Intenta describir tu síntoma con más detalle.",
                hospitalData: null
            });
        }

        if (!requiresHospital) {
            return res.json({
                botReply: reply,
                hospitalData: null
            });
        }

        let { data: facilities, error } = await fetchCostsBySpecialty(normalizedSpecialty);
        if (error) throw error;

        const formattedResults = (Array.isArray(facilities) ? facilities : []).flatMap((facility) => {
            const costRows = Array.isArray(facility.costs) ? facility.costs : [];
            return costRows.map((cost) => {
                const consultationPrice = Number(cost.consultation_price) || 0;
                const adjustedCoverage = adjustCoverageByPlan(
                    cost.coverage_percentage,
                    insurancePlan
                );
                const finalCopay = consultationPrice * (1 - (adjustedCoverage / 100));

                return {
                    hospital: facility.name ?? "Hospital no disponible",
                    location: facility.address ?? "Ubicación no disponible",
                    specialty: normalizedSpecialty,
                    original_price: consultationPrice.toFixed(2),
                    insurance_coverage: `${adjustedCoverage.toFixed(2)}%`,
                    you_pay: finalCopay.toFixed(2)
                };
            });
        });

        return res.json({
            botReply: reply,
            hospitalData: formattedResults[0] ?? null
        });

    } catch (error) {
        res.status(502).json({
            botReply: "Tuvimos un inconveniente procesando tu consulta. Intenta nuevamente en unos minutos.",
            hospitalData: null
        });
    }
}

module.exports = { analyzeSymptom };
