-- Insert FAQ data from current hardcoded mock data
-- Clear existing FAQs first
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
  (gen_random_uuid()::text, 'What payment methods do you accept?', 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual plans. Enterprise customers can also pay by invoice.', 'Billing', 1, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Can I cancel my subscription anytime?', 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period. We don''t offer refunds for partial months.', 'Billing', 2, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Is there a money-back guarantee?', 'Yes! We offer a 30-day money-back guarantee. If you''re not satisfied with Ordo Todo, contact us within 30 days for a full refund.', 'Billing', 3, true, NOW(), NOW());

-- Privacy & Security FAQs
INSERT INTO "FAQ" (id, question, answer, category, "order", published, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'How is my data protected?', 'We use industry-standard encryption (AES-256) for data at rest and TLS 1.3 for data in transit. Your data is stored in secure, SOC 2 compliant data centers.', 'Privacy & Security', 1, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Do you sell my data?', 'Never. Your data is yours. We don''t sell, share, or monetize your personal information. Our business model is based on subscriptions, not advertising.', 'Privacy & Security', 2, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Can I export my data?', 'Yes! You can export all your data at any time in JSON or CSV format. We believe in data portability and never lock you in.', 'Privacy & Security', 3, true, NOW(), NOW());

-- Clear existing Changelog entries
DELETE FROM "ChangelogEntry";

-- Changelog entries
INSERT INTO "ChangelogEntry" (id, version, title, content, type, "publishedAt", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, '2.5.0', 'AI-Powered Task Suggestions', 'Our new AI assistant analyzes your work patterns and suggests optimal times for each task. Get personalized recommendations for when to tackle high-focus work and when to handle routine tasks.', 'NEW', '2024-12-28', NOW(), NOW()),
  (gen_random_uuid()::text, '2.4.2', 'Enhanced Keyboard Navigation', 'Improved keyboard shortcuts and navigation throughout the app. You can now navigate tasks, projects, and views entirely with your keyboard.', 'IMPROVED', '2024-12-20', NOW(), NOW()),
  (gen_random_uuid()::text, '2.4.1', 'Fixed Calendar Sync Issues', 'Resolved issues with Google Calendar two-way sync that caused some events to not appear correctly. Calendar integration is now more reliable.', 'FIXED', '2024-12-15', NOW(), NOW()),
  (gen_random_uuid()::text, '2.4.0', 'Burnout Prevention Alerts', 'New wellbeing feature that monitors your workload and sends gentle reminders when you might need a break. Includes weekly wellness reports.', 'NEW', '2024-12-10', NOW(), NOW()),
  (gen_random_uuid()::text, '2.3.5', 'Performance Improvements', 'Significant performance improvements across the app. Task lists now load 3x faster and the app uses 40% less memory.', 'IMPROVED', '2024-12-05', NOW(), NOW());
