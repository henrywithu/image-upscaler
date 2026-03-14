# ChaewonHD - AI Image Upscaler

ChaewonHD is a modern, AI-powered image upscaler built with [Next.js](https://nextjs.org/) and powered by Google's Gemini models.

It allows users to upload images and upscale them with customizable options, preserving the exact original detail whilst increasing clarity and resolution.

## Features

- **AI Upscaling:** Uses Gemini Image models for superior resolution enhancements.
- **Customizable Metrics:** Allows maintaining original aspect ratios or reframing with various standard presets, and outputting up to 4K resolution.
- **Batch Processing:** Upload multiple images, queue them up, and process them all with a single click. Save time by re-processing without needing to re-upload files.
- **Before/After Comparisons:** Interactive image comparison sliders for visualizing the enhanced results.
- **Bulk Downloads:** Download all upscaled images sequentially without pop-up blocking issues.
- **Dark/Light Mode:** Includes an aesthetic, modern theme switcher.

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Configuration

To use the AI upscaling features, you'll need a Google Gemini API Key.

1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
2. Start the application and view the interface.
3. Enter your Google API Key in the Configuration panel directly in your browser.

## Built With

- **Next.js** - React framework for the web
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component system
- **Lucide React** - Icons
- **Genkit** - AI model orchestration
