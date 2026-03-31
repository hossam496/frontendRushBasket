import React, { useState, useEffect } from 'react';
import { useTranslate } from '../contexts/TranslationContext';

const TranslatedText = ({ 
  text, 
  className = '', 
  as: Component = 'span',
  fallbackText = null,
  showLoading = false,
  ...props 
}) => {
  const { translate, currentLanguage, isLoading } = useTranslate();
  const [translatedText, setTranslatedText] = useState(text);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const translateText = async () => {
      if (!text || !text.trim()) {
        setTranslatedText(text);
        return;
      }

      // If target is English, use original text
      if (currentLanguage === 'en') {
        setTranslatedText(text);
        return;
      }

      setIsTranslating(true);
      
      try {
        const translated = await translate(text, currentLanguage);
        setTranslatedText(translated);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedText(fallbackText || text);
      } finally {
        setIsTranslating(false);
      }
    };

    translateText();
  }, [text, currentLanguage, translate, fallbackText]);

  if (showLoading && isTranslating) {
    return (
      <Component className={`${className} opacity-70`} {...props}>
        {fallbackText || text}
      </Component>
    );
  }

  return (
    <Component className={className} {...props}>
      {translatedText}
    </Component>
  );
};

export default TranslatedText;
