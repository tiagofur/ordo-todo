# 🚀 Quick Start Guide - Ordo-Todo

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- npm or yarn

## Setup in 5 Minutes

### 1. Navigate to project
\`\`\`bash
cd C:\Users\tfurt\source\repos\ordo-todo\web
\`\`\`

### 2. Install dependencies (if not done)
\`\`\`bash
npm install
\`\`\`

### 3. Setup PostgreSQL Database

**Option A: Using Docker (Recommended)**
\`\`\`bash
docker run --name ordo-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ordo_todo \
  -p 5432:5432 \
  -d postgres:16
\`\`\`

**Option B: Using Cloud (Free Tier)**
- Go to [Supabase](https://supabase.com) or [Neon](https://neon.tech)
- Create a new project
- Copy the connection string

### 4. Configure Environment Variables
The `.env.local` file is already created. Update if needed:
\`\`\`env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ordo_todo"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-this-to-a-random-secret"
\`\`\`

### 5. Push Database Schema
\`\`\`bash
npm run db:push
\`\`\`

You should see: ✔ Your database is now in sync with your Prisma schema

### 6. Generate Prisma Client
\`\`\`bash
npm run db:generate
\`\`\`

### 7. Start Development Server
\`\`\`bash
npm run dev
\`\`\`

### 8. Open in Browser
Visit: [http://localhost:3000](http://localhost:3000)

You should see the Ordo-Todo landing page! 🎉

## What's Next?

### Immediate Next Steps:
1. Build the login page (`/auth/login`)
2. Build the signup page (`/auth/signup`)
3. Create the dashboard layout
4. Implement task management UI

### Useful Commands

\`\`\`bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema changes to DB
npm run db:generate  # Generate Prisma Client
npm run db:studio    # Open Prisma Studio (DB GUI)

# Linting
npm run lint         # Run ESLint
\`\`\`

### Open Prisma Studio (Database GUI)
\`\`\`bash
npm run db:studio
\`\`\`
Opens at: [http://localhost:5555](http://localhost:5555)

## Verify Installation

### Check if everything works:

1. **Database Connection**
\`\`\`bash
npm run db:studio
\`\`\`
Should open without errors

2. **Development Server**
\`\`\`bash
npm run dev
\`\`\`
Should start on port 3000

3. **NestJS API**
Visit: http://localhost:3101/api
Should return the API response or 404 if root is not defined.

## Troubleshooting

### Port 3000 already in use
\`\`\`bash
# Kill process on port 3000
npx kill-port 3000
\`\`\`

### Database connection error
- Check PostgreSQL is running: `docker ps` (if using Docker)
- Verify DATABASE_URL in `.env.local`
- Ensure database `ordo_todo` exists

### Prisma errors
\`\`\`bash
# Reset Prisma cache
rm -rf node_modules/.prisma
npm run db:generate
\`\`\`

## Project Structure Quick Reference

\`\`\`
web/
├── src/
│   ├── app/              # Pages & API routes
│   │   ├── api/         # API endpoints
│   │   ├── page.tsx     # Homepage (✅ Done)
│   │   └── layout.tsx   # Root layout (✅ Done)
│   ├── components/       # React components (🔜 Build here)
│   ├── lib/             # Utils & API Client
│   └── styles/          # CSS
└── prisma/
    └── schema.prisma    # Database schema (✅ Done)
\`\`\`

## Need Help?

- **Documentation**: See `README.md` for detailed info
- **Implementation Status**: Check `IMPLEMENTATION_STATUS.md`
- **Technical Design**: Review `TECHNICAL_DESIGN.md`
- **PRD**: See `PRD.md` for product details

## Ready to Code! 🎨

The backend is ready. Now let's build the UI!

Start with:
1. Create `/auth/login` page
2. Create `/auth/signup` page  
3. Build dashboard layout

Happy coding! 🚀
