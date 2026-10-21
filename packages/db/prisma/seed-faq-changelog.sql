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
  (gen_random_uuid()::text, 'What payment methods do you accept?', 'Billing is not live yet: all features are currently free while paid plans are in beta. We will announce supported payment methods before charging anything.', 'Billing', 1, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Can I cancel my subscription anytime?', 'There is nothing to cancel yet: billing is not live and every account is currently free. Paid plans are in beta and subject to change.', 'Billing', 2, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Is there a money-back guarantee?', 'There is nothing to refund yet: billing is not live. When paid plans launch, the refund policy will be published here first.', 'Billing', 3, true, NOW(), NOW());

-- Privacy & Security FAQs
INSERT INTO "FAQ" (id, question, answer, category, "order", published, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'How is my data protected?', 'Your account is protected with secure sign-in (Google/GitHub OAuth or password), encrypted connections (TLS), and workspace-scoped access controls. A full data policy ships with our enterprise release.', 'Privacy & Security', 1, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Do you sell my data?', 'Never. Your data is yours. We don''t sell, share, or monetize your personal information. Our business model is based on subscriptions, not advertising.', 'Privacy & Security', 2, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Can I export my data?', 'Yes! You can export all your data at any time in JSON format from your profile. We believe in data portability and never lock you in.', 'Privacy & Security', 3, true, NOW(), NOW());

-- Clear existing Changelog entries
DELETE FROM "ChangelogEntry";

-- Changelog entries (demo seed: the real history lives in GitHub releases)
INSERT INTO "ChangelogEntry" (id, version, title, content, type, "publishedAt", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'unreleased', 'Active development', 'Ordo is under active development. This demo entry ships with fresh installs; the real changelog is published with each GitHub release.', 'NEW', NOW(), NOW(), NOW());
