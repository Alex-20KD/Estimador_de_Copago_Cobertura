const { mapSymptomToSpecialty } = require('../services/aiService');
const supabase = require('../db/supabase');

async function analyzeSymptom(req, res) {
    try {
        const { symptom } = req.body;

        if (!symptom) {
            return res.status(400).json({ error: "El síntoma es requerido" });
        }

        const specialty = await mapSymptomToSpecialty(symptom);
  
        const { data: costs, error } = await supabase
            .from('costs')
            .select(`
                consultation_price,
                coverage_percentage,
                facilities ( name, address )
            `)
            .eq('specialty_name', specialty);

        if (error) throw error;

        // Si no hay hospitales con esa especialidad en la DB
        if (!costs || costs.length === 0) {
            return res.json({
                success: true,
                message: `No encontramos clínicas específicas para ${specialty} en Manta, pero puedes acudir a Medicina General.`,
                specialty,
                results: []
            });
        }

        const formattedResults = costs.map(item => ({
            hospital: item.facilities.name,
            location: item.facilities.address,
            specialty: specialty,
            original_price: Number(item.consultation_price).toFixed(2),
            insurance_coverage: `${item.coverage_percentage}%`,
            you_pay: (item.consultation_price * (1 - (item.coverage_percentage / 100))).toFixed(2)
        }));

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