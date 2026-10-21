-- Seed Marketing Data for Ordo Todo

-- Roadmap Items
INSERT INTO "RoadmapItem" (id, title, description, status, "totalVotes", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid()::text, 'AI-Powered Task Prioritization', 'Let AI analyze your tasks and suggest the best order to tackle them based on deadlines, importance, and your work patterns.', 'IN_PROGRESS', 42, NOW(), NOW()),
  (gen_random_uuid()::text, 'Mobile Offline Mode', 'Work on your tasks even without internet connection. All changes will sync automatically when you''re back online.', 'PLANNED', 38, NOW(), NOW()),
  (gen_random_uuid()::text, 'Calendar Integration', 'Two-way sync with Google Calendar and Outlook. See your tasks alongside your meetings.', 'COMPLETED', 35, NOW(), NOW()),
  (gen_random_uuid()::text, 'Team Collaboration Features', 'Share workspaces, assign tasks to team members, and track progress together.', 'IN_PROGRESS', 31, NOW(), NOW()),
  (gen_random_uuid()::text, 'Custom Themes & Appearance', 'Create your own color schemes and themes. Personalize the look and feel of your workspace.', 'CONSIDERING', 28, NOW(), NOW()),
  (gen_random_uuid()::text, 'Recurring Task Templates', 'Set up templates for tasks that repeat daily, weekly, or monthly. Spend less time on repetitive setup.', 'COMPLETED', 45, NOW(), NOW()),
  (gen_random_uuid()::text, 'Voice Input for Tasks', 'Add tasks using voice commands. Perfect for when you''re on the go or have your hands full.', 'CONSIDERING', 22, NOW(), NOW()),
  (gen_random_uuid()::text, 'Zapier & Make Integration', 'Public API and webhooks already exist; one-click Zapier/Make templates are still planned.', 'PLANNED', 19, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Changelog Entries (demo seed: the real history lives in GitHub releases)
INSERT INTO "ChangelogEntry" (id, version, title, content, type, "publishedAt", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'unreleased', 'Active development', 'Ordo is under active development. This demo entry ships with fresh installs; the real changelog is published with each GitHub release.', 'NEW', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- FAQs
INSERT INTO "FAQ" (id, question, answer, category, "order", published, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'What is Ordo Todo?', 'Ordo Todo is a productivity platform powered by AI that helps you organize tasks, manage projects, and optimize your workflow. It includes features like Pomodoro timers, habit tracking, and AI-powered scheduling.', 'General', 1, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Is there a free plan?', 'Yes! Everything is currently free while paid plans are in beta: unlimited tasks and full access to the Pomodoro timer. Premium tiers will be announced before billing goes live.', 'Billing', 1, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'How does the AI assistant work?', 'Our AI assistant analyzes your tasks, deadlines, and work patterns to suggest optimal scheduling. It can help prioritize your work, estimate task durations, and even draft subtasks for complex projects.', 'Features', 1, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Can I use Ordo Todo offline?', 'The mobile app supports offline mode (coming soon). Any changes you make offline will automatically sync when you reconnect to the internet.', 'Features', 2, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Is my data secure?', 'Your account is protected with secure sign-in (Google/GitHub OAuth or password), encrypted connections (TLS), and workspace-scoped access controls. We never sell your personal information. A full data policy ships with our enterprise release.', 'Privacy & Security', 1, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'How do I cancel my subscription?', 'There is nothing to cancel yet: billing is not live and every account is currently free.', 'Billing', 2, true, NOW(), NOW())
ON CONFLICT DO NOTHING;
