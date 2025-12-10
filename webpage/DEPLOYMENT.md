# Ordo-Todo Promotional Website

## 🚀 Deployment

### Netlify

1. **Build the site**:

   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Drag and drop the `dist/` folder to Netlify
   - Or connect your repository and deploy automatically

### Vercel

1. **Install Vercel CLI**:

   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   cd webpage
   vercel --prod
   ```

### GitHub Pages

1. **Update astro.config.mjs**:

   ```javascript
   export default defineConfig({
     // ... your config
     base: "/ordo-todo/", // if deploying to username.github.io/repo
     output: "static",
     build: {
       format: "directory",
     },
   });
   ```

2. **Build and deploy**:
   ```bash
   npm run build
   # Deploy dist/ folder to gh-pages branch
   ```

### Static Hosting (Apache/Nginx)

1. **Build the site**:

   ```bash
   npm run build
   ```

2. **Upload the `dist/` folder** to your web server

3. **Configure server** to serve index.html for missing files (SPA routing)

## 🌍 Environment Variables

Create `.env.production` for production:

```env
SITE_URL=https://your-domain.com
ANALYTICS_ID=your-analytics-id
```

## 📊 Analytics Integration

Add your analytics script to `src/layouts/BaseLayout.astro` before the closing `</head>` tag:

```astro
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🔍 SEO Checklist

- [ ] Meta titles are unique for each page
- [ ] Meta descriptions are compelling and under 160 characters
- [ ] All images have alt text
- [ ] Open Graph tags are implemented
- [ ] Structured data is added
- [ ] Sitemap is submitted to search engines
- [ ] robots.txt is configured

## 🚀 Performance Optimization

The site is already optimized with:

- Static site generation
- Minimal JavaScript (islands only where needed)
- Optimized images
- Lazy loading for images
- CSS minification

## 📱 PWA Features

To add PWA capabilities:

1. Create a manifest.json in public/
2. Add service worker for offline support
3. Configure app icons

## 🌐 CDN Configuration

For optimal performance globally:

1. Configure CDN to cache static assets
2. Set appropriate cache headers
3. Enable Gzip compression
4. Use HTTP/2 if available
