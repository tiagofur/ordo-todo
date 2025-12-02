import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);

  constructor(private readonly prisma: PrismaService) { }

  async fixCompletedField() {
    try {
      this.logger.log('Fixing completed field for existing projects...');

      const result = await this.prisma.$executeRaw`
        UPDATE "Project" 
        SET completed = false, "updatedAt" = NOW()
        WHERE completed IS NULL
      `;

      this.logger.log(`Updated ${result} projects`);

      return { success: true, updated: result };
    } catch (error) {
      this.logger.error('Error fixing completed field:', error);
      throw error;
    }
  }
}
