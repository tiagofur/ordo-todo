-- ============================================
-- ORDO TODO MARKETING DATA - PRODUCTION SEED
-- ============================================
-- Run this script against production database to populate marketing content
-- Command: npx prisma db execute --file prisma/seed-production.sql

-- ============================================
-- ROADMAP ITEMS
-- ============================================
DELETE FROM "RoadmapVote";
DELETE FROM "RoadmapItem";

INSERT INTO "RoadmapItem" (id, title, description, status, "totalVotes", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid()::text, 'AI-Powered Task Prioritization', 'Let AI analyze your tasks and suggest the best order to tackle them based on deadlines, importance, and your work patterns.', 'IN_PROGRESS', 42, NOW(), NOW()),
  (gen_random_uuid()::text, 'Mobile Offline Mode', 'Work on your tasks even without internet connection. All changes will sync automatically when you''re back online.', 'PLANNED', 38, NOW(), NOW()),
  (gen_random_uuid()::text, 'Calendar Integration', 'Two-way sync with Google Calendar and Outlook. See your tasks alongside your meetings.', 'COMPLETED', 35, NOW(), NOW()),
  (gen_random_uuid()::text, 'Team Collaboration Features', 'Share workspaces, assign tasks to team members, and track progress together.', 'IN_PROGRESS', 31, NOW(), NOW()),
  (gen_random_uuid()::text, 'Custom Themes & Appearance', 'Create your own color schemes and themes. Personalize the look and feel of your workspace.', 'CONSIDERING', 28, NOW(), NOW()),
  (gen_random_uuid()::text, 'Recurring Task Templates', 'Set up templates for tasks that repeat daily, weekly, or monthly. Spend less time on repetitive setup.', 'COMPLETED', 45, NOW(), NOW()),
  (gen_random_uuid()::text, 'Voice Input for Tasks', 'Add tasks using voice commands. Perfect for when you''re on the go or have your hands full.', 'CONSIDERING', 22, NOW(), NOW()),
  (gen_random_uuid()::text, 'Zapier & Make Integration', 'Public API and webhooks already exist; one-click Zapier/Make templates are still planned.', 'PLANNED', 19, NOW(), NOW());

-- ============================================
-- FAQ
-- ============================================
DELETE FROM "FAQ";

-- General FAQs
INSERT INTO "FAQ" (id, question, answer, category, "order", published, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'What is Ordo Todo?', 'Ordo Todo is an all-in-one productivity platform that combines task management, time tracking, focus tools, and AI-powered scheduling. It helps you organize your work and life in one place.', 'General', 1, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Is there a free plan?', 'Yes! Ordo Todo offers a generous free plan that includes unlimited tasks, 3 projects, Pomodoro timer, and basic analytics. You can upgrade anytime for more features.', 'General', 2, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Can I use Ordo Todo on multiple devices?', 'Absolutely! Ordo Todo is available on Web, Desktop (Windows, Mac, Linux), and Mobile (iOS, Android). Your data syncs automatically across all your devices in real-time.', 'General', 3, true, NOW(), NOW());

