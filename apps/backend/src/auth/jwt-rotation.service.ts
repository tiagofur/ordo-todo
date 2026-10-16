import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class JwtSecretRotationService {
  private readonly logger = new Logger(JwtSecretRotationService.name);

  constructor(private readonly configService: ConfigService) {}

  rotateSecret(): void {
    const currentSecret = this.configService.get<string>('JWT_SECRET');
    const rotationInterval =
      this.configService.get<number>('JWT_SECRET_ROTATION_DAYS') || 30;

    if (!currentSecret) {
      this.logger.warn('JWT_SECRET is not configured. Skipping rotation.');
      return;
    }

    const lastRotationDate = this.getLastRotationDate();
    const daysSinceRotation = this.calculateDaysSince(lastRotationDate);

    if (daysSinceRotation >= rotationInterval) {
      this.logger.log('Rotating JWT secret');
      const newSecret = this.generateSecureSecret();

      this.updateSecret(newSecret);
      this.updateLastRotationDate(new Date());

      this.logger.log('JWT secret rotated successfully');
    } else {
      this.logger.debug(
        `JWT secret rotation not needed. Last rotation was ${daysSinceRotation} days ago (interval: ${rotationInterval} days)`,
      );
    }
  }

  private generateSecureSecret(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  private updateSecret(newSecret: string): void {
    const currentSecret = this.configService.get<string>('JWT_SECRET');

    if (currentSecret === newSecret) {
      this.logger.warn(
        'Generated secret is same as current secret. Regenerating...',
      );
      return this.updateSecret(this.generateSecureSecret());
    }

    this.configService.set('JWT_SECRET', newSecret);
    this.logger.log('JWT_SECRET updated in configuration');
  }

  private getLastRotationDate(): Date | null {
    const lastRotation = this.configService.get<string>(
      'JWT_SECRET_LAST_ROTATION',
    );

    if (!lastRotation) {
      return null;
    }

    const date = new Date(lastRotation);

    if (isNaN(date.getTime())) {
      this.logger.warn(
        'Invalid JWT_SECRET_LAST_ROTATION date. Using current date.',
      );
      return new Date();
    }

    return date;
  }

  private updateLastRotationDate(date: Date): void {
    const isoString = date.toISOString();
    this.configService.set('JWT_SECRET_LAST_ROTATION', isoString);
  }

  private calculateDaysSince(lastRotation: Date | null): number {
    if (!lastRotation) {
      return Infinity;
    }

    const now = new Date();
    const diffMs = now.getTime() - lastRotation.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  getCurrentSecret(): string | undefined {
    return this.configService.get<string>('JWT_SECRET');
  }

  getRotationInfo(): {
    currentSecret: string | null;
    lastRotation: string | null;
    daysSinceRotation: number;
    rotationInterval: number;
    needsRotation: boolean;
  } {
    const currentSecret = this.getCurrentSecret();
    const lastRotationDate = this.getLastRotationDate();
    const daysSinceRotation = this.calculateDaysSince(lastRotationDate);
    const rotationInterval =
      this.configService.get<number>('JWT_SECRET_ROTATION_DAYS') || 30;

    return {
      currentSecret: currentSecret
        ? `${currentSecret.substring(0, 8)}...${currentSecret.substring(
            currentSecret.length - 8,
          )}`
        : null,
      lastRotation: lastRotationDate?.toISOString() || null,
      daysSinceRotation,
      rotationInterval,
      needsRotation: daysSinceRotation >= rotationInterval,
    };
  }
}
