import {
  hasValidSignatureForExtension,
  matchesMagicBytes,
} from './file-signature';

describe('file-signature', () => {
  const withPayload = (magic: number[]) =>
    Buffer.concat([Buffer.from(magic), Buffer.alloc(16, 0x41)]);

  describe('matchesMagicBytes', () => {
    it('matches a real PNG header', () => {
      expect(
        matchesMagicBytes(withPayload([0x89, 0x50, 0x4e, 0x47]), 'png'),
      ).toBe(true);
    });

    it('rejects a renamed binary served as PNG', () => {
      // MZ executable header claimed as image
      expect(
        matchesMagicBytes(withPayload([0x4d, 0x5a, 0x90, 0x00]), 'png'),
      ).toBe(false);
    });

    it('rejects truncated buffers', () => {
      expect(matchesMagicBytes(Buffer.from([0xff, 0xd8]), 'jpeg')).toBe(false);
    });
  });

  describe('hasValidSignatureForExtension', () => {
    it('accepts matching image/pdf/office signatures', () => {
      expect(
        hasValidSignatureForExtension(withPayload([0xff, 0xd8, 0xff]), '.jpg'),
      ).toBe(true);
      expect(
        hasValidSignatureForExtension(
          withPayload([0x25, 0x50, 0x44, 0x46]),
          '.pdf',
        ),
      ).toBe(true);
      expect(
        hasValidSignatureForExtension(
          withPayload([0x50, 0x4b, 0x03, 0x04]),
          '.docx',
        ),
      ).toBe(true);
      expect(
        hasValidSignatureForExtension(
          withPayload([0xd0, 0xcf, 0x11, 0xe0]),
          '.doc',
        ),
      ).toBe(true);
    });

    it('rejects mismatched signatures', () => {
      expect(
        hasValidSignatureForExtension(
          withPayload([0x4d, 0x5a, 0x90, 0x00]),
          '.pdf',
        ),
      ).toBe(false);
      expect(
        hasValidSignatureForExtension(
          withPayload([0x25, 0x50, 0x44, 0x46]),
          '.png',
        ),
      ).toBe(false);
    });

    it('keeps extension-only check for txt', () => {
      expect(hasValidSignatureForExtension(Buffer.from('hello'), '.txt')).toBe(
        true,
      );
    });
  });
});
