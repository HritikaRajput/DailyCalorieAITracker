const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../../middleware/logger');
const { SYSTEM_PROMPT, parseResponse } = require('./shared');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function extractCalories(transcript) {
  logger.info('Extracting calories via Claude', { transcript });

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `Meal description: ${transcript}` }],
  });

  const rawText = message.content[0].text.trim();
  return parseResponse(rawText);
}

module.exports = { extractCalories };
