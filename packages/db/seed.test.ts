/**
 * Seed Data Validation Tests
 *
 * These tests validate seed file structure and data consistency without requiring a database connection.
 * Tests include:
 * - Seed file existence
 * - Seed data structure
 * - Seed data constraints validation
 * - Seed idempotency (can run multiple times)
 * - Marketing seed data validation
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const seedFilePath = join(__dirname, 'prisma/seed.ts');
const seedMarketingFilePath = join(__dirname, 'prisma/seed-marketing.ts');

describe('Main Seed File (seed.ts)', () => {
  let seedContent: string;

  beforeAll(() => {
    if (existsSync(seedFilePath)) {
      seedContent = readFileSync(seedFilePath, 'utf-8');
    }
  });

  describe('Seed File Existence', () => {
    it('should have seed.ts file', () => {
      expect(existsSync(seedFilePath)).toBe(true);
    });

    it('should be a TypeScript file', () => {
      expect(seedFilePath.endsWith('.ts')).toBe(true);
    });

    it('should have non-empty content', () => {
      expect(seedContent.trim().length).toBeGreaterThan(0);
    });
  });

  describe('Seed File Structure', () => {
    it('should import PrismaClient', () => {
      expect(seedContent).toMatch(/import.*PrismaClient/);
    });

    it('should import required enums', () => {
      expect(seedContent).toMatch(/Theme/);
      expect(seedContent).toMatch(/Priority/);
      expect(seedContent).toMatch(/WorkspaceType/);
      expect(seedContent).toMatch(/TaskStatus/);
    });

    it('should export main function', () => {
      expect(seedContent).toMatch(/async function main\(\)/);
      expect(seedContent).toMatch(/main\(\)/);
    });

    it('should handle errors properly', () => {
      expect(seedContent).toMatch(/\.catch\(/);
      expect(seedContent).toMatch(/console\.error/);
    });

    it('should disconnect Prisma client after execution', () => {
      expect(seedContent).toMatch(/\$disconnect/);
    });
  });

  describe('Seed Data - User Creation', () => {
    it('should create demo user', () => {
      expect(seedContent).toMatch(/demo@ordo-todo\.app/);
      expect(seedContent).toMatch(/Demo User/);
      expect(seedContent).toMatch(/demo_user/);
    });

    it('should use upsert for user creation', () => {
      expect(seedContent).toMatch(/prisma\.user\.upsert/);
    });

    it('should create user preferences', () => {
      expect(seedContent).toMatch(/preferences:\s*\{/);
      expect(seedContent).toMatch(/theme:\s*Theme\.AUTO/);
      expect(seedContent).toMatch(/pomodoroDuration:\s*25/);
      expect(seedContent).toMatch(/shortBreakDuration:\s*5/);
      expect(seedContent).toMatch(/longBreakDuration:\s*15/);
    });
  });

  describe('Seed Data - Workspace Creation', () => {
    it('should create default workspace', () => {
      expect(seedContent).toMatch(/Personal/);
      expect(seedContent).toMatch(/personal/);
      expect(seedContent).toMatch(/WorkspaceType\.PERSONAL/);
    });

    it('should check if workspace exists before creating', () => {
      expect(seedContent).toMatch(/prisma\.workspace\.findFirst/);
    });

    it('should use findFirst with workspace query', () => {
      expect(seedContent).toMatch(/where:\s*\{/);
      expect(seedContent).toMatch(/ownerId:\s*user\.id/);
      expect(seedContent).toMatch(/name:\s*"Personal"/);
    });

    it('should set workspace color', () => {
      expect(seedContent).toMatch(/color.*["\#]/);
    });

    it('should set workspace description', () => {
      expect(seedContent).toMatch(/description.*My personal workspace/);
    });
  });

  describe('Seed Data - Workflow Creation', () => {
    it('should create default workflow', () => {
      expect(seedContent).toMatch(/General/);
      expect(seedContent).toMatch(/Default workflow/);
    });

    it('should check if workflow exists before creating', () => {
      expect(seedContent).toMatch(/prisma\.workflow\.findFirst/);
    });

    it('should set workflow position', () => {
      expect(seedContent).toMatch(/position.*0/);
    });

    it('should link workflow to workspace', () => {
      expect(seedContent).toMatch(/workspaceId.*workspace\.id/);
    });
  });

  describe('Seed Data - Project Creation', () => {
    it('should create sample project', () => {
      expect(seedContent).toMatch(/Getting Started/);
      expect(seedContent).toMatch(/getting-started/);
      expect(seedContent).toMatch(/Learn how to use Ordo-Todo/);
    });

    it('should check if project exists before creating', () => {
      expect(seedContent).toMatch(/prisma\.project\.findFirst/);
    });

    it('should link project to workspace and workflow', () => {
      expect(seedContent).toMatch(/workspaceId.*workspace\.id/);
      expect(seedContent).toMatch(/workflowId.*workflow\.id/);
    });

    it('should set project color', () => {
      expect(seedContent).toMatch(/color.*["\#]/);
    });
  });

  describe('Seed Data - Tags Creation', () => {
    it('should create sample tags', () => {
      expect(seedContent).toMatch(/tutorial/);
      expect(seedContent).toMatch(/important/);
    });

    it('should create tags with colors', () => {
      expect(seedContent).toMatch(/\#22c55e/); // Green for tutorial
      expect(seedContent).toMatch(/\#ef4444/); // Red for important
    });

    it('should check if tags exist before creating', () => {
      expect(seedContent).toMatch(/prisma\.tag\.findFirst/);
    });

    it('should link tags to workspace', () => {
      expect(seedContent).toMatch(/workspaceId.*workspace\.id/);
    });
  });

  describe('Seed Data - Tasks Creation', () => {
    it('should create sample tasks', () => {
      expect(seedContent).toMatch(/Welcome to Ordo-Todo/);
      expect(seedContent).toMatch(/Pomodoro Timer/);
      expect(seedContent).toMatch(/Create your first project/);
    });

    it('should check if tasks exist before creating', () => {
      expect(seedContent).toMatch(/prisma\.task\.count/);
    });

    it('should set task priorities', () => {
      expect(seedContent).toMatch(/Priority\.MEDIUM/);
      expect(seedContent).toMatch(/Priority\.HIGH/);
      expect(seedContent).toMatch(/Priority\.LOW/);
    });

    it('should set task estimated minutes', () => {
      expect(seedContent).toMatch(/estimatedMinutes.*25/);
      expect(seedContent).toMatch(/estimatedMinutes.*50/);
    });

    it('should set task positions', () => {
      expect(seedContent).toMatch(/position.*0/);
      expect(seedContent).toMatch(/position.*1/);
      expect(seedContent).toMatch(/position.*2/);
    });

    it('should link tasks to owner and project', () => {
      expect(seedContent).toMatch(/ownerId.*user\.id/);
      expect(seedContent).toMatch(/projectId.*project\.id/);
    });

    it('should use Promise.all for parallel task creation', () => {
      expect(seedContent).toMatch(/Promise\.all\(\[/);
    });

    it('should have task descriptions', () => {
      expect(seedContent).toMatch(/description.*This is your first task/);
      expect(seedContent).toMatch(/description.*Use the timer/);
      expect(seedContent).toMatch(/description.*Organize your tasks/);
    });
  });

  describe('Seed Data - Blog Posts Creation', () => {
    it('should create sample blog posts', () => {
      expect(seedContent).toMatch(/blogPost/);
      expect(seedContent).toMatch(/welcome-to-ordo-todo/);
      expect(seedContent).toMatch(/productivity-tips/);
    });

    it('should check if blog posts exist before creating', () => {
      expect(seedContent).toMatch(/prisma\.blogPost\.count/);
    });

    it('should set blog post metadata', () => {
      expect(seedContent).toMatch(/published.*true/);
      expect(seedContent).toMatch(/publishedAt/);
      expect(seedContent).toMatch(/author.*Ordo Team/);
      expect(seedContent).toMatch(/tags/);
    });

    it('should use idempotent patterns (check before create)', () => {
      // The main seed.ts uses conditional creation (if !exists) instead of skipDuplicates
      expect(seedContent).toMatch(/if \(!/);
      expect(seedContent).toMatch(/prisma\.\w+\.findFirst/);
      expect(seedContent).toMatch(/prisma\.\w+\.count/);
    });
  });

  describe('Seed Idempotency', () => {
    it('should use upsert for user creation', () => {
      expect(seedContent).toMatch(/prisma\.user\.upsert/);
      expect(seedContent).toMatch(/where.*email/);
      expect(seedContent).toMatch(/update/);
      expect(seedContent).toMatch(/create/);
    });

    it('should use findFirst before creating workspace', () => {
      expect(seedContent).toMatch(/prisma\.workspace\.findFirst/);
      expect(seedContent).toMatch(/if \(!workspace\)/);
    });

    it('should use findFirst before creating workflow', () => {
      expect(seedContent).toMatch(/prisma\.workflow\.findFirst/);
      expect(seedContent).toMatch(/if \(!workflow\)/);
    });

    it('should use findFirst before creating project', () => {
      expect(seedContent).toMatch(/prisma\.project\.findFirst/);
      expect(seedContent).toMatch(/if \(!project\)/);
    });

    it('should check count before creating tasks', () => {
      expect(seedContent).toMatch(/prisma\.task\.count/);
      expect(seedContent).toMatch(/if \(tasksCount === 0\)/);
    });

    it('should check count before creating blog posts', () => {
      expect(seedContent).toMatch(/prisma\.blogPost\.count/);
      expect(seedContent).toMatch(/if \(blogCount === 0\)/);
    });
  });

  describe('Seed Console Output', () => {
    it('should log seeding start', () => {
      expect(seedContent).toMatch(/🌱 Seeding database/);
    });

    it('should log user creation', () => {
      expect(seedContent).toMatch(/✅ Created user/);
    });

    it('should log workspace creation', () => {
      expect(seedContent).toMatch(/✅ Created workspace/);
    });

    it('should log workflow creation', () => {
      expect(seedContent).toMatch(/✅ Created workflow/);
    });

    it('should log project creation', () => {
      expect(seedContent).toMatch(/✅ Created project/);
    });

    it('should log tags creation', () => {
      expect(seedContent).toMatch(/✅ Created tags/);
    });

    it('should log tasks creation', () => {
      expect(seedContent).toMatch(/✅ Created sample tasks/);
    });

    it('should log seeding completion', () => {
      expect(seedContent).toMatch(/🎉 Seeding completed/);
    });

    it('should log when data already exists', () => {
      expect(seedContent).toMatch(/ℹ️/);
      expect(seedContent).toMatch(/already exist/);
    });

    it('should log seeding errors', () => {
      expect(seedContent).toMatch(/❌ Seeding failed/);
    });
  });
});

describe('Marketing Seed File (seed-marketing.ts)', () => {
  let seedMarketingContent: string;

  beforeAll(() => {
    if (existsSync(seedMarketingFilePath)) {
      seedMarketingContent = readFileSync(seedMarketingFilePath, 'utf-8');
    }
  });

  describe('Marketing Seed File Existence', () => {
    it('should have seed-marketing.ts file', () => {
      expect(existsSync(seedMarketingFilePath)).toBe(true);
    });

    it('should be a TypeScript file', () => {
      expect(seedMarketingFilePath.endsWith('.ts')).toBe(true);
    });

    it('should have non-empty content', () => {
      expect(seedMarketingContent.trim().length).toBeGreaterThan(0);
    });
  });

  describe('Marketing Seed File Structure', () => {
    it('should import prisma client from src/index', () => {
      expect(seedMarketingContent).toMatch(/import.*prisma.*from.*['"\.\.\/src\/index']/);
    });

    it('should export main function', () => {
      expect(seedMarketingContent).toMatch(/async function main\(\)/);
      expect(seedMarketingContent).toMatch(/main\(\)/);
    });

    it('should handle errors properly', () => {
      expect(seedMarketingContent).toMatch(/\.catch\(/);
      expect(seedMarketingContent).toMatch(/console\.error/);
    });

    it('should disconnect Prisma client after execution', () => {
      expect(seedMarketingContent).toMatch(/\$disconnect/);
      expect(seedMarketingContent).toMatch(/\.finally\(/);
    });
  });

  describe('Marketing Seed Data - Roadmap Items', () => {
    it('should create roadmap items', () => {
      expect(seedMarketingContent).toMatch(/roadmapItem/);
      expect(seedMarketingContent).toMatch(/createMany/);
    });

    it('should create multiple roadmap items', () => {
      const roadmapMatches = seedMarketingContent.match(/title:\s*['"]/g);
      expect(roadmapMatches?.length).toBeGreaterThan(5);
    });

    it('should have roadmap item with AI Prioritization', () => {
      expect(seedMarketingContent).toMatch(/AI-Powered Task Prioritization/);
    });

    it('should have roadmap item with Mobile Offline Mode', () => {
      expect(seedMarketingContent).toMatch(/Mobile Offline Mode/);
    });

    it('should have roadmap item with Calendar Integration', () => {
      expect(seedMarketingContent).toMatch(/Calendar Integration/);
    });

    it('should set roadmap statuses', () => {
      expect(seedMarketingContent).toMatch(/IN_PROGRESS/);
      expect(seedMarketingContent).toMatch(/PLANNED/);
      expect(seedMarketingContent).toMatch(/COMPLETED/);
      expect(seedMarketingContent).toMatch(/CONSIDERING/);
    });

    it('should set roadmap votes', () => {
      expect(seedMarketingContent).toMatch(/totalVotes/);
    });

    it('should use skipDuplicates for roadmap items', () => {
      expect(seedMarketingContent).toMatch(/roadmapItem.*createMany/);
      expect(seedMarketingContent).toMatch(/skipDuplicates.*true/);
    });
  });

  describe('Marketing Seed Data - Changelog Entries', () => {
    it('should create changelog entries', () => {
      expect(seedMarketingContent).toMatch(/changelogEntry/);
      expect(seedMarketingContent).toMatch(/createMany/);
    });

    it('should create multiple changelog entries', () => {
      const changelogMatches = seedMarketingContent.match(/title:\s*['"]/g);
      expect(changelogMatches?.length).toBeGreaterThan(3);
    });

    it('should have changelog versions', () => {
      expect(seedMarketingContent).toMatch(/version:/);
      expect(seedMarketingContent).toMatch(/2\.1\.0/);
      expect(seedMarketingContent).toMatch(/2\.0\.0/);
    });

    it('should have changelog types', () => {
      expect(seedMarketingContent).toMatch(/type:\s*['"]NEW['"]/);
      expect(seedMarketingContent).toMatch(/type:\s*['"]IMPROVED['"]/);
      expect(seedMarketingContent).toMatch(/type:\s*['"]FIXED['"]/);
    });

    it('should have publishedAt dates', () => {
      expect(seedMarketingContent).toMatch(/publishedAt:\s*new Date/);
    });

    it('should use skipDuplicates for changelog', () => {
      expect(seedMarketingContent).toMatch(/changelogEntry.*createMany/);
      expect(seedMarketingContent).toMatch(/skipDuplicates.*true/);
    });
  });

  describe('Marketing Seed Data - FAQs', () => {
    it('should create FAQs', () => {
      expect(seedMarketingContent).toMatch(/fAQ.*createMany/);
    });

    it('should create multiple FAQs', () => {
      const faqMatches = seedMarketingContent.match(/question:\s*['"]/g);
      expect(faqMatches?.length).toBeGreaterThan(3);
    });

    it('should have FAQ categories', () => {
      expect(seedMarketingContent).toMatch(/category:\s*['"]General['"]/);
      expect(seedMarketingContent).toMatch(/category:\s*['"]Billing['"]/);
      expect(seedMarketingContent).toMatch(/category:\s*['"]Features['"]/);
      expect(seedMarketingContent).toMatch(/category:\s*['"]Privacy/);
    });

    it('should have FAQ order', () => {
      expect(seedMarketingContent).toMatch(/order:\s*\d+/);
    });

    it('should have answers for all questions', () => {
      const questionMatches = seedMarketingContent.match(/question:/g);
      const answerMatches = seedMarketingContent.match(/answer:/g);
      expect(answerMatches?.length).toBe(questionMatches?.length);
    });

    it('should use skipDuplicates for FAQs', () => {
      expect(seedMarketingContent).toMatch(/fAQ.*createMany/);
      expect(seedMarketingContent).toMatch(/skipDuplicates.*true/);
    });
  });

  describe('Marketing Seed Data - Blog Posts', () => {
    it('should create blog posts', () => {
      expect(seedMarketingContent).toMatch(/blogPost.*createMany/);
    });

    it('should create multiple blog posts', () => {
      const blogMatches = seedMarketingContent.match(/slug:\s*['"]/g);
      expect(blogMatches?.length).toBeGreaterThan(1);
    });

    it('should have unique slugs', () => {
      expect(seedMarketingContent).toMatch(/getting-started-with-ordo-todo/);
      expect(seedMarketingContent).toMatch(/5-productivity-hacks-for-2025/);
    });

    it('should have blog post titles', () => {
      expect(seedMarketingContent).toMatch(/Getting Started with Ordo Todo/);
      expect(seedMarketingContent).toMatch(/5 Productivity Hacks for 2025/);
    });

    it('should have blog post excerpts', () => {
      expect(seedMarketingContent).toMatch(/excerpt:/);
    });

    it('should have blog post content', () => {
      expect(seedMarketingContent).toMatch(/content:/);
      expect(seedMarketingContent).toMatch(/# Getting Started/);
      expect(seedMarketingContent).toMatch(/## Creating Your First Workspace/);
    });

    it('should have blog post metadata', () => {
      expect(seedMarketingContent).toMatch(/published:\s*true/);
      expect(seedMarketingContent).toMatch(/publishedAt:/);
      expect(seedMarketingContent).toMatch(/author:/);
      expect(seedMarketingContent).toMatch(/category:/);
      expect(seedMarketingContent).toMatch(/tags:/);
      expect(seedMarketingContent).toMatch(/readTime:/);
    });

    it('should use skipDuplicates for blog posts', () => {
      expect(seedMarketingContent).toMatch(/blogPost.*createMany/);
      expect(seedMarketingContent).toMatch(/skipDuplicates.*true/);
    });
  });

  describe('Marketing Seed Console Output', () => {
    it('should log seeding start', () => {
      expect(seedMarketingContent).toMatch(/🚀 Seeding marketing data/);
    });

    it('should log roadmap items creation', () => {
      expect(seedMarketingContent).toMatch(/✅ Created.*roadmap items/);
    });

    it('should log changelog entries creation', () => {
      expect(seedMarketingContent).toMatch(/✅ Created.*changelog entries/);
    });

    it('should log FAQs creation', () => {
      expect(seedMarketingContent).toMatch(/✅ Created.*FAQs/);
    });

    it('should log blog posts creation', () => {
      expect(seedMarketingContent).toMatch(/✅ Created.*blog posts/);
    });

    it('should log seeding completion', () => {
      expect(seedMarketingContent).toMatch(/🎉 Seeding completed/);
    });

    it('should log seeding errors', () => {
      expect(seedMarketingContent).toMatch(/Error seeding:/);
    });
  });

  describe('Marketing Seed Data Quality', () => {
    it('should have realistic roadmap items', () => {
      expect(seedMarketingContent).toMatch(/description/);
      const descriptionMatches = seedMarketingContent.match(/description:/g);
      expect(descriptionMatches?.length).toBeGreaterThan(5);
    });

    it('should have realistic changelog content', () => {
      expect(seedMarketingContent).toMatch(/content/);
      const contentMatches = seedMarketingContent.match(/content:\s*['"]/g);
      expect(contentMatches?.length).toBeGreaterThan(3);
    });

    it('should have helpful FAQ answers', () => {
      const answers = seedMarketingContent.match(/answer:\s*['"]([^'"]+)['"]/g);
      expect(answers?.length).toBeGreaterThan(0);
      answers?.forEach(answer => {
        const answerText = answer.replace(/answer:\s*['"]|['"]/g, '');
        // Answers should be reasonably long
        expect(answerText.length).toBeGreaterThan(50);
      });
    });

    it('should have detailed blog post content', () => {
      const contents = seedMarketingContent.match(/content:\s*`([^`]+)`/g);
      expect(contents?.length).toBeGreaterThan(0);
      contents?.forEach(content => {
        const contentText = content.replace(/content:\s*`|`/g, '');
        // Blog content should be long
        expect(contentText.length).toBeGreaterThan(200);
      });
    });
  });
});

describe('Seed Data Consistency', () => {
  let seedContent: string;
  let seedMarketingContent: string;

  beforeAll(() => {
    if (existsSync(seedFilePath)) {
      seedContent = readFileSync(seedFilePath, 'utf-8');
    }
    if (existsSync(seedMarketingFilePath)) {
      seedMarketingContent = readFileSync(seedMarketingFilePath, 'utf-8');
    }
  });

  describe('Data Types Consistency', () => {
    it('should use correct enum values in seed.ts', () => {
      expect(seedContent).toMatch(/Theme\.AUTO/);
      expect(seedContent).toMatch(/Priority\.MEDIUM/);
      expect(seedContent).toMatch(/WorkspaceType\.PERSONAL/);
    });

    it('should use string literals for statuses in seed-marketing.ts', () => {
      expect(seedMarketingContent).toMatch(/'IN_PROGRESS'/);
      expect(seedMarketingContent).toMatch(/'PLANNED'/);
      expect(seedMarketingContent).toMatch(/'NEW'/);
    });
  });

  describe('Foreign Key Relationships', () => {
    it('should properly link tasks to owner in seed.ts', () => {
      expect(seedContent).toMatch(/ownerId:\s*user\.id/);
    });

    it('should properly link projects to workspace in seed.ts', () => {
      expect(seedContent).toMatch(/workspaceId:\s*workspace\.id/);
    });

    it('should properly link tasks to project in seed.ts', () => {
      expect(seedContent).toMatch(/projectId:\s*project\.id/);
    });

    it('should properly link workflows to workspace in seed.ts', () => {
      expect(seedContent).toMatch(/workflowId:\s*workflow\.id/);
    });

    it('should properly link tags to workspace in seed.ts', () => {
      expect(seedContent).toMatch(/workspaceId:\s*workspace\.id/);
    });
  });

  describe('Data Validation', () => {
    it('should use valid email addresses', () => {
      expect(seedContent).toMatch(/[\w.-]+@[\w.-]+\.\w+/);
    });

    it('should use valid hex color codes', () => {
      expect(seedContent).toMatch(/#[0-9A-Fa-f]{6}/);
    });

    it('should use valid slugs (kebab-case)', () => {
      expect(seedContent).toMatch(/getting-started/);
      expect(seedMarketingContent).toMatch(/getting-started-with-ordo-todo/);
      expect(seedMarketingContent).toMatch(/5-productivity-hacks-for-2025/);
    });

    it('should have reasonable priorities (LOW, MEDIUM, HIGH, URGENT)', () => {
      expect(seedContent).not.toContain('invalid_priority');
    });
  });

  describe('Seed File Completeness', () => {
    it('should seed all core entities in seed.ts', () => {
      expect(seedContent).toMatch(/user/);
      expect(seedContent).toMatch(/workspace/);
      expect(seedContent).toMatch(/workflow/);
      expect(seedContent).toMatch(/project/);
      expect(seedContent).toMatch(/tag/);
      expect(seedContent).toMatch(/task/);
      expect(seedContent).toMatch(/blogPost/);
    });

    it('should seed all marketing entities in seed-marketing.ts', () => {
      expect(seedMarketingContent).toMatch(/roadmapItem/);
      expect(seedMarketingContent).toMatch(/changelogEntry/);
      expect(seedMarketingContent).toMatch(/fAQ/);
      expect(seedMarketingContent).toMatch(/blogPost/);
    });
  });
});
