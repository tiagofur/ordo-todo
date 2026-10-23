import { describe, it, expect } from 'vitest';
import {
  INVITE_ERROR_KEYS,
  extractApiErrorCode,
  inviteCodeMissing,
  resolveRegisterErrorMessage,
} from '../registration-invite';

const t = (key: string) => `RegisterInvite.${key}`;
const apiError = (code: string) => ({
  response: { data: { statusCode: 400, code, message: 'raw backend text' } },
});

describe('registration-invite helpers (ODD 019 S5)', () => {
  describe('inviteCodeMissing', () => {
    it('requires a code while registration is invite-only', () => {
      expect(inviteCodeMissing('invite-only', '')).toBe(true);
      expect(inviteCodeMissing('invite-only', '   ')).toBe(true);
      expect(inviteCodeMissing('invite-only', 'ORDO-7KM2-QP9X')).toBe(false);
    });

    it('never requires a code when registration is open', () => {
      expect(inviteCodeMissing('open', '')).toBe(false);
    });
  });

  describe('extractApiErrorCode', () => {
    it('reads the machine code from an axios-style error', () => {
      expect(extractApiErrorCode(apiError('INVITE_EXPIRED'))).toBe('INVITE_EXPIRED');
    });

    it.each([null, undefined, new Error('boom'), { response: {} }, { response: { data: { code: 42 } } }])(
      'returns undefined for %p',
      (error) => {
        expect(extractApiErrorCode(error)).toBeUndefined();
      },
    );
  });

  describe('resolveRegisterErrorMessage', () => {
    it.each(Object.entries(INVITE_ERROR_KEYS))(
      'maps %s to the %s message',
      (code, key) => {
        expect(resolveRegisterErrorMessage(apiError(code), t, 'fallback')).toBe(
          `RegisterInvite.${key}`,
        );
      },
    );

    it('keeps the raw error message for non-invite failures', () => {
      expect(
        resolveRegisterErrorMessage(new Error('Email already registered'), t, 'fallback'),
      ).toBe('Email already registered');
    });

    it('falls back when the error carries no usable message', () => {
      expect(resolveRegisterErrorMessage({}, t, 'fallback')).toBe('fallback');
      expect(resolveRegisterErrorMessage(apiError('SOMETHING_ELSE'), t, 'fallback')).toBe(
        'fallback',
      );
    });
  });
});
