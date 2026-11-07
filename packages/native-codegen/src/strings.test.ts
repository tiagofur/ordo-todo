import { describe, expect, it } from 'vitest';
import {
  IcuSubsetError,
  buildAndroidResources,
  collectArgs,
  parseIcu,
  renderStringsXml,
  resourceName,
  toAndroidResource,
  type AndroidResource,
  type MessageTree,
} from './strings.ts';

function render(message: string, args = collectArgs(parseIcu(message, 'k'))): AndroidResource {
  return toAndroidResource('name', 'k', parseIcu(message, 'k'), args);
}

function stringValue(message: string): string {
  const res = render(message);
  if (res.kind !== 'string') throw new Error('expected a string resource');
  return res.value;
}

describe('parseIcu + toAndroidResource', () => {
  it('passes plain text through, escaping what Android and XML treat specially', () => {
    expect(stringValue('Hoy')).toBe('Hoy');
    expect(stringValue(`Don't "quote" a & b < c > d`)).toBe(
      `Don\\'t \\"quote\\" a &amp; b &lt; c &gt; d`,
    );
    expect(stringValue('Línea 1\nLínea 2')).toBe('Línea 1\\nLínea 2');
    expect(stringValue('@home')).toBe('\\@home');
    expect(stringValue('?')).toBe('\\?');
  });

  it('keeps edge and repeated spaces that Android would otherwise collapse', () => {
    expect(stringValue(' a  b ')).toBe('\\u0020a \\u0020b\\u0020');
  });

  it('follows ICU apostrophe rules', () => {
    expect(stringValue("It''s")).toBe("It\\'s");
    expect(stringValue("Use '{braces}' literally")).toBe('Use {braces} literally');
  });

  it('turns arguments into positional placeholders, numeric ones as %d', () => {
    expect(stringValue('{done, number} de {total, number}')).toBe('%1$d de %2$d');
    expect(stringValue('Hola, {name}')).toBe('Hola, %1$s');
  });

  it('doubles literal percent signs only in formatted strings', () => {
    const formatted = render('{n, number}% hecho');
    expect(formatted).toMatchObject({ kind: 'string', value: '%1$d%% hecho', formatted: true });
    const literal = render('100% seguro');
    expect(literal).toMatchObject({ kind: 'string', value: '100% seguro', formatted: false });
  });

  it('expands a top-level plural into Android quantities, carrying prefix and suffix', () => {
    const res = render('Racha: {count, plural, one {# día} other {# días}} seguidos');
    expect(res.kind).toBe('plurals');
    if (res.kind !== 'plurals') return;
    expect([...res.items]).toEqual([
      ['one', 'Racha: %1$d día seguidos'],
      ['other', 'Racha: %1$d días seguidos'],
    ]);
  });

  it('orders quantities canonically regardless of source order', () => {
    const res = render('{n, plural, other {# x} many {# m} one {# o}}');
    if (res.kind !== 'plurals') throw new Error('expected plurals');
    expect([...res.items.keys()]).toEqual(['one', 'many', 'other']);
  });

  it.each([
    ['{n, select, a {A} other {B}}', /"select" arguments are not supported/],
    ['{n, plural, =0 {nada} other {#}}', /exact plural matches/],
    ['{n, plural, one {#}}', /needs an "other" branch/],
    ['{n, plural, one {{m, plural, other {#}}} other {#}}', /nested plurals/],
    ['{a, plural, other {#}} {b, plural, other {#}}', /only one plural per message/],
    ['Hola <b>mundo</b>', /rich-text tags/],
    ['{n, number, percent}', /number styles are not supported/],
    ['{1bad}', /invalid argument name/],
    ['abre {sin cerrar', /unterminated placeholder/],
    ['cierra }', /unbalanced/],
  ])('rejects unsupported ICU: %s', (message, error) => {
    expect(() => render(message)).toThrow(error);
    expect(() => render(message)).toThrow(IcuSubsetError);
  });
});

describe('resourceName', () => {
  it('snake-cases camelCase segments and joins the path', () => {
    expect(resourceName(['today', 'sections', 'done'])).toBe('today_sections_done');
    expect(resourceName(['actions', 'moveToTomorrow'])).toBe('actions_move_to_tomorrow');
  });

  it('rejects paths that cannot become a resource name', () => {
    expect(() => resourceName(['1st'])).toThrow(/valid Android resource name/);
  });
});

describe('buildAndroidResources', () => {
  const es: MessageTree = {
    tabs: { today: 'Hoy' },
    progress: '{done, number} de {total, number}',
    streak: '{count, plural, one {# día} other {# días}}',
  };
  const en: MessageTree = {
    tabs: { today: 'Today' },
    progress: '{total, number} total, {done, number} done',
    streak: '{count, plural, one {# day} other {# days}}',
  };

  it('fixes positional slots from the default locale so translations may reorder arguments', () => {
    const out = buildAndroidResources([
      { locale: 'es', messages: es },
      { locale: 'en', messages: en },
    ]);
    const progressEn = out.get('en')!.find((r) => r.name === 'progress');
    expect(progressEn).toMatchObject({ kind: 'string', value: '%2$d total, %1$d done' });
  });

  it('fails when a locale is missing or adds keys', () => {
    const { streak: _drop, ...partial } = en;
    expect(() =>
      buildAndroidResources([
        { locale: 'es', messages: es },
        { locale: 'en', messages: partial },
      ]),
    ).toThrow(/out of parity.*missing: streak/);
  });

  it('fails when a translation changes the argument set or the resource kind', () => {
    expect(() =>
      buildAndroidResources([
        { locale: 'es', messages: es },
        { locale: 'en', messages: { ...en, progress: '{done, number} done' } },
      ]),
    ).toThrow(/arguments differ/);
    expect(() =>
      buildAndroidResources([
        { locale: 'es', messages: es },
        { locale: 'en', messages: { ...en, streak: '{count, number} days' } },
      ]),
    ).toThrow(/is a string but "es" is a plurals/);
  });

  it('fails when two keys collapse into the same resource name', () => {
    expect(() =>
      buildAndroidResources([{ locale: 'es', messages: { a: { bC: 'x' }, a_b_c: 'y' } }]),
    ).toThrow(/both map to the resource "a_b_c"/);
  });
});

describe('renderStringsXml', () => {
  it('writes strings and plurals with argument comments; tools:locale only when asked', () => {
    const out = buildAndroidResources([
      {
        locale: 'es',
        messages: { tab: 'Hoy', streak: '{count, plural, one {# día} other {# días}}' },
      },
    ]);
    const xml = renderStringsXml(out.get('es')!, 'packages/i18n/src/locales/es.json', 'es');
    expect(xml).toContain('tools:locale="es"');
    expect(xml).toContain('<string name="tab">Hoy</string>');
    expect(xml).toContain('<!-- args: %1$d = count -->');
    expect(xml).toContain('<item quantity="one">%1$d día</item>');
    expect(renderStringsXml(out.get('es')!, 'x.json')).toContain('<resources>\n');
  });
});
