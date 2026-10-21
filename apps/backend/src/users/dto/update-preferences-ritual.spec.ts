import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdatePreferencesDto } from './update-preferences.dto';

// ODD 006 S5 (T4): ritual reminder prefs are configurable via
// PATCH /users/me/preferences (no 400 under the whitelist pipe).
describe('UpdatePreferencesDto ritual fields', () => {
  it('accepts the 4 ritual fields', async () => {
    const dto = plainToInstance(UpdatePreferencesDto, {
      ritualMorningReminder: false,
      ritualEveningReminder: true,
      ritualMorningTime: '07:30',
      ritualEveningTime: '22:00',
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects out-of-range times (strict HH:mm)', async () => {
    for (const patch of [
      { ritualMorningTime: '99:99' },
      { ritualEveningTime: '24:00' },
      { ritualMorningTime: '8:00' },
    ]) {
      const dto = plainToInstance(UpdatePreferencesDto, patch);
      expect((await validate(dto)).length).toBeGreaterThan(0);
    }
  });
});
