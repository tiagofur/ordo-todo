/**
 * Minimal magic-bytes validation for uploaded files.
 *
 * Extension checks alone accept a renamed binary served later from the
 * public `/uploads/` prefix, so image/PDF/Office uploads must also match
 * their container signature. Plain text has no magic bytes and extensionless
 * content cannot be verified here — callers keep the extension check for it.
 */
export type VerifiableUploadKind =
  'jpeg' | 'png' | 'gif' | 'pdf' | 'zip-office' | 'ole-office';

const SIGNATURES: { kind: VerifiableUploadKind; magic: number[] }[] = [
  { kind: 'jpeg', magic: [0xff, 0xd8, 0xff] },
  { kind: 'png', magic: [0x89, 0x50, 0x4e, 0x47] },
  { kind: 'gif', magic: [0x47, 0x49, 0x46, 0x38] },
  { kind: 'pdf', magic: [0x25, 0x50, 0x44, 0x46] },
  // docx/xlsx: ZIP container
  { kind: 'zip-office', magic: [0x50, 0x4b, 0x03, 0x04] },
  // doc/xls: OLE compound document
  { kind: 'ole-office', magic: [0xd0, 0xcf, 0x11, 0xe0] },
];

export function matchesMagicBytes(
  buffer: Buffer,
  kind: VerifiableUploadKind,
): boolean {
  const entry = SIGNATURES.find((s) => s.kind === kind);
  if (!entry || buffer.length < entry.magic.length) {
    return false;
  }
  return entry.magic.every((byte, i) => buffer[i] === byte);
}

/**
 * Returns true when the buffer matches the expected container for the
 * extension. Extensions without a verifiable signature (txt) return true —
 * the caller still enforces the allowlist and size limits.
 */
export function hasValidSignatureForExtension(
  buffer: Buffer,
  extension: string,
): boolean {
  switch (extension.toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return matchesMagicBytes(buffer, 'jpeg');
    case '.png':
      return matchesMagicBytes(buffer, 'png');
    case '.gif':
      return matchesMagicBytes(buffer, 'gif');
    case '.pdf':
      return matchesMagicBytes(buffer, 'pdf');
    case '.docx':
    case '.xlsx':
      return matchesMagicBytes(buffer, 'zip-office');
    case '.doc':
    case '.xls':
      return (
        matchesMagicBytes(buffer, 'ole-office') ||
        matchesMagicBytes(buffer, 'zip-office')
      );
    default:
      return true;
  }
}

const VERIFIABLE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
]);

/**
 * Validates the saved file's leading bytes against its extension.
 * Reads only the first 8 bytes; returns true for extensions without a
 * verifiable signature (e.g. txt) so callers can skip disk IO for them.
 */
export async function isSavedUploadSignatureValid(
  readHead: (length: number) => Promise<Buffer>,
  extension: string,
): Promise<boolean> {
  const ext = extension.toLowerCase();
  if (!VERIFIABLE_EXTENSIONS.has(ext)) {
    return true;
  }
  const head = await readHead(8);
  return hasValidSignatureForExtension(head, ext);
}
