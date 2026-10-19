import {
  isCalendarDateOverdue,
  isCalendarDateToday,
  toCalendarDateString,
} from '../../src/shared/utils/date.utils';

describe('date.utils - calendar boundaries', () => {
  it('should not mark tasks due today as overdue', () => {
    const now = new Date();
    const todayStr = toCalendarDateString(now);

    expect(isCalendarDateToday(todayStr)).toBe(true);
    expect(isCalendarDateOverdue(todayStr, false)).toBe(false);
    expect(isCalendarDateOverdue(now, false)).toBe(false);
  });

  it('should mark tasks due in the past as overdue', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = toCalendarDateString(yesterday);

    expect(isCalendarDateToday(yesterdayStr)).toBe(false);
    expect(isCalendarDateOverdue(yesterdayStr, false)).toBe(true);
  });

  it('should not mark tasks due in the future as overdue', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = toCalendarDateString(tomorrow);

    expect(isCalendarDateToday(tomorrowStr)).toBe(false);
    expect(isCalendarDateOverdue(tomorrowStr, false)).toBe(false);
  });

  it('should return false for overdue if task is completed', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    expect(isCalendarDateOverdue(yesterday, true)).toBe(false);
  });

  it('should respect timezone if provided', () => {
    const now = new Date();
    expect(isCalendarDateOverdue(now, false, 'America/Mexico_City')).toBe(false);
  });
});
