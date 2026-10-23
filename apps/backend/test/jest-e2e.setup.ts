/**
 * Global e2e environment: existing specs register users directly, so the
 * default invite-only gate (ODD 019) must not apply here. Specs that need the
 * gate set REGISTRATION_MODE themselves (see invite-registration.e2e-spec.ts).
 */
process.env.REGISTRATION_MODE ??= 'open';
