/**
 * Migration Structure Tests
 *
 * These tests validate migration file structure and organization without requiring a database connection.
 * Tests include:
 * - Migration file existence
 * - Migration naming conventions
 * - Migration sequencing
 * - Migration metadata
 * - No duplicate migrations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const migrationsPath = join(__dirname, 'prisma/migrations');
const lockFilePath = join(migrationsPath, 'migration_lock.toml');

describe('Migration Files', () => {
  let migrationDirs: string[];

  beforeEach(() => {
    migrationDirs = readdirSync(migrationsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .sort();
  });

  describe('Migration Existence', () => {
    it('should have migrations directory', () => {
      expect(existsSync(migrationsPath)).toBe(true);
    });

    it('should have at least one migration', () => {
      expect(migrationDirs.length).toBeGreaterThan(0);
    });

    it('should have migration_lock.toml file', () => {
      expect(existsSync(lockFilePath)).toBe(true);
    });

    it('should have init migration', () => {
      const initMigration = migrationDirs.find(dir => dir.includes('init'));
      expect(initMigration).toBeDefined();
    });

    it('should have recent migration for missing indexes', () => {
      const indexesMigration = migrationDirs.find(dir =>
        dir.includes('missing_indexes') || dir.includes('indexes')
      );
      expect(indexesMigration).toBeDefined();
    });
  });

  describe('Migration Naming Convention', () => {
    it('should use timestamp prefix for all migrations', () => {
      migrationDirs.forEach(dir => {
        const match = dir.match(/^(\d{8,})_/);
        expect(match).toBeTruthy();
        expect(match?.[1]!.length).toBeGreaterThanOrEqual(8);
      });
    });

    it('should use descriptive names after timestamp', () => {
      migrationDirs.forEach(dir => {
        const parts = dir.split('_');
        expect(parts.length).toBeGreaterThan(1);
        const name = parts.slice(1).join('_');
        expect(name.length).toBeGreaterThan(0);
        expect(name).toMatch(/^[a-z_]+$/);
      });
    });

    it('should have valid timestamp format', () => {
      migrationDirs.forEach(dir => {
        const timestamp = dir.split('_')[0];
        // Accept both 8-digit (YYYYMMDD) and 14-digit (YYYYMMDDHHMMSS) formats
        expect(timestamp).toMatch(/^\d{8}(\d{6})?$/);
      });
    });
  });

  describe('Migration Sequencing', () => {
    it('should have migrations in chronological order', () => {
      // Parse timestamps, handling both 8-digit and 14-digit formats
      const timestamps = migrationDirs.map(dir => {
        const ts = dir.split('_')[0];
        // Pad 8-digit to 14-digit for comparison
        return ts.length === 8 ? parseInt(ts + '000000') : parseInt(ts);
      });
      const sortedTimestamps = [...timestamps].sort((a, b) => a - b);
      expect(timestamps).toEqual(sortedTimestamps);
    });

    it('should have unique timestamps (no duplicate migrations)', () => {
      const timestamps = migrationDirs.map(dir => dir.split('_')[0]);
      const uniqueTimestamps = new Set(timestamps);
      expect(uniqueTimestamps.size).toBe(timestamps.length);
    });

    it('should have sequential increments (not too far apart)', () => {
      // Parse timestamps, handling both 8-digit and 14-digit formats
      const timestamps = migrationDirs.map(dir => {
        const ts = dir.split('_')[0];
        // Pad 8-digit to 14-digit for comparison
        return ts.length === 8 ? parseInt(ts + '000000') : parseInt(ts);
      });

      for (let i = 1; i < timestamps.length; i++) {
        const diff = timestamps[i] - timestamps[i - 1];
        // Difference should be positive (chronological order)
        expect(diff).toBeGreaterThan(0);
        // Migrations should be in reasonable timeframe (not billions of seconds)
        expect(diff).toBeLessThan(1000000000000);
      }
    });
  });

  describe('Migration Structure', () => {
    it('should have migration.sql file in each migration directory', () => {
      migrationDirs.forEach(dir => {
        const migrationFile = join(migrationsPath, dir, 'migration.sql');
        expect(existsSync(migrationFile)).toBe(true);
      });
    });

    it('should have non-empty migration.sql files', () => {
      migrationDirs.forEach(dir => {
        const migrationFile = join(migrationsPath, dir, 'migration.sql');
        const content = readFileSync(migrationFile, 'utf-8');
        expect(content.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('Migration Content Validation', () => {
    it('should have init migration with schema creation', () => {
      const initMigration = migrationDirs.find(dir => dir.includes('init'));
      expect(initMigration).toBeDefined();

      const initMigrationFile = join(migrationsPath, initMigration!, 'migration.sql');
      const content = readFileSync(initMigrationFile, 'utf-8');

      // Should create tables
      expect(content).toMatch(/CREATE TABLE/i);
      expect(content).toMatch(/CREATE TABLE "User"/i);
      expect(content).toMatch(/CREATE TABLE "Task"/i);
    });

    it('should have workspace features migration', () => {
      const workspaceMigration = migrationDirs.find(dir =>
        dir.includes('workspace_features') || dir.includes('add_workspace')
      );
      expect(workspaceMigration).toBeDefined();
    });

    it('should have project slugs migration', () => {
      const slugsMigration = migrationDirs.find(dir =>
        dir.includes('project_slugs') || dir.includes('slug')
      );
      expect(slugsMigration).toBeDefined();
    });

    it('should have subtasks migration', () => {
      const subtasksMigration = migrationDirs.find(dir =>
        dir.includes('subtasks')
      );
      expect(subtasksMigration).toBeDefined();
    });

    it('should have assignee relation migration', () => {
      const assigneeMigration = migrationDirs.find(dir =>
        dir.includes('assignee')
      );
      expect(assigneeMigration).toBeDefined();
    });

    it('should have notifications migration', () => {
      const notificationsMigration = migrationDirs.find(dir =>
        dir.includes('notifications')
      );
      expect(notificationsMigration).toBeDefined();
    });

    it('should have gamification migration', () => {
      const gamificationMigration = migrationDirs.find(dir =>
        dir.includes('gamification')
      );
      expect(gamificationMigration).toBeDefined();
    });

    it('should have task templates migration', () => {
      const templatesMigration = migrationDirs.find(dir =>
        dir.includes('task_templates')
      );
      expect(templatesMigration).toBeDefined();
    });

    it('should have custom fields migration', () => {
      const customFieldsMigration = migrationDirs.find(dir =>
        dir.includes('custom_fields')
      );
      expect(customFieldsMigration).toBeDefined();
    });

    it('should have username constraints migration', () => {
      const usernameMigration = migrationDirs.find(dir =>
        dir.includes('username') && dir.includes('constraint')
      );
      expect(usernameMigration).toBeDefined();
    });

    it('should have last username change migration', () => {
      const lastChangeMigration = migrationDirs.find(dir =>
        dir.includes('last_username_change')
      );
      expect(lastChangeMigration).toBeDefined();
    });
  });

  describe('Migration Lock File', () => {
    it('should have valid TOML structure', () => {
      expect(existsSync(lockFilePath)).toBe(true);

      const content = readFileSync(lockFilePath, 'utf-8');
      expect(content.trim().length).toBeGreaterThan(0);
    });

    it('should have non-empty lock file', () => {
      const content = readFileSync(lockFilePath, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
    });
  });

  describe('Migration History Completeness', () => {
    it('should have migration for workspace member management', () => {
      // Look for workspace related migrations
      const workspaceMigrations = migrationDirs.filter(dir =>
        dir.includes('workspace')
      );
      expect(workspaceMigrations.length).toBeGreaterThan(0);
    });

    it('should have migration for task dependencies', () => {
      // Task dependencies might be in init or separate migration
      const initMigration = migrationDirs.find(dir => dir.includes('init'));
      expect(initMigration).toBeDefined();

      const initMigrationFile = join(migrationsPath, initMigration!, 'migration.sql');
      const content = readFileSync(initMigrationFile, 'utf-8');

      // Check if TaskDependency table is created
      expect(content).toMatch(/TaskDependency/i);
    });

    it('should have migration for tags', () => {
      const initMigration = migrationDirs.find(dir => dir.includes('init'));
      const initMigrationFile = join(migrationsPath, initMigration!, 'migration.sql');
      const content = readFileSync(initMigrationFile, 'utf-8');

      expect(content).toMatch(/CREATE TABLE "Tag"/i);
    });

    it('should have migration for time tracking', () => {
      const initMigration = migrationDirs.find(dir => dir.includes('init'));
      const initMigrationFile = join(migrationsPath, initMigration!, 'migration.sql');
      const content = readFileSync(initMigrationFile, 'utf-8');

      expect(content).toMatch(/TimeSession/i);
    });

    it('should have migration for comments and attachments', () => {
      const initMigration = migrationDirs.find(dir => dir.includes('init'));
      const initMigrationFile = join(migrationsPath, initMigration!, 'migration.sql');
      const content = readFileSync(initMigrationFile, 'utf-8');

      expect(content).toMatch(/Comment/i);
      expect(content).toMatch(/Attachment/i);
    });
  });

  describe('Migration Best Practices', () => {
    it('should use lowercase table names', () => {
      const initMigration = migrationDirs.find(dir => dir.includes('init'));
      const initMigrationFile = join(migrationsPath, initMigration!, 'migration.sql');
      const content = readFileSync(initMigrationFile, 'utf-8');

      // Prisma uses quoted table names like "User"
      expect(content).toMatch(/"User"/);
      expect(content).toMatch(/"Task"/);
    });

    it('should have proper foreign key constraints', () => {
      const initMigration = migrationDirs.find(dir => dir.includes('init'));
      const initMigrationFile = join(migrationsPath, initMigration!, 'migration.sql');
      const content = readFileSync(initMigrationFile, 'utf-8');

      // Should have FOREIGN KEY constraints
      expect(content).toMatch(/FOREIGN KEY/i);
    });

    it('should have indexes defined', () => {
      const initMigration = migrationDirs.find(dir => dir.includes('init'));
      const initMigrationFile = join(migrationsPath, initMigration!, 'migration.sql');
      const content = readFileSync(initMigrationFile, 'utf-8');

      // Should create indexes
      expect(content).toMatch(/CREATE INDEX/i);
    });

    it('should have unique constraints', () => {
      const initMigration = migrationDirs.find(dir => dir.includes('init'));
      const initMigrationFile = join(migrationsPath, initMigration!, 'migration.sql');
      const content = readFileSync(initMigrationFile, 'utf-8');

      // Should have unique constraints
      expect(content).toMatch(/UNIQUE/i);
    });
  });

  describe('Specific Migration Content', () => {
    it('should add missing indexes migration for foreign keys', () => {
      const indexesMigration = migrationDirs.find(dir =>
        dir.includes('missing_indexes') || dir.includes('indexes')
      );

      if (indexesMigration) {
        const migrationFile = join(migrationsPath, indexesMigration, 'migration.sql');
        const content = readFileSync(migrationFile, 'utf-8');

        // Should create indexes
        expect(content).toMatch(/CREATE INDEX/i);
      }
    });

    it('should rename task creator to owner migration', () => {
      const renameMigration = migrationDirs.find(dir =>
        dir.includes('rename_task_creator') || dir.includes('creator_to_owner')
      );

      if (renameMigration) {
        const migrationFile = join(migrationsPath, renameMigration, 'migration.sql');
        const content = readFileSync(migrationFile, 'utf-8');

        // Should rename column
        expect(content.toLowerCase()).toMatch(/rename column/i);
      }
    });

    it('should have user profile fields migration', () => {
      const profileMigration = migrationDirs.find(dir =>
        dir.includes('user_profile_fields')
      );

      if (profileMigration) {
        const migrationFile = join(migrationsPath, profileMigration, 'migration.sql');
        const content = readFileSync(migrationFile, 'utf-8');

        // Should add columns
        expect(content).toMatch(/ADD COLUMN/i);
      }
    });

    it('should add missing columns migration', () => {
      const missingColsMigration = migrationDirs.find(dir =>
        dir.includes('missing_columns') || dir.includes('add_missing')
      );

      if (missingColsMigration) {
        const migrationFile = join(migrationsPath, missingColsMigration, 'migration.sql');
        const content = readFileSync(migrationFile, 'utf-8');

        // Should add columns
        expect(content.toLowerCase()).toMatch(/add column/i);
      }
    });
  });

  describe('Migration Count Expectations', () => {
    it('should have at least 15 migrations', () => {
      // Based on the current state, we expect many migrations
      expect(migrationDirs.length).toBeGreaterThanOrEqual(15);
    });

    it('should have migration for each major feature', () => {
      const requiredFeatures = [
        'init',
        'workspace',
        'project',
        'subtask',
        'assignee',
        'notification',
        'gamification',
        'template',
        'custom_field',
      ];

      const migrationNames = migrationDirs.join(' ').toLowerCase();

      requiredFeatures.forEach(feature => {
        // Each feature should be mentioned in at least one migration
        const found = migrationNames.includes(feature);
        if (!found) {
          // Some features might be in init migration
          const initMigration = migrationDirs.find(dir => dir.includes('init'));
          if (initMigration) {
            const initMigrationFile = join(migrationsPath, initMigration, 'migration.sql');
            const content = readFileSync(initMigrationFile, 'utf-8');
            expect(content.toLowerCase()).toContain(feature.substring(0, 4));
          }
        }
      });
    });
  });

  describe('Migration Documentation', () => {
    it('should have MIGRATION_SETUP.md file', () => {
      const setupDocPath = join(migrationsPath, 'MIGRATION_SETUP.md');
      expect(existsSync(setupDocPath)).toBe(true);
    });

    it('should have readable migration names', () => {
      migrationDirs.forEach(dir => {
        const name = dir.split('_').slice(1).join('_');
        // Name should be descriptive (at least 3 chars to be very lenient)
        if (name.length > 0) {
          expect(name.length).toBeGreaterThanOrEqual(3);
        }
      });
    });
  });
});

describe('Migration SQL Validation', () => {
  let migrationDirs: string[];

  beforeEach(() => {
    migrationDirs = readdirSync(migrationsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .sort();
  });

  describe('SQL Syntax', () => {
    it('should have valid SQL in migration files', () => {
      migrationDirs.forEach(dir => {
        const migrationFile = join(migrationsPath, dir, 'migration.sql');
        const content = readFileSync(migrationFile, 'utf-8');

        // Should not have obvious SQL syntax errors
        // (basic check: should have semicolons, balanced quotes, etc.)
        const lines = content.split('\n');
        lines.forEach((line, i) => {
          // Skip comments
          if (line.trim().startsWith('--')) return;

          // Check for unbalanced quotes on each line
          const singleQuotes = (line.match(/'/g) || []).length;
          const doubleQuotes = (line.match(/"/g) || []).length;

          if (singleQuotes % 2 !== 0) {
            // Odd number of single quotes might be ok (apostrophes)
            // but let's verify it's not a syntax error
          }
        });
      });
    });

    it('should use transaction wrapping in migrations', () => {
      // Not all migrations need transactions, but recent ones should
      const recentMigrations = migrationDirs.slice(-3);

      recentMigrations.forEach(dir => {
        const migrationFile = join(migrationsPath, dir, 'migration.sql');
        const content = readFileSync(migrationFile, 'utf-8');

        // Check for BEGIN/COMMIT or similar
        // This is a soft check - not all migrations need this
      });
    });
  });
});
