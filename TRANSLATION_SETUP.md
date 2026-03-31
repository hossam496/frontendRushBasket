# Google Cloud Translation API Setup Guide

This guide will help you set up the automatic translation system for your React e-commerce application using Google Cloud Translation API.

## 🚀 Features Implemented

- ✅ **Automatic Translation**: Real-time translation using Google Cloud Translation API
- ✅ **Language Switcher**: Dropdown and toggle components for language selection
- ✅ **RTL/LTR Support**: Automatic direction switching for Arabic (RTL) and English (LTR)
- ✅ **Translation Caching**: Performance optimization with local caching
- ✅ **React Context**: Global state management for translations
- ✅ **Multiple Components**: Reusable translation components

## 📋 Prerequisites

1. Google Cloud Account
2. React project (already set up)
3. Node.js and npm/yarn installed

## 🔧 Step 1: Set Up Google Cloud Translation API

### 1.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for your project

### 1.2 Enable Cloud Translation API
1. In the Google Cloud Console, navigate to **APIs & Services** > **Library**
2. Search for "**Cloud Translation API**"
3. Click on it and press "**Enable**"

### 1.3 Create API Key
1. Go to **APIs & Services** > **Credentials**
2. Click "**+ CREATE CREDENTIALS**" and select "**API Key**"
3. Copy the generated API key
4. **Important**: Restrict your API key for security:
   - Click on the API key you just created
   - Under "Application restrictions", select "**HTTP referrers**"
   - Add your website domain (e.g., `localhost:3000` for development)
   - Under "API restrictions", select "**Restrict key**" and choose "**Cloud Translation API**"

## 🔧 Step 2: Configure Your React Application

### 2.1 Update Environment Variables
Open the `.env` file in your project root and replace the placeholder:

```env
# Google Cloud Translation API Configuration
REACT_APP_GOOGLE_TRANSLATE_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

Replace `YOUR_ACTUAL_API_KEY_HERE` with the API key you obtained from Google Cloud.

### 2.2 Restart Your Development Server
After updating the `.env` file, restart your development server:

```bash
npm run dev
# or
yarn dev
```

## 🎯 Step 3: Using the Translation System

### 3.1 Basic Usage with TranslatedText Component

```jsx
import TranslatedText from './components/TranslatedText';

function MyComponent() {
  return (
    <div>
      <h1>
        <TranslatedText text="Welcome to our store!" />
      </h1>
      <p>
        <TranslatedText text="Browse our amazing products" />
      </p>
    </div>
  );
}
```

### 3.2 Using the useTranslate Hook

```jsx
import { useTranslate } from './contexts/TranslationContext';

function MyComponent() {
  const { translate, currentLanguage, changeLanguage } = useTranslate();
  
  const [translatedText, setTranslatedText] = useState('Hello World');
  
  useEffect(() => {
    const translateContent = async () => {
      const translated = await translate('Hello World', currentLanguage);
      setTranslatedText(translated);
    };
    
    translateContent();
  }, [currentLanguage, translate]);
  
  return <div>{translatedText}</div>;
}
```

### 3.3 Adding Language Switcher

```jsx
import LanguageSwitcher from './components/LanguageSwitcher';

function MyComponent() {
  return (
    <div>
      {/* Dropdown variant */}
      <LanguageSwitcher variant="dropdown" />
      
      {/* Toggle variant (English/Arabic) */}
      <LanguageSwitcher variant="toggle" />
      
      {/* Custom styling */}
      <LanguageSwitcher className="my-custom-class" />
    </div>
  );
}
```

## 🌍 Supported Languages

The system currently supports these languages:

| Code | Language | RTL Support |
|------|----------|-------------|
| en   | English  | No |
| ar   | Arabic   | Yes |
| es   | Spanish  | No |
| fr   | French   | No |
| de   | German   | No |
| zh   | Chinese  | No |
| hi   | Hindi    | No |
| pt   | Portuguese | No |
| ru   | Russian  | No |
| ja   | Japanese | No |

### Adding More Languages

To add more languages, update the `supportedLanguages` object in `src/services/translateService.js`:

```javascript
const supportedLanguages = {
  en: 'English',
  ar: 'Arabic',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  zh: 'Chinese',
  hi: 'Hindi',
  pt: 'Portuguese',
  ru: 'Russian',
  ja: 'Japanese',
  // Add new languages here
  it: 'Italian',
  ko: 'Korean',
  nl: 'Dutch'
};
```

## 🎨 Styling and RTL Support

### Automatic RTL/LTR Switching
The system automatically switches document direction:
- **Arabic (ar)**: RTL direction with Arabic fonts
- **Other languages**: LTR direction

### Custom RTL Styles
You can add custom RTL styles in your CSS:

```css
/* RTL-specific styles */
[dir="rtl"] .my-component {
  text-align: right;
  padding-left: 0;
  padding-right: 1rem;
}

[dir="ltr"] .my-component {
  text-align: left;
  padding-left: 1rem;
  padding-right: 0;
}
```

## 📊 Performance Optimization

### Translation Caching
The system includes automatic caching to avoid duplicate API calls:
- Translations are cached in memory
- Cache persists during the session
- Cache can be cleared manually:

```javascript
const { clearCache } = useTranslate();
clearCache(); // Clear all cached translations
```

### Best Practices
1. **Minimize API calls**: The system automatically caches translations
2. **Batch translations**: Use `translateMultiple()` for translating multiple texts
3. **Loading states**: Use the `isLoading` state to show loading indicators
4. **Error handling**: The system gracefully falls back to original text on errors

## 🔍 Debugging

### Common Issues

1. **API Key Not Working**
   - Check if the API key is correctly set in `.env`
   - Verify the Cloud Translation API is enabled
   - Check API key restrictions

2. **Translations Not Updating**
   - Ensure the component is wrapped in `TranslationProvider`
   - Check if the language is actually changing
   - Verify the cache is cleared if needed

3. **RTL Not Working**
   - Check if Arabic language code is 'ar'
   - Verify CSS styles are applied correctly

### Debug Tools

```javascript
// Check current language info
const { getCurrentLanguageInfo } = useTranslate();
console.log(getCurrentLanguageInfo());

// Check cache size
const { getCacheSize } = useTranslate();
console.log('Cache size:', getCacheSize());
```

## 🚀 Deployment

### Environment Variables
Make sure to set the environment variables in your hosting platform:

**Vercel:**
```bash
vercel env add REACT_APP_GOOGLE_TRANSLATE_API_KEY
```

**Netlify:**
```bash
netlify env:set REACT_APP_GOOGLE_TRANSLATE_API_KEY "your-api-key"
```

**Docker:**
```dockerfile
ENV REACT_APP_GOOGLE_TRANSLATE_API_KEY=your-api-key
```

### Security Notes
- Never commit your API key to version control
- Use environment variables in production
- Restrict your API key to specific domains
- Monitor API usage in Google Cloud Console

## 📞 Support

If you encounter any issues:

1. Check the Google Cloud Console for API errors
2. Verify your API key and restrictions
3. Check browser console for JavaScript errors
4. Ensure all components are properly wrapped with `TranslationProvider`

## 🔄 Migration from i18next

If you're migrating from the existing i18next setup:

1. Replace `useTranslation()` with `useTranslate()`
2. Replace `t('key')` with `<TranslatedText text="Your text" />`
3. Update language switching logic to use the new `changeLanguage()` function
4. Remove i18next dependencies if no longer needed

The new system provides automatic translation without manual translation files!
