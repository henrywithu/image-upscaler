<div align="center">

# 🪄 ✨ ChaewonHD ✨ 🪄
**AI-Powered Image Upscaler & Enhancer**

[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gemini API](https://img.shields.io/badge/Google_Gemini-4169E1?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)

A modern, high-performance web application designed to upscale, re-frame, and enhance images using Google's state-of-the-art **Gemini AI models**. 
Built for bulk-processing efficiency with a sleek, premium, and fully responsive user interface.

[Features](#-key-features) •
[Getting Started](#-getting-started) •
[Architecture](#-architecture) •
[Usage](#-usage-guide) •
[Configuration](#-configuration-and-environment)

---

</div>

## 🌟 Key Features

### 🧠 Advanced AI Processing
* **Gemini Model Integration:** Leverage powerful visual models (`gemini-3.1-flash-image-preview`, `gemini-3-pro-image-preview`) orchestrated via Google **Genkit**.
* **Lossless Up-scaling:** Enhance images up to 4K resolution while strictly preserving original content, style, and structure.
* **Smart Re-framing:** Output your images in over 15 different target aspect ratios (e.g., `16:9`, `9:16`, `1:1`, `21:9`) perfect for any social platform or display.

### ⚡ Blazing Fast Performance
* **Parallel Batch Processing:** Upload dozens of images at once and process them simultaneously, leveraging true asynchronous multi-threading.
* **VRAM/Memory Optimized:** Images are efficiently handled on the client using low-memory `URL.createObjectURL` Blob references, instead of heavy inline Base64 strings. No more frozen browser tabs on massive uploads.
* **Just-in-Time Compilation:** The app serializes to Base64 *only* exactly when the asset is dispatched to the AI server.

### 🎨 Premium User Experience
* **Interactive Comparisons:** Mobile-optimized, swipe-friendly Before/After image comparison sliders to instantly visualize your results.
* **Full Responsive Design:** Tailored layouts for Desktop, Tablet, and Mobile screens.
* **Theme Support:** Fluid Light and Dark mode variations powered by Tailwind's `next-themes`.
* **State Preservation:** Readily re-process images locally if you wish to try a different ratio or resolution without having to re-upload.
* **Bulk Download:** Retrieve all completed outputs to your client seamlessly with one click.

<br/>

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/en/) (v18.0.0 or higher)
* `npm`, `yarn`, or `pnpm`
* A **Google AI Studio** Account ([Get API Key](https://aistudio.google.com/))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/image-upscaler.git
   cd image-upscaler
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Access the application:**
   Open your browser and navigate to `http://localhost:3000`.

<br/>

## 🛠️ Architecture

### Tech Stack
* **Framework:** Next.js 15 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS + `shadcn/ui`
* **Icons:** Lucide React
* **AI Orchestration:** Google Genkit (`@genkit-ai/*`)
* **Deployment:** Standalone Docker Support available

### Project Structure Highlights
* `src/app/page.tsx` - Main client-side interface and state management.
* `src/app/lib/upscale-actions.ts` - Next.js Server Actions managing secure API bridging.
* `src/ai/flows/upscale-image-with-ai.ts` - Fully orchestrated Genkit AI Flow schema and logic.
* `src/components/ImageComparison.tsx` - Custom, mobile-friendly Before/After drag comparison UI.

<br/>

## 📖 Usage Guide

1. **Configure Settings:** On the left panel (or top on mobile), paste your **Google AI API Key**. Select your desired AI Model, Target Ratio, and Target Resolution (e.g., `4K`).
2. **Upload Images:** Drag and drop or click "Choose Files" to add one or hundreds of images to the queue.
3. **Upscale:** Click individual "Process" buttons, or click the global **"Upscale All"** button at the top of your queue to batch-process in parallel.
4. **Compare & Download:** Scroll down to view the sleek Before & After sliders of your completed results. Download them individually, or pull them all at once using the **"Download All"** button.

<br/>

## ⚙️ Configuration and Environment

### Body Size Limitation
When uploading ultra-high-resolution images, Next.js server actions are configured via `next.config.ts` to accept payloads up to `200mb`:
```typescript
experimental: {
  serverActions: {
    bodySizeLimit: '200mb',
  },
}
```

### Docker Deployment
The project contains pre-configured instructions for containerization.
* Build the image natively via your preferred CI/CD runner.
* Map port `3000` outwards.

---

<div align="center">
  <p>Built with ❤️ by the open source community.</p>
</div>
