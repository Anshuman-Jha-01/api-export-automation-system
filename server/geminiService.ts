import { GoogleGenAI } from '@google/genai';

/**
 * Resilient Gemini AI client with automatic retry, backoff, and model fallback
 * Handles transient 503 (high demand / UNAVAILABLE) and 429 (rate-limit) spikes.
 */

const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';

let genAIClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }

  return genAIClient;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isTransientError(error: any): boolean {
  if (!error) return false;
  const msg = (error.message || error.toString() || '').toLowerCase();
  const status = error.status || (error.error && error.error.status) || '';
  const code = error.code || (error.error && error.error.code) || 0;

  return (
    code === 503 ||
    status === 'UNAVAILABLE' ||
    msg.includes('high demand') ||
    msg.includes('503') ||
    msg.includes('unavailable') ||
    msg.includes('temporarily unavailable') ||
    code === 429 ||
    status === 'RESOURCE_EXHAUSTED' ||
    msg.includes('rate limit') ||
    code === 500
  );
}

export interface GeminiGenerateOptions {
  responseMimeType?: 'application/json' | 'text/plain';
  systemInstruction?: string;
  temperature?: number;
}

/**
 * Executes a generateContent call with intelligent retry and model fallback
 */
export async function generateContentWithFallback(
  prompt: string,
  options: GeminiGenerateOptions = {}
): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  const modelsToTry = [PRIMARY_MODEL, FALLBACK_MODEL];

  for (let modelIdx = 0; modelIdx < modelsToTry.length; modelIdx++) {
    const currentModel = modelsToTry[modelIdx];
    const maxRetries = 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const config: any = {};
        if (options.responseMimeType) {
          config.responseMimeType = options.responseMimeType;
        }
        if (options.systemInstruction) {
          config.systemInstruction = options.systemInstruction;
        }
        if (typeof options.temperature === 'number') {
          config.temperature = options.temperature;
        }

        const response = await ai.models.generateContent({
          model: currentModel,
          contents: prompt,
          config: Object.keys(config).length > 0 ? config : undefined
        });

        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        const transient = isTransientError(err);
        const isLastModel = modelIdx === modelsToTry.length - 1;
        const isLastAttempt = attempt === maxRetries;

        if (transient && (!isLastAttempt || !isLastModel)) {
          const delayMs = attempt * 600 + Math.floor(Math.random() * 200);
          console.warn(
            `[Gemini] ${currentModel} encountered transient issue (attempt ${attempt}/${maxRetries}). Retrying in ${delayMs}ms...`
          );
          await sleep(delayMs);
          // If this was the last retry of primary model, advance to fallback model on next outer loop
          if (isLastAttempt && !isLastModel) {
            console.warn(`[Gemini] Switching to fallback model ${FALLBACK_MODEL} due to high demand on ${PRIMARY_MODEL}.`);
          }
          continue;
        }

        if (isLastModel && isLastAttempt) {
          console.warn(`[Gemini] All models (${modelsToTry.join(', ')}) busy. Gracefully using system fallback.`);
          return null;
        }
      }
    }
  }

  return null;
}

/**
 * Safely parses JSON response from Gemini, stripping any markdown codeblocks
 */
export function safeParseGeminiJSON<T = any>(rawText: string | null): T | null {
  if (!rawText) return null;

  try {
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/, '');
    }

    return JSON.parse(cleaned) as T;
  } catch (err) {
    // Attempt regex extraction if there are surrounding characters
    try {
      const match = rawText.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
      if (match) {
        return JSON.parse(match[1]) as T;
      }
    } catch {
      // Ignore
    }
    return null;
  }
}
