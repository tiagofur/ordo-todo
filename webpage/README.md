# Ordo-Todo Promotional Website

A modern, multilingual promotional website for Ordo-Todo built with Astro 5, featuring AI-powered task management capabilities.

## 🚀 Features

- **Multilingual Support**: English, Spanish, and Portuguese (Brazil)
- **Static Generation**: Blazing fast performance with Astro's static site generation
- **Islands Architecture**: Interactive components only where needed
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **SEO Optimized**: Complete meta tags, hreflang, and sitemap
- **Dark Mode**: System-aware theme switching
- **Type Safety**: Full TypeScript implementation

## 🛠️ Tech Stack

- **Framework**: Astro 5
- **Languages**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Custom Astro components with React islands
- **Content**: Astro Content Collections
- **Deployment**: Static site ready for any hosting

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── layout/        # Header, Footer, SEO
│   ├── islands/       # Interactive React components
│   └── sections/      # Page sections
├── content/
│   ├── pages/         # Page content by language
│   ├── blog/          # Blog posts
│   ├── features/      # Feature descriptions
│   └── testimonials/  # Customer testimonials
├── i18n/            # Internationalization
├── layouts/          # Page layouts
└── pages/            # Route pages
```

## 🌍 Languages

- **English** (`/en/`) - Default language
- **Spanish** (`/es/`)
- **Portuguese Brazil** (`/pt-br/`)

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Content Management

Content is managed through Astro Content Collections:

### Pages

Edit page content in `src/content/pages/{lang}/`

### Blog Posts

Add new posts in `src/content/blog/{lang}/`

### Features

Update feature descriptions in `src/content/features/`

### Testimonials

Add customer testimonials in `src/content/testimonials/`

## 🎨 Customization

### Colors

Edit CSS variables in `src/layouts/BaseLayout.astro`:

```css
:root {
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --color-accent: #10b981;
}
```

### Typography

Font families are defined in the global styles.

### Components

All components are modular and reusable. Check `src/components/` for available components.

## 📊 Analytics

The site is ready for analytics integration. Add your tracking script to `src/layouts/BaseLayout.astro`.

## 🚀 Deployment

### Netlify

```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Vercel

```bash
npm run build
# Deploy dist/ folder to Vercel
```

### Any Static Hosting

The site generates static files in `dist/` ready for any static hosting service.

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript for all new code
3. Ensure responsive design
4. Test on all language variants
5. Keep performance in mind

## 📄 License

This project is part of the Ordo-Todo ecosystem.
