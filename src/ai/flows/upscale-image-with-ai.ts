'use server';
/**
 * @fileOverview This file defines a Genkit flow for upscaling images using Google AI models.
 *
 * - upscaleImageWithAI - A function that handles the image upscaling process.
 * - UpscaleImageInput - The input type for the upscaleImageWithAI function.
 * - UpscaleImageOutput - The return type for the upscaleImageWithAI function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Helper function to extract MIME type from a data URI
function getMimeTypeFromDataUri(dataUri: string): string | undefined {
  const match = dataUri.match(/^data:(.*?);base64,/);
  return match ? match[1] : undefined;
}

const UpscaleImageInputSchema = z.object({
  images: z.array(
    z.string().describe(
      "An array of images, each as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    )
  ),
  modelName: z.string().describe(
    "The name of the Google AI model to use for upscaling."
  ),
  resolutionPrompt: z.string().describe(
    "The desired output resolution, e.g., '2K', '4K', '1K', '512'."
  ),
  aspectRatio: z.string().describe(
    "The desired aspect ratio for the output image, e.g., '16:9', '1:1'."
  )
});
export type UpscaleImageInput = z.infer<typeof UpscaleImageInputSchema>;

const UpscaleImageOutputSchema = z.object({
  upscaledImages: z.array(
    z.string().describe(
      "An array of upscaled images, each as a data URI with a MIME type and Base64 encoding. Format will be PNG."
    )
  )
});
export type UpscaleImageOutput = z.infer<typeof UpscaleImageOutputSchema>;

/**
 * Upscales one or more images using a specified Google AI image generation model.
 * @param input - The input containing images, model name, and desired upscaling parameters.
 * @returns An object containing an array of upscaled images as data URIs.
 */
export async function upscaleImageWithAI(
  input: UpscaleImageInput
): Promise<UpscaleImageOutput> {
  return upscaleImageWithAIFlow(input);
}

const upscaleImageWithAIFlow = ai.defineFlow(
  {
    name: 'upscaleImageWithAIFlow',
    inputSchema: UpscaleImageInputSchema,
    outputSchema: UpscaleImageOutputSchema,
  },
  async (input) => {
    const upscaledImages: string[] = [];

    for (const imageDataUri of input.images) {
      const mimeType = getMimeTypeFromDataUri(imageDataUri);
      if (!mimeType) {
        continue;
      }

      // No resolution or ratio strings in the text prompt.
      // These are passed strictly as API configurations in imageConfig.
      const promptParts = [
        {
          media: {
            url: imageDataUri,
            contentType: mimeType,
          },
        },
        {
          text: `STRICT SUPER RESOLUTION TASK: Perform pixel-perfect upscaling on this image. 
          MAINTAIN 100% FIDELITY: Do not alter content, composition, subjects, or lighting. 
          Enhance only the clarity and textures. 
          OUTPUT FORMAT: PNG.`,
        },
      ];

      try {
        const modelRef = input.modelName.includes('/') ? input.modelName : `googleai/${input.modelName}`;

        const { media } = await ai.generate({
          model: modelRef,
          prompt: promptParts,
          config: {
            responseModalities: ['IMAGE'],
            // Native image parameters passed as model configurations
            imageConfig: {
              aspectRatio: input.aspectRatio,
              imageSize: input.resolutionPrompt,
            }
          } as any,
        });

        if (media && media.url) {
          upscaledImages.push(media.url);
        }
      } catch (error) {
        throw error;
      }
    }

    if (upscaledImages.length === 0 && input.images.length > 0) {
      throw new Error('The AI model failed to produce upscaled output. Please verify your API key and configuration.');
    }

    return { upscaledImages };
  }
);
