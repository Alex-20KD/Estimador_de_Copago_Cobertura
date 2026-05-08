const { mapSymptomToSpecialty } = require('../services/aiService');
const supabase = require('../db/supabase');

function normalizeSpecialty(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
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
        const { symptom } = req.body;

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
            return costRows.map((cost) => ({
                hospital: facility.name ?? "Hospital no disponible",
                location: facility.address ?? "Ubicación no disponible",
                specialty: resolvedSpecialty,
                original_price: Number(cost.consultation_price).toFixed(2),
                insurance_coverage: `${cost.coverage_percentage}%`,
                you_pay: (cost.consultation_price * (1 - (cost.coverage_percentage / 100))).toFixed(2)
            }));
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
