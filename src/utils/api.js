/**
 * API Utility Functions for Morse Code Backend
 */

import { API_BASE } from '../constants';

/**
 * Get all supported languages from backend
 */
export const getSupportedLanguages = async () => {
  try {
    const response = await fetch(`${API_BASE}/morse/supported-languages`);
    const data = await response.json();
    return data.languages || [];
  } catch (error) {
    console.error('Failed to fetch languages:', error);
    return [];
  }
};

/**
 * Detect language of text using Gemini API
 */
export const detectLanguage = async (text) => {
  try {
    const response = await fetch(`${API_BASE}/morse/detect-language`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await response.json();
    return data.detectedLanguage || 'english';
  } catch (error) {
    console.error('Language detection failed:', error);
    return 'english';
  }
};

/**
 * Encode text to morse and get encrypted file
 */
export const encodeToMorse = async (text, language, token) => {
  try {
    const response = await fetch(`${API_BASE}/morse/encode`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        language: language || undefined
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Encoding failed');
    }

    return await response.blob();
  } catch (error) {
    console.error('Encoding error:', error);
    throw error;
  }
};

/**
 * Encode text and save to database
 */
export const encodeAndSave = async (text, language, fileName, token) => {
  try {
    const response = await fetch(`${API_BASE}/morse/encode-save`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        language: language || undefined,
        fileName
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Encoding failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Encoding error:', error);
    throw error;
  }
};

/**
 * Decode morse from encrypted file
 */
export const decodeFromMorse = async (file, language, token) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language || 'english');

    const response = await fetch(`${API_BASE}/morse/decode`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Decoding failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Decoding error:', error);
    throw error;
  }
};

/**
 * Decode morse from file and save to database
 */
export const decodeAndSave = async (file, language, fileName, token) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language || 'english');
    formData.append('fileName', fileName);

    const response = await fetch(`${API_BASE}/morse/decode-save`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Decoding failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Decoding error:', error);
    throw error;
  }
};

/**
 * Download morse file
 */
export const downloadFile = (blob, fileName) => {
  try {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'morse.enc';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

export default {
  getSupportedLanguages,
  detectLanguage,
  encodeToMorse,
  encodeAndSave,
  decodeFromMorse,
  decodeAndSave,
  downloadFile
};
