/**
 * Calorie extraction provider — swap via CALORIE_EXTRACTOR env var.
 * Supported values: "openai" (default), "claude"
 */
const provider = process.env.CALORIE_EXTRACTOR || 'openai';

const extractors = {
  openai: () => require('./openai'),
  claude: () => require('./claude'),
};

if (!extractors[provider]) {
  throw new Error(`Unknown CALORIE_EXTRACTOR provider: "${provider}". Use "openai" or "claude".`);
}

module.exports = extractors[provider]();
