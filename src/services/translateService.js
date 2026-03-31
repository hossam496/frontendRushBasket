/**
 * Google Cloud Translation API Service
 * Handles automatic translation of text using Google Cloud Translation API
 */

class TranslateService {
  constructor() {
    this.cache = new Map();
    this.apiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
    this.baseUrl = 'https://translation.googleapis.com/language/translate/v2';
    this.supportedLanguages = {
      en: 'English',
      ar: 'Arabic',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      zh: 'Chinese',
      hi: 'Hindi',
      pt: 'Portuguese',
      ru: 'Russian',
      ja: 'Japanese'
    };
  }

  /**
   * Translate text using Google Cloud Translation API
   * @param {string} text - Text to translate
   * @param {string} targetLanguage - Target language code (e.g., 'ar', 'en')
   * @param {string} sourceLanguage - Source language code (optional, auto-detected if not provided)
   * @returns {Promise<string>} - Translated text
   */
  async translateText(text, targetLanguage, sourceLanguage = null) {
    if (!text || !text.trim()) {
      return text;
    }

    // Check cache first
    const cacheKey = `${text}-${targetLanguage}-${sourceLanguage || 'auto'}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Don't translate if target is same as source or English (base language)
    if (targetLanguage === 'en' && !sourceLanguage) {
      this.cache.set(cacheKey, text);
      return text;
    }

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target: targetLanguage,
          source: sourceLanguage,
          format: 'text'
        })
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const translatedText = data.data.translations[0].translatedText;

      // Cache the result
      this.cache.set(cacheKey, translatedText);

      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      
      // Return original text if translation fails
      this.cache.set(cacheKey, text);
      return text;
    }
  }

  /**
   * Translate multiple texts at once (batch translation)
   * @param {string[]} texts - Array of texts to translate
   * @param {string} targetLanguage - Target language code
   * @param {string} sourceLanguage - Source language code (optional)
   * @returns {Promise<string[]>} - Array of translated texts
   */
  async translateMultiple(texts, targetLanguage, sourceLanguage = null) {
    const translations = await Promise.all(
      texts.map(text => this.translateText(text, targetLanguage, sourceLanguage))
    );
    return translations;
  }

  /**
   * Get supported languages
   * @returns {Object} - Object with language codes and names
   */
  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  /**
   * Check if a language is supported
   * @param {string} languageCode - Language code to check
   * @returns {boolean} - True if language is supported
   */
  isLanguageSupported(languageCode) {
    return Object.keys(this.supportedLanguages).includes(languageCode);
  }

  /**
   * Clear translation cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache size (for debugging)
   * @returns {number} - Number of cached translations
   */
  getCacheSize() {
    return this.cache.size;
  }

  /**
   * Detect language of text
   * @param {string} text - Text to detect language for
   * @returns {Promise<string>} - Detected language code
   */
  async detectLanguage(text) {
    try {
      const response = await fetch(`${this.baseUrl}/detect?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text
        })
      });

      if (!response.ok) {
        throw new Error(`Language detection error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.detections[0][0].language;
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en'; // Default to English
    }
  }
}

// Create singleton instance
const translateService = new TranslateService();

export default translateService;
