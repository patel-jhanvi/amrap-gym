// src/utils/imageUtils.ts

// The name of the generic fallback image (must be in public/images/gyms/)
const FALLBACK_IMAGE_NAME = 'gym-placeholder.jpg';

/**
 * Generates the correct image path for a gym based on its name.
 * It assumes custom image filenames match the normalized name.
 * @param gymName - The name of the gym (e.g., "NEU Fitness").
 * @returns The public URL path to the image.
 */
export const getGymImagePath = (gymName: string): string => {
    // 1. Sanitize the gym name for use as a filename (e.g., "NEU Fitness" -> "neu-fitness")
    const normalizedName = gymName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-'); // Replaces spaces/special chars with hyphens

    // 2. Construct the specific image path
    const customImagePath = `/images/gyms/${normalizedName}.jpg`;

    // Return the specific path, relying on the component's error handler for the fallback
    return customImagePath;
};

// We will export the fallback path separately for use in the component's fallback logic
export const FALLBACK_IMAGE_PATH = `/images/gyms/${FALLBACK_IMAGE_NAME}`;