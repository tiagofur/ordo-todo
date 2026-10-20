import { parseScheduleNl } from './agent-nl-schedule.parser';

describe('parseScheduleNl', () => {
  const cases: Array<[string, string, string]> = [
    // ES — weekly single day
    ['cada viernes a las 5', '0 17 * * 5', 'Cada viernes a las 17:00'],
    ['cada lunes a las 9', '0 9 * * 1', 'Cada lunes a las 09:00'],
    ['cada domingo a las 8', '0 8 * * 0', 'Cada domingo a las 08:00'],
    // ES — daily
    ['cada día a las 8', '0 8 * * *', 'Cada día a las 08:00'],
    ['todos los días a las 7:30', '30 7 * * *', 'Cada día a las 07:30'],
    // ES — multi-day
    [
      'cada lunes y miércoles a las 9',
      '0 9 * * 1,3',
      'Cada lunes, miércoles a las 09:00',
    ],
    // ES — weekdays
    [
      'días laborables a las 9',
      '0 9 * * 1-5',
      'Cada día laborable a las 09:00',
    ],
    // ES — am/pm words
    [
      'cada martes a las 5 de la tarde',
      '0 17 * * 2',
      'Cada martes a las 17:00',
    ],
    // EN
    ['every friday at 5pm', '0 17 * * 5', 'Cada viernes a las 17:00'],
    ['daily at 8am', '0 8 * * *', 'Cada día a las 08:00'],
    [
      'every monday and thursday at 9',
      '0 9 * * 1,4',
      'Cada lunes, jueves a las 09:00',
    ],
    ['weekdays at 9', '0 9 * * 1-5', 'Cada día laborable a las 09:00'],
    ['every sunday at 5:30pm', '30 17 * * 0', 'Cada domingo a las 17:30'],
    // PT
    ['toda sexta às 17h', '0 17 * * 5', 'Cada viernes a las 17:00'],
    ['todo dia às 8h', '0 8 * * *', 'Cada día a las 08:00'],
    ['dias úteis às 9', '0 9 * * 1-5', 'Cada día laborable a las 09:00'],
    [
      'toda segunda e quarta às 9h',
      '0 9 * * 1,3',
      'Cada lunes, miércoles a las 09:00',
    ],
    ['toda terça às 5 da tarde', '0 17 * * 2', 'Cada martes a las 17:00'],
  ];

  it.each(cases)('parses %p', (input, cron, summary) => {
    expect(parseScheduleNl(input)).toEqual({ cron, summary });
  });

  const nulls = [
    '',
    '   ',
    'maybe someday',
    'cada viernes', // no hour
    'a las 5', // no day/scope
    'every 32nd of the month',
    'cada mes a las 5', // monthly out of MVP scope
  ];

  it.each(nulls)('returns null for %p', (input) => {
    expect(parseScheduleNl(input)).toBeNull();
  });
});
