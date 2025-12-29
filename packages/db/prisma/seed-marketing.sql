-- Seed Marketing Data for Ordo Todo

-- Roadmap Items
INSERT INTO "RoadmapItem" (id, title, description, status, "totalVotes", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid()::text, 'AI-Powered Task Prioritization', 'Let AI analyze your tasks and suggest the best order to tackle them based on deadlines, importance, and your work patterns.', 'IN_PROGRESS', 42, NOW(), NOW()),
  (gen_random_uuid()::text, 'Mobile Offline Mode', 'Work on your tasks even without internet connection. All changes will sync automatically when you''re back online.', 'PLANNED', 38, NOW(), NOW()),
  (gen_random_uuid()::text, 'Calendar Integration', 'Two-way sync with Google Calendar, Outlook, and Apple Calendar. See your tasks alongside your meetings.', 'PLANNED', 35, NOW(), NOW()),
  (gen_random_uuid()::text, 'Team Collaboration Features', 'Share workspaces, assign tasks to team members, and track progress together in real-time.', 'IN_PROGRESS', 31, NOW(), NOW()),
  (gen_random_uuid()::text, 'Custom Themes & Appearance', 'Create your own color schemes and themes. Personalize the look and feel of your workspace.', 'CONSIDERING', 28, NOW(), NOW()),
  (gen_random_uuid()::text, 'Recurring Task Templates', 'Set up templates for tasks that repeat daily, weekly, or monthly. Spend less time on repetitive setup.', 'COMPLETED', 45, NOW(), NOW()),
  (gen_random_uuid()::text, 'Voice Input for Tasks', 'Add tasks using voice commands. Perfect for when you''re on the go or have your hands full.', 'CONSIDERING', 22, NOW(), NOW()),
  (gen_random_uuid()::text, 'Zapier & Make Integration', 'Connect Ordo Todo with thousands of other apps through Zapier and Make (formerly Integromat).', 'PLANNED', 19, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Changelog Entries
INSERT INTO "ChangelogEntry" (id, version, title, content, type, "publishedAt", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, '2.1.0', 'AI Assistant Improvements', 'Enhanced AI suggestions with context-aware task recommendations. The AI now learns from your habits to suggest better scheduling.', 'NEW', '2024-12-28', NOW(), NOW()),
  (gen_random_uuid()::text, '2.0.5', 'Performance Optimizations', 'Reduced app load time by 40%. Fixed memory leaks in the timer component. Improved database query efficiency.', 'IMPROVED', '2024-12-20', NOW(), NOW()),
  (gen_random_uuid()::text, '2.0.4', 'Bug Fixes', 'Fixed issue where tasks would disappear after sync. Resolved calendar view rendering issues on Safari.', 'FIXED', '2024-12-15', NOW(), NOW()),
  (gen_random_uuid()::text, '2.0.0', 'Ordo Todo 2.0 Launch', 'Complete redesign with new UI, AI assistant, habit tracking, and much more. This is our biggest update ever!', 'NEW', '2024-12-01', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- FAQs
INSERT INTO "FAQ" (id, question, answer, category, "order", published, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'What is Ordo Todo?', 'Ordo Todo is a productivity platform powered by AI that helps you organize tasks, manage projects, and optimize your workflow. It includes features like Pomodoro timers, habit tracking, and AI-powered scheduling.', 'General', 1, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Is there a free plan?', 'Yes! Ordo Todo offers a generous free plan that includes unlimited tasks, basic projects, and access to the Pomodoro timer. Premium features like AI assistance and team collaboration require a paid subscription.', 'Billing', 1, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'How does the AI assistant work?', 'Our AI assistant analyzes your tasks, deadlines, and work patterns to suggest optimal scheduling. It can help prioritize your work, estimate task durations, and even draft subtasks for complex projects.', 'Features', 1, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Can I use Ordo Todo offline?', 'The mobile app supports offline mode (coming soon). Any changes you make offline will automatically sync when you reconnect to the internet.', 'Features', 2, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Is my data secure?', 'Absolutely. We use bank-level encryption (AES-256) for all data at rest and in transit. Your data is stored in secure data centers with regular backups. We never share your personal information with third parties.', 'Privacy & Security', 1, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'How do I cancel my subscription?', 'You can cancel your subscription at any time from your account settings. After cancellation, you''ll continue to have access to premium features until the end of your billing period.', 'Billing', 2, true, NOW(), NOW())
ON CONFLICT DO NOTHING;
