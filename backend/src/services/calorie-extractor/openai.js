const OpenAI = require('openai');
const logger = require('../../middleware/logger');
const { SYSTEM_PROMPT, parseResponse } = require('./shared');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function extractCalories(transcript) {
  logger.info('Extracting calories via OpenAI', { transcript });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1024,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Meal description: ${transcript}` },
    ],
  });

  const rawText = completion.choices[0].message.content.trim();
  return parseResponse(rawText);
}

module.exports = { extractCalories };
