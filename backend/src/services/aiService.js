const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = [
  "You map patient symptoms to a medical specialty.",
  "Return only JSON via the provided function call.",
  "Use Spanish specialty names in lowercase."
].join(" ");

async function mapSymptomToSpecialty(symptom) {
  // --- BYPASS TEMPORAL POR ERROR 429 ---
  // Borra esto cuando tengas una API Key con saldo
  if (symptom) return "oftalmologia"; 
  // -------------------------------------
  if (!process.env.OPENAI_API_KEY) {
    const err = new Error("OPENAI_API_KEY is not set");
    err.status = 500;
    throw err;
  }

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Symptom: ${symptom}` }
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "set_specialty",
          description: "Return the medical specialty for the symptom.",
          parameters: {
            type: "object",
            properties: {
              specialty: { type: "string" }
            },
            required: ["specialty"],
            additionalProperties: false
          }
        }
      }
    ],
    tool_choice: { type: "function", function: { name: "set_specialty" } },
    temperature: 0.2
  });

  const toolCall = response.choices?.[0]?.message?.tool_calls?.[0];
  const args = toolCall?.function?.arguments;

  if (!args) {
    const err = new Error("Invalid AI response");
    err.status = 502;
    throw err;
  }

  let parsed;
  try {
    parsed = JSON.parse(args);
  } catch (error) {
    const err = new Error("Invalid JSON from AI");
    err.status = 502;
    throw err;
  }

  if (!parsed.specialty) {
    const err = new Error("Missing specialty in AI response");
    err.status = 502;
    throw err;
  }

  return String(parsed.specialty).trim().toLowerCase();
}

module.exports = { mapSymptomToSpecialty };