-- Features FAQs
INSERT INTO "FAQ" (id, question, answer, category, "order", published, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'How does the AI scheduling work?', 'Our AI analyzes your work patterns, energy levels, and task complexity to suggest optimal times for each task. It learns from your behavior to provide increasingly accurate recommendations.', 'Features', 1, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'What is the Eisenhower Matrix?', 'The Eisenhower Matrix is a prioritization framework that categorizes tasks by urgency and importance. Ordo Todo provides a built-in Eisenhower view to help you focus on what matters most.', 'Features', 2, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Can I collaborate with my team?', 'Yes! You can create shared workspaces, assign tasks to team members, leave comments, and track team progress. Team features are available on Pro and Team plans.', 'Features', 3, true, NOW(), NOW());

-- Billing FAQs
INSERT INTO "FAQ" (id, question, answer, category, "order", published, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'What payment methods do you accept?', 'Billing is not live yet: all features are currently free while paid plans are in beta. We will announce supported payment methods before charging anything.', 'Billing', 1, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Can I cancel my subscription anytime?', 'There is nothing to cancel yet: billing is not live and every account is currently free. Paid plans are in beta and subject to change.', 'Billing', 2, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Is there a money-back guarantee?', 'There is nothing to refund yet: billing is not live. When paid plans launch, the refund policy will be published here first.', 'Billing', 3, true, NOW(), NOW());

-- Privacy & Security FAQs
INSERT INTO "FAQ" (id, question, answer, category, "order", published, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'How is my data protected?', 'Your account is protected with secure sign-in (Google/GitHub OAuth or password), encrypted connections (TLS), and workspace-scoped access controls. A full data policy ships with our enterprise release.', 'Privacy & Security', 1, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Do you sell my data?', 'Never. Your data is yours. We don''t sell, share, or monetize your personal information. Our business model is based on subscriptions, not advertising.', 'Privacy & Security', 2, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Can I export my data?', 'Yes! You can export all your data at any time in JSON format from your profile. We believe in data portability and never lock you in.', 'Privacy & Security', 3, true, NOW(), NOW());

-- ============================================
-- CHANGELOG
-- ============================================
DELETE FROM "ChangelogEntry";

INSERT INTO "ChangelogEntry" (id, version, title, content, type, "publishedAt", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'unreleased', 'Active development', 'Ordo is under active development. This demo entry ships with fresh installs; the real changelog is published with each GitHub release.', 'NEW', NOW(), NOW(), NOW());

-- ============================================
-- BLOG POSTS
-- ============================================
DELETE FROM "BlogComment";
DELETE FROM "BlogPost";

-- Article 1: Getting Started Guide
INSERT INTO "BlogPost" (id, slug, title, excerpt, content, "coverImage", published, "publishedAt", author, category, tags, "readTime", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'getting-started-with-ordo-todo',
  'Getting Started with Ordo Todo: Your Complete Guide',
  'Learn how to set up your workspace, create your first tasks, and master the productivity features that will transform your workflow.',
  '# Getting Started with Ordo Todo

Welcome to Ordo Todo! This comprehensive guide will walk you through everything you need to know to get started with your new productivity companion.

## Setting Up Your Workspace

When you first log in, you''ll be greeted by your personal workspace. Think of it as your digital command center where all your tasks, projects, and goals live together.

### Creating Your First Project

1. Click the **"+ New Project"** button in the sidebar
2. Give your project a name and description
3. Choose a color to make it easy to identify
4. Set your project deadline (optional but recommended)

## Understanding Tasks

Tasks are the building blocks of your productivity system. Here''s how to make the most of them:

### Task Properties

- **Priority**: Set from P1 (critical) to P4 (low priority)
- **Due Date**: When the task needs to be completed
- **Estimated Time**: How long you think it will take
- **Tags**: Categorize tasks for easy filtering

### Quick Task Creation

Press `N` anywhere in the app to quickly create a new task. Use natural language like "Review proposal tomorrow at 2pm" and our AI will parse the date and time automatically.

## The Pomodoro Timer

Stay focused with our built-in Pomodoro timer:

1. Select a task you want to work on
2. Click the **Start Focus** button
3. Work for 25 minutes of uninterrupted focus
4. Take a 5-minute break
5. Repeat!

After 4 pomodoros, take a longer 15-30 minute break.

## AI-Powered Scheduling

One of Ordo Todo''s most powerful features is AI scheduling:

- The AI learns your work patterns
- Suggests optimal times for different task types
- Automatically reschedules when you fall behind
- Respects your energy levels throughout the day

## Mobile Sync

Your tasks sync automatically across all devices. Download the mobile app to:

- Capture ideas on the go
- Check off tasks from anywhere
- Receive smart reminders
- Track your daily progress

## Tips for Success

1. **Start small**: Don''t try to organize your entire life on day one
2. **Use the daily review**: Spend 5 minutes each morning planning your day
3. **Celebrate wins**: Mark tasks complete and watch your productivity stats grow
4. **Be consistent**: The best productivity system is the one you actually use

Happy organizing! 🎯',
  'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&q=80',
  true,
  '2024-12-28T10:00:00Z',
  'Ordo Team',
  'Guide',
  ARRAY['getting-started', 'tutorial', 'productivity', 'beginner'],
  8,
  NOW(),
  NOW()
);

-- Article 2: Productivity Tips
INSERT INTO "BlogPost" (id, slug, title, excerpt, content, "coverImage", published, "publishedAt", author, category, tags, "readTime", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  '10-productivity-tips-for-2025',
  '10 Science-Backed Productivity Tips for 2025',
  'Discover the research-proven strategies that top performers use to get more done in less time, without burning out.',
  '# 10 Science-Backed Productivity Tips for 2025

As we enter 2025, it''s the perfect time to upgrade your productivity habits. These aren''t just theories – they''re strategies backed by research and used by high performers worldwide.

## 1. Time Blocking (Not To-Do Lists)

Research from Cal Newport shows that time blocking is 50% more effective than traditional to-do lists. Instead of writing "work on presentation," schedule "9:00-11:00 AM: Presentation work."

## 2. The Two-Minute Rule

From David Allen''s Getting Things Done: if a task takes less than two minutes, do it immediately. The mental energy of tracking small tasks often exceeds the energy to complete them.

## 3. Energy Management > Time Management

Your energy fluctuates throughout the day. Schedule:
- **High-focus work** during your peak hours (usually morning)
- **Meetings and calls** during medium-energy times
- **Admin tasks** during low-energy periods

Ordo Todo''s AI learns your patterns and suggests optimal scheduling automatically.

## 4. The 52-17 Rule

A study of top performers found they work in 52-minute sprints followed by 17-minute breaks. This rhythm outperformed both continuous work and the traditional Pomodoro technique.

## 5. Single-Tasking is a Superpower

Multitasking reduces productivity by up to 40% (American Psychological Association). When you start a task, stick with it until completion or your timer ends.

## 6. The Weekly Review

Spend 30 minutes every Friday:
- Review completed tasks (celebrate wins!)
- Process inbox to zero
- Plan next week''s priorities
- Identify blockers and dependencies

This habit alone can 2x your weekly output.

## 7. Eat the Frog First

Mark Twain said: "Eat a live frog first thing in the morning, and nothing worse will happen to you the rest of the day."

Your "frog" is your most important (often most dreaded) task. Tackle it first when willpower is highest.

## 8. Environment Design

Your environment shapes behavior more than motivation:
- Remove phone from workspace
- Use website blockers during focus time
- Keep your workspace clean
- Have everything you need within reach

## 9. The 80/20 Principle

20% of your tasks produce 80% of your results. Identify your high-impact activities and prioritize them ruthlessly.

## 10. Sleep is Non-Negotiable

Research consistently shows that sleep deprivation destroys productivity. 7-9 hours isn''t a luxury – it''s a requirement for peak performance.

## Start Today

You don''t need to implement all 10 tips at once. Pick one that resonates, practice it for two weeks, then add another.

Small consistent improvements compound into massive results.',
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
  true,
  '2024-12-26T14:30:00Z',
  'Ordo Team',
  'Tips',
  ARRAY['productivity', 'tips', '2025', 'science', 'habits'],
  6,
  NOW(),
  NOW()
);

-- ============================================
-- DONE!
-- ============================================
-- To verify data was inserted:
-- SELECT COUNT(*) FROM "RoadmapItem";
-- SELECT COUNT(*) FROM "FAQ";
-- SELECT COUNT(*) FROM "ChangelogEntry";
-- SELECT COUNT(*) FROM "BlogPost";
