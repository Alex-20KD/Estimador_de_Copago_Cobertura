const { mapSymptomToSpecialty } = require('../services/aiService');
const supabase = require('../db/supabase');

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
            return res.status(400).json({ error: "El síntoma es requerido" });
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
            return res.json({
                success: true,
                specialty: resolvedSpecialty,
                results: []
            });
        }

        const formattedResults = facilities.flatMap((facility) => {
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
                    specialty: resolvedSpecialty,
                    original_price: consultationPrice.toFixed(2),
                    insurance_coverage: `${adjustedCoverage.toFixed(2)}%`,
                    you_pay: finalCopay.toFixed(2)
                };
            });
        });

        res.json({
            success: true,
            count: formattedResults.length,
            results: formattedResults
        });

    } catch (error) {
        res.status(502).json({ 
            success: false, 
            error: "Error interno en el procesamiento médico" 
        });
    }
}

module.exports = { analyzeSymptom };
