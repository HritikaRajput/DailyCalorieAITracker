const logger = require('../../middleware/logger');

const SYSTEM_PROMPT = `You are a nutrition expert. Your job is to analyze meal descriptions and estimate calorie counts for each food item mentioned.

Always return ONLY valid JSON — no prose, no markdown, no explanation. The JSON must match this exact schema:
{
  "foods": [
    { "name": "descriptive food name with quantity", "calories": number }
  ],
  "total_calories": number,
  "confidence": "high" | "medium" | "low"
}

Guidelines:
- Use realistic average calorie estimates for common foods
- If quantities are vague (e.g. "a bowl", "some rice"), assume a standard serving
- confidence: "high" if foods and quantities are clear, "medium" if quantities are guessed, "low" if description is very vague
- total_calories must equal the sum of all food calories
- Include cooking method in the food name when mentioned (e.g. "grilled chicken breast 150g")`;

function parseResponse(rawText) {
  // Strip markdown code fences if the model wraps the JSON
  const jsonText = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  const parsed = JSON.parse(jsonText);

  // Ensure total_calories matches sum (guard against model arithmetic errors)
  const computedTotal = parsed.foods.reduce((sum, f) => sum + f.calories, 0);
  if (parsed.total_calories !== computedTotal) {
    logger.warn('total_calories mismatch, correcting', {
      reported: parsed.total_calories,
      computed: computedTotal,
    });
    parsed.total_calories = computedTotal;
  }

  return parsed;
}

module.exports = { SYSTEM_PROMPT, parseResponse };
