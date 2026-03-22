import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  ogImage, 
  ogUrl, 
  noIndex = false,
  product = null,
  type = 'website'
}) => {
  const siteTitle = 'RushBasket - Premium E-commerce';
  const siteDescription = 'Discover premium products at RushBasket. Quality items, fast delivery, and exceptional service.';
  const baseUrl = 'https://frontend-rush-basket.vercel.app/';
  
  const finalTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const finalDescription = description || siteDescription;
  const finalKeywords = keywords || 'ecommerce, shopping, premium products, online store, rushbasket';
  const finalOgImage = ogImage || `${baseUrl}/logo.png`;
  const finalOgUrl = ogUrl || baseUrl;

  // Structured data for product
  const structuredData = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || finalDescription,
    "image": product.imageUrl,
    "brand": {
      "@type": "Brand",
      "name": "RushBasket"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  } : {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteTitle,
    "description": siteDescription,
    "url": baseUrl
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content="RushBasket" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.googleapis.com; connect-src 'self' https://api.stripe.com https://backend1-eight-lovat.vercel.app" />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {!noIndex && <meta name="robots" content="index, follow" />}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:url" content={finalOgUrl} />
      <meta property="og:site_name" content="RushBasket" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalOgImage} />
      
      {/* Additional SEO */}
      <meta name="theme-color" content="#10b981" />
      <meta name="msapplication-TileColor" content="#10b981" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={finalOgUrl} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://api.stripe.com" />
    </Helmet>
  );
};

export default SEOHead;
