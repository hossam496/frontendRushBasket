import React, { useState } from 'react';
import { useTranslate } from '../contexts/TranslationContext';
import { FiGlobe, FiChevronDown } from 'react-icons/fi';

const LanguageSwitcher = ({ variant = 'dropdown', className = '' }) => {
  const { currentLanguage, changeLanguage, getSupportedLanguages, isLoading } = useTranslate();
  const [isOpen, setIsOpen] = useState(false);
  
  const supportedLanguages = getSupportedLanguages();

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  const getCurrentLanguageDisplay = () => {
    const currentLang = supportedLanguages[currentLanguage] || 'English';
    return currentLang;
  };

  const getLanguageFlag = (languageCode) => {
    const flags = {
      en: '🇺🇸',
      ar: '🇸🇦',
      es: '🇪🇸',
      fr: '🇫🇷',
      de: '🇩🇪',
      zh: '🇨🇳',
      hi: '🇮🇳',
      pt: '🇵🇹',
      ru: '🇷🇺',
      ja: '🇯🇵'
    };
    return flags[languageCode] || '🌐';
  };

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiGlobe className="w-4 h-4" />
          <span className="flex items-center space-x-1">
            <span>{getLanguageFlag(currentLanguage)}</span>
            <span>{getCurrentLanguageDisplay()}</span>
          </span>
          <FiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 z-50 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="py-1">
              {Object.entries(supportedLanguages).map(([code, name]) => (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-3 ${
                    currentLanguage === code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <span className="text-lg">{getLanguageFlag(code)}</span>
                  <span>{name}</span>
                  {currentLanguage === code && (
                    <span className="ml-auto text-blue-600">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Button variant (for English/Arabic toggle)
  if (variant === 'toggle') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <button
          onClick={() => handleLanguageChange('en')}
          disabled={isLoading}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            currentLanguage === 'en'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          🇺🇸 English
        </button>
        <button
          onClick={() => handleLanguageChange('ar')}
          disabled={isLoading}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            currentLanguage === 'ar'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          🇸🇦 العربية
        </button>
      </div>
    );
  }

  // Simple button variant
  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      disabled={isLoading}
      className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <FiGlobe className="w-4 h-4" />
      <span className="flex items-center space-x-1">
        <span>{getLanguageFlag(currentLanguage)}</span>
        <span>{getCurrentLanguageDisplay()}</span>
      </span>
    </button>
  );
};

export default LanguageSwitcher;
