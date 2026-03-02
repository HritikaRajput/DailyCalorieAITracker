const logger = require('../../middleware/logger');

const SYSTEM_PROMPT = `You are a nutrition expert. Analyze meal descriptions and estimate calories and macronutrients for each food item.

Always return ONLY valid JSON — no prose, no markdown, no explanation. The JSON must match this exact schema:
{
  "foods": [
    {
      "name": "descriptive food name with quantity",
      "calories": number,
      "protein_g": number,
      "fiber_g": number,
      "carbs_g": number,
      "fat_g": number
    }
  ],
  "total_calories": number,
  "total_protein_g": number,
  "total_fiber_g": number,
  "total_carbs_g": number,
  "total_fat_g": number,
  "confidence": "high" | "medium" | "low"
}

Guidelines:
- Use realistic average estimates for common foods
- If quantities are vague (e.g. "a bowl", "some rice"), assume a standard serving
- confidence: "high" if foods and quantities are clear, "medium" if quantities are guessed, "low" if very vague
- All totals must equal the sum of the individual food values
- Include cooking method in the food name when mentioned (e.g. "grilled chicken breast 150g")`;

function parseResponse(rawText) {
  const jsonText = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  const parsed = JSON.parse(jsonText);

  // Guard against model arithmetic errors — recompute all totals from food items
  const sums = parsed.foods.reduce(
    (acc, f) => ({
      calories: acc.calories + (f.calories || 0),
      protein_g: acc.protein_g + (f.protein_g || 0),
      fiber_g: acc.fiber_g + (f.fiber_g || 0),
      carbs_g: acc.carbs_g + (f.carbs_g || 0),
      fat_g: acc.fat_g + (f.fat_g || 0),
    }),
    { calories: 0, protein_g: 0, fiber_g: 0, carbs_g: 0, fat_g: 0 },
  );

  const round1 = (n) => Math.round(n * 10) / 10;

  parsed.total_calories = sums.calories;
  parsed.total_protein_g = round1(sums.protein_g);
  parsed.total_fiber_g = round1(sums.fiber_g);
  parsed.total_carbs_g = round1(sums.carbs_g);
  parsed.total_fat_g = round1(sums.fat_g);

  return parsed;
}

module.exports = { SYSTEM_PROMPT, parseResponse };
