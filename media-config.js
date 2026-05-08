/**
 * NA Artistry - Media & Storage Configuration
 */

window.NA_MEDIA_CONFIG = {
    // Primary storage provider
    provider: 'cloudinary',
    
    // Cloudinary Settings
    // Replace with your own cloud name for production
    cloudinary: {
        cloudName: 'demo', // Using 'demo' for initial setup
        uploadPreset: 'ml_default',
        // Optional: Folders and transformations
        folder: 'na_artistry_portfolio',
        autoFormat: true,
        autoQuality: true
    },
    
    // Fallback or secondary providers (Future support)
    firebase: { enabled: false },
    supabase: { enabled: false }
};
