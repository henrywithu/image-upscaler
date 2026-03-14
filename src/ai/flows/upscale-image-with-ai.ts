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
import { googleAI } from '@genkit-ai/google-genai';

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
    "The name of the Google AI model to use for upscaling, e.g., 'gemini-3.1-flash-image-preview' or 'gemini-2.5-flash-image'."
  ),
  resolutionPrompt: z.string().describe(
    "A descriptive prompt for the desired output resolution, e.g., '2K', '4K', '1K'."
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
 * Maps abstract resolution labels and aspect ratios to explicit pixel instructions.
 * This helps the AI model understand the exact target size required.
 */
function getPixelInstruction(resolution: string, ratio: string): string {
  const resMap: Record<string, number> = {
    "512": 512,
    "1K": 1080,
    "2K": 1440,
    "4K": 2160
  };
  
  const targetH = resMap[resolution] || 1080;
  const ratioParts = ratio.split(':').map(Number);
  
  if (ratioParts.length === 2 && !isNaN(ratioParts[0]) && !isNaN(ratioParts[1])) {
    const factor = targetH / ratioParts[1];
    const targetW = Math.round(ratioParts[0] * factor);
    return `${targetW}x${targetH} pixels`;
  }
  
  return `${resolution} resolution`;
}

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
    const pixelDim = getPixelInstruction(input.resolutionPrompt, input.aspectRatio);

    for (const imageDataUri of input.images) {
      const mimeType = getMimeTypeFromDataUri(imageDataUri);
      if (!mimeType) {
        console.error('Skipping invalid image data URI: missing MIME type.');
        continue;
      }

      // We use explicit pixel instructions in the prompt to force the model to 
      // generate a high-resolution output matching the user's selection.
      const promptParts = [
        {
          media: {
            url: imageDataUri,
            contentType: mimeType,
          },
        },
        {
          text: `STRICT TASK: Upscale this image to a professional, high-fidelity PNG version.
          
REQUIRED SPECIFICATIONS:
- Target Resolution: ${pixelDim}
- Aspect Ratio: ${input.aspectRatio}
- Output Format: PNG
- Quality: Super Resolution, extremely sharp details, enhanced textures

INSTRUCTIONS: 
Redraw and enhance the input image so that it matches the Target Resolution of ${pixelDim}. Do not return a low-resolution or standard-sized preview. The output MUST be a high-resolution image. Maintain perfect consistency with the original subject and composition.`,
        },
      ];

      try {
        const { media } = await ai.generate({
          model: googleAI.model(input.modelName),
          prompt: promptParts,
          config: {
            responseModalities: ['IMAGE']
          },
        });

        if (media && media.url) {
          upscaledImages.push(media.url);
        } else {
          console.warn(`No upscaled image media returned for model: ${input.modelName}`);
        }
      } catch (error) {
        console.error(`Error upscaling image with model ${input.modelName}:`, error);
      }
    }

    if (upscaledImages.length === 0 && input.images.length > 0) {
      throw new Error('The AI model failed to produce high-resolution output. This might be due to model limitations or high traffic.');
    }

    return { upscaledImages };
  }
);
