import { describe, it, expect } from 'vitest';
import { resolveValidationMessage } from '../username-message';

const t = (key: string, values?: Record<string, string | number>) =>
  values ? `${key}:${JSON.stringify(values)}` : key;

describe('resolveValidationMessage', () => {
  it('maps availability and format messages', () => {
    expect(resolveValidationMessage('Username is available!', t)).toBe('usernameAvailable');
    expect(resolveValidationMessage('Username format is valid', t)).toBe('usernameFormatValid');
    expect(resolveValidationMessage('Username is already taken', t)).toBe('usernameTaken');
  });

  it('maps length messages with their numbers', () => {
    expect(resolveValidationMessage('Username must be at least 3 characters', t)).toBe(
      'usernameMinLength:{"min":"3"}',
    );
    expect(resolveValidationMessage('Username must be less than 20 characters', t)).toBe(
      'usernameMaxLength:{"max":"20"}',
    );
  });

  it('maps character-rule messages', () => {
    expect(
      resolveValidationMessage(
        'Username can only contain lowercase letters, numbers, hyphens, and underscores',
        t,
      ),
    ).toBe('usernameInvalidChars');
    expect(
      resolveValidationMessage('Username cannot start with underscore or hyphen', t),
    ).toBe('usernameInvalidStart');
    expect(resolveValidationMessage('Username cannot end with underscore or hyphen', t)).toBe(
      'usernameInvalidEnd',
    );
    expect(
      resolveValidationMessage(
        'Username cannot contain consecutive hyphens or underscores',
        t,
      ),
    ).toBe('usernameInvalidConsecutive');
  });

  it('passes through empty and unknown messages', () => {
    expect(resolveValidationMessage(undefined, t)).toBeUndefined();
    expect(resolveValidationMessage('', t)).toBe('');
    expect(resolveValidationMessage('Something new from the hook', t)).toBe(
      'Something new from the hook',
    );
  });
});
