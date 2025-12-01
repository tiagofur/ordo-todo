import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class MigrationService {
  constructor(private readonly prisma: PrismaService) {}

  async fixCompletedField() {
    try {
      console.log('🔧 Fixing completed field for existing projects...');

      const result = await this.prisma.$executeRaw`
        UPDATE "Project" 
        SET completed = false, "updatedAt" = NOW()
        WHERE completed IS NULL
      `;

      console.log(`✅ Updated ${result} projects`);

      return { success: true, updated: result };
    } catch (error) {
      console.error('❌ Error fixing completed field:', error);
      throw error;
    }
  }
}
