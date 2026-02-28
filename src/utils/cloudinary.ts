"use client";

// Replace these with your actual Cloudinary credentials from your dashboard
const CLOUD_NAME = "demo"; // Replace with your Cloud Name
const UPLOAD_PRESET = "ml_default"; // Replace with your Unsigned Upload Preset

export const uploadToCloudinary = async (file: File | string, resourceType: 'image' | 'video' = 'image'): Promise<string> => {
  const formData = new FormData();
  
  if (typeof file === 'string') {
    // If it's a base64 string from the existing UI
    formData.append('file', file);
  } else {
    formData.append('file', file);
  }
  
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};