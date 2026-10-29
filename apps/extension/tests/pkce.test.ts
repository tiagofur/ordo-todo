import { describe, expect, it } from 'vitest';
import { challengeFromVerifier, createPkcePair } from '../src/lib/pkce';

// Vector oficial del RFC 7636, apéndice B.
const RFC_VERIFIER = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
const RFC_CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';

describe('pkce', () => {
  it('calcula el challenge S256 conforme a RFC 7636', async () => {
    expect(await challengeFromVerifier(RFC_VERIFIER)).toBe(RFC_CHALLENGE);
  });

  it('genera pares usables: el challenge se deriva del verifier', async () => {
    const { verifier, challenge } = await createPkcePair();
    expect(verifier).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(await challengeFromVerifier(verifier)).toBe(challenge);
  });

  it('genera verifiers distintos en cada llamada', async () => {
    const a = await createPkcePair();
    const b = await createPkcePair();
    expect(a.verifier).not.toBe(b.verifier);
  });
});
