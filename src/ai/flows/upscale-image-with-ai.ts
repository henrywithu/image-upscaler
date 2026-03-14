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
  // Note: For generative image models like 'gemini-3.1-flash-image-preview' used via Genkit's `ai.generate`,
  // direct control over output `resolution` and `aspectRatio` is typically not available through
  // the `config` object in the same way as some other specialized image manipulation APIs.
  // Instead, these parameters are generally guided by providing clear instructions within the text prompt.
  // This implementation uses the `resolutionPrompt` and `aspectRatio` inputs to construct the text prompt
  // to instruct the AI model on the desired output characteristics.
  resolutionPrompt: z.string().describe(
    "A descriptive prompt for the desired output resolution, e.g., 'very high resolution', '4K details', 'larger size'."
  ),
  aspectRatio: z.string().describe(
    "The desired aspect ratio for the output image, e.g., '16:9', '4:3', '1:1'. This will be conveyed via the prompt."
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
 * The upscaling parameters like resolution and aspect ratio are primarily guided
 * through the prompt, as direct configuration options are not universally available
 * for all image models via the Genkit API's `config` object.
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
        console.error('Skipping invalid image data URI: missing MIME type.');
        continue; // Skip to the next image if MIME type is missing
      }

      // Construct the prompt parts for the image generation model.
      // We instruct the model to upscale and adhere to aspect ratio and PNG format via text.
      const promptParts = [
        {
          media: {
            url: imageDataUri,
            contentType: mimeType,
          },
        },
        {
          text: `Upscale this image to ${input.resolutionPrompt} while maintaining its content and style. The output aspect ratio should be ${input.aspectRatio}. Regenerate this image at a higher quality and export it as a PNG file. Focus on enhancing details and clarity. The final output MUST be a PNG.`,
        },
      ];

      try {
        const { media } = await ai.generate({
          model: googleAI.model(input.modelName),
          prompt: promptParts,
          config: {
            // Ensure the model is configured to return image output.
            responseModalities: ['IMAGE']
          },
        });

        if (media && media.url) {
          upscaledImages.push(media.url);
        } else {
          console.warn(`No upscaled image media returned for one of the inputs using model: ${input.modelName}`);
        }
      } catch (error) {
        console.error(
          `Error upscaling image with model ${input.modelName}:`, "For image starting with", imageDataUri.substring(0, 50) + "...", error
        );
      }
    }

    if (upscaledImages.length === 0 && input.images.length > 0) {
      throw new Error('Failed to upscale any images. Check console for errors.');
    }

    return { upscaledImages };
  }
);
