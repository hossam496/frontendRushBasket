import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Basic structure for translations (translation keys)
const resources = {
    en: {
        translation: {
            "greeting": "Hello World!",
            "description": "This is a basic example of internationalization.",
            "switch_lang": "Switch to Arabic"
        }
    },
    ar: {
        translation: {
            "greeting": "مرحباً بالعالم!",
            "description": "هذا مثال بسيط على التدويل.",
            "switch_lang": "Switch to English"
        }
    }
};

i18n
    .use(LanguageDetector) // detect user language
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        fallbackLng: 'en', // Set English as the fallback language
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

const updateDocumentSettings = (lng) => {
    document.body.dir = i18n.dir(lng);

    // Switch to a Sans-Serif Arabic font when language is AR
    if (lng === 'ar') {
        document.body.style.fontFamily = "'Tajawal', 'Cairo', 'Almarai', sans-serif";
    } else {
        // Reset to existing default font for English (or explicitly set your En font)
        document.body.style.fontFamily = '';
    }
};

// Crucial: When switching to Arabic, ensure document direction changes to RTL, and LTR for English.
i18n.on('languageChanged', (lng) => {
    updateDocumentSettings(lng);
});

// Set the initial direction based on the detected or fallback language
updateDocumentSettings(i18n.language);

export default i18n;
