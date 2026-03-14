'use server';

import { upscaleImageWithAI, type UpscaleImageInput, type UpscaleImageOutput } from '@/ai/flows/upscale-image-with-ai';

/**
 * Enhanced upscale action that sets the environment variable dynamically for the session.
 * Note: In a real production environment with high concurrency, this should be handled 
 * via headers or passing context, but for a Genkit flow utility, setting process.env 
 * during the async execution is a standard workaround for "bring your own key" tools.
 */
export async function runUpscale(input: UpscaleImageInput, apiKey: string): Promise<UpscaleImageOutput> {
  if (!apiKey) {
    throw new Error('Google API Key is required.');
  }

  // Set the environment variable for this execution context
  process.env.GOOGLE_GENAI_API_KEY = apiKey;

  try {
    return await upscaleImageWithAI(input);
  } catch (error: any) {
    console.error('Upscale Action Error:', error);
    throw new Error(error.message || 'Failed to upscale image. Please check your API key and settings.');
  }
}