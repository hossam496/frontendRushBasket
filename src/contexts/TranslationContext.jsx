import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import translateService from '../services/translateService';

const TranslationContext = createContext();

export const useTranslate = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslate must be used within a TranslationProvider');
  }
  return context;
};

export const TranslationProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });
  
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRTL, setIsRTL] = useState(false);

  // Update document direction and language
  const updateDocumentSettings = useCallback((language) => {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    const isRtl = rtlLanguages.includes(language);
    
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Update font for Arabic
    if (language === 'ar') {
      document.body.style.fontFamily = "'Tajawal', 'Cairo', 'Almarai', sans-serif";
    } else {
      document.body.style.fontFamily = '';
    }
    
    setIsRTL(isRtl);
  }, []);

  // Initialize language settings
  useEffect(() => {
    updateDocumentSettings(currentLanguage);
  }, [currentLanguage, updateDocumentSettings]);

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage]);

  // Translate text function
  const translate = useCallback(async (text, targetLanguage = currentLanguage) => {
    if (!text || !text.trim()) return text;
    
    // If target is English (base language), return original text
    if (targetLanguage === 'en') return text;
    
    // Create cache key
    const cacheKey = `${text}-${targetLanguage}`;
    
    // Check if we already have this translation
    if (translations[cacheKey]) {
      return translations[cacheKey];
    }
    
    setIsLoading(true);
    
    try {
      const translatedText = await translateService.translateText(text, targetLanguage);
      
      // Store in state
      setTranslations(prev => ({
        ...prev,
        [cacheKey]: translatedText
      }));
      
      return translatedText;
    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage, translations]);

  // Translate multiple texts at once
  const translateMultiple = useCallback(async (texts, targetLanguage = currentLanguage) => {
    if (!texts || !texts.length) return [];
    
    // If target is English, return original texts
    if (targetLanguage === 'en') return texts;
    
    setIsLoading(true);
    
    try {
      const translatedTexts = await translateService.translateMultiple(texts, targetLanguage);
      
      // Store in state
      const newTranslations = {};
      translatedTexts.forEach((translatedText, index) => {
        const cacheKey = `${texts[index]}-${targetLanguage}`;
        newTranslations[cacheKey] = translatedText;
      });
      
      setTranslations(prev => ({
        ...prev,
        ...newTranslations
      }));
      
      return translatedTexts;
    } catch (error) {
      console.error('Batch translation failed:', error);
      return texts;
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage]);

  // Change language function
  const changeLanguage = useCallback((language) => {
    if (translateService.isLanguageSupported(language)) {
      setCurrentLanguage(language);
    } else {
      console.warn(`Language ${language} is not supported`);
    }
  }, []);

  // Get supported languages
  const getSupportedLanguages = useCallback(() => {
    return translateService.getSupportedLanguages();
  }, []);

  // Clear translation cache
  const clearCache = useCallback(() => {
    setTranslations({});
    translateService.clearCache();
  }, []);

  // Get current language info
  const getCurrentLanguageInfo = useCallback(() => {
    const supportedLanguages = getSupportedLanguages();
    return {
      code: currentLanguage,
      name: supportedLanguages[currentLanguage] || 'Unknown',
      isRTL
    };
  }, [currentLanguage, isRTL, getSupportedLanguages]);

  const value = {
    currentLanguage,
    changeLanguage,
    translate,
    translateMultiple,
    isLoading,
    isRTL,
    getSupportedLanguages,
    clearCache,
    getCurrentLanguageInfo,
    translations
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

// Higher-order component for automatic translation
export const withTranslation = (Component) => {
  return function TranslatedComponent(props) {
    const { translate, currentLanguage, isLoading } = useTranslate();
    
    return (
      <Component 
        {...props} 
        translate={translate}
        currentLanguage={currentLanguage}
        isTranslating={isLoading}
      />
    );
  };
};
