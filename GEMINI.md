# GEMINI.md

## Project Overview

This is a full-stack web application called PixelDraw, built with Next.js, TypeScript, and Tailwind CSS. It provides a suite of AI-powered image processing tools. The application uses Clerk for user authentication and Supabase for the database.

The core features of the application are:

*   **Image Compression:** Compresses images using different modes (smart, extreme, lossless, custom).
*   **Background Removal:** Removes the background from images.
*   **Image Recognition:** Recognizes content in images, including OCR and object detection.
*   **AI Image Generation:** Generates images from text prompts using a Seedream AI model.

## Building and Running

To build and run this project, you need to have Node.js and npm installed.

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at [http://localhost:3000](http://localhost:3000).

3.  **Build for production:**
    ```bash
    npm run build
    ```

4.  **Start the production server:**
    ```bash
    npm run start
    ```

## Development Conventions

*   **Language:** The project is written in TypeScript.
*   **Styling:** Tailwind CSS is used for styling. Utility classes are combined using the `cn` function in `lib/utils.ts`.
*   **Components:** Reusable React components are located in the `components` directory.
*   **API Routes:** Backend API routes are implemented in the `app/api` directory.
*   **Authentication:** Clerk is used for user authentication. Protected routes are defined in `middleware.ts`.
*   **Database:** Supabase is used for the database. The database schema is managed with migrations in the `supabase/migrations` directory.
*   **AI:** The application uses the Seedream AI model for image generation, with the client implemented in `lib/ai/seedream-client.ts`.
