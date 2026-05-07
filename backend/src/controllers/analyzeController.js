const { mapSymptomToSpecialty } = require('../services/aiService');
const supabase = require('../db/supabase'); // <--- Apuntando a tu carpeta db

async function analyzeSymptom(req, res) {
    try {
        const { symptom } = req.body;

        // 1. La IA hace su magia (ya funciona)
        const specialty = await mapSymptomToSpecialty(symptom);

        // 2. Buscamos en la base de datos usando la especialidad
        // Traemos el precio, el % de cobertura y el nombre del hospital (relación)
        // Dentro de tu analyzeController.js
        const { data: costs, error } = await supabase
        .from('costs')
        .select(`
          consultation_price,
          coverage_percentage,
          facilities!inner ( name, address )
          `)
          .eq('specialty_name', specialty);

        if (error) throw error;

        // 3. Calculamos el copago para cada opción encontrada en Manta
        const formattedResults = costs.map(item => {
            const price = item.consultation_price;
            const coverage = item.coverage_percentage;
            const copay = price * (1 - (coverage / 100));

            return {
                hospital: item.facilities.name,
                location: item.facilities.address,
                specialty: specialty,
                original_price: `$${price}`,
                insurance_coverage: `${coverage}%`,
                you_pay: `$${copay.toFixed(2)}` // El copago final
            };
        });

        res.json({
            success: true,
            results: formattedResults
        });

    } catch (error) {
        console.error("Error en el flujo:", error.message);
        res.status(502).json({ error: "Error al calcular el copago" });
    }
}

module.exports = { analyzeSymptom }; 