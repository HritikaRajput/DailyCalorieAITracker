const OpenAI = require('openai');
const fs = require('fs');
const logger = require('../middleware/logger');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Transcribe an audio file using OpenAI Whisper.
 * @param {string} filePath - Absolute path to the audio file (webm, mp4, wav, etc.)
 * @returns {Promise<string>} - Transcribed text
 */
async function transcribeAudio(filePath) {
  logger.info('Transcribing audio', { filePath });

  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: 'whisper-1',
    language: 'en',
    response_format: 'text',
  });

  logger.info('Transcription complete', { transcript: transcription });
  return transcription;
}

module.exports = { transcribeAudio };
