# Social Media Assets Setup Guide

## Required Images for Complete Branding

### 1. Open Graph Image (`og-image.png`)
- **Dimensions**: 1200 x 630 pixels
- **Purpose**: Displays when sharing on social media (Facebook, LinkedIn, WhatsApp)
- **Content Suggestions**:
  - Ryso logo prominently displayed
  - "Smart Money Companion for Students" tagline
  - IIT Guwahati logo/mention for credibility
  - Clean, modern design with brand colors
  - Include brain icon (🧠) representing intelligence

### 2. Favicon Package
- **favicon.ico**: 32x32 pixels (classic favicon)
- **favicon-32x32.png**: 32x32 pixels PNG
- **favicon-16x16.png**: 16x16 pixels PNG
- **apple-touch-icon.png**: 180x180 pixels (iOS home screen)

### 3. Brand Colors to Use
- **Primary Blue**: #0D94FB
- **Primary Dark**: #0066CC
- **Success Green**: #10B981
- **Background**: #F8FAFC

## Current Metadata Structure

The HTML file now includes:

```html
<!-- Open Graph Tags -->
<meta property="og:title" content="Ryso - Smart Money Companion for Students" />
<meta property="og:description" content="Transform financial stress into financial confidence..." />
<meta property="og:image" content="https://ryso.vercel.app/og-image.png" />
<meta property="og:url" content="https://ryso.vercel.app" />

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://ryso.vercel.app/og-image.png" />

<!-- SEO Meta Tags -->
<meta name="keywords" content="student finance, money management, budget tracking..." />
<meta name="theme-color" content="#0D94FB" />
```

## File Placement

Place all images in the `public/` directory:
```
public/
├── favicon.ico
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png
└── og-image.png
```

## Design Tips for og-image.png

1. **Layout**: Use a clean, professional layout
2. **Text**: Make text large enough to read in small previews
3. **Branding**: Include both Ryso and IIT Guwahati branding
4. **Colors**: Use the brand color palette
5. **Icon**: Include the brain icon to represent intelligence/mentorship

## Verification

After adding images, test social sharing on:
- Facebook Sharing Debugger
- Twitter Card Validator
- LinkedIn Post Inspector

## Benefits

✅ Professional appearance when shared on social media  
✅ Improved SEO with proper meta tags  
✅ Enhanced credibility with IIT Guwahati mention  
✅ Consistent branding across all platforms  
✅ Better user experience with proper favicons
