# ODD 029 — Validación estricta de env vars (follow-up 027 S3)

Objetivo: cerrar las 15+ vars que el backend lee (`process.env` o
`ConfigService.get`) pero `env.validation.ts` no declara. Todo lo nuevo
es `@IsOptional` (el código ya trae fallbacks/defaults); la validación
aporta formato temprano (URL, int, boolean-string, longitudes) sin
romper boots que no usan esos subsistemas. Rama: main, commits por slice.

Runner: `NODE_OPTIONS=--experimental-vm-modules npx jest --config
package.json --rootDir src env.validation` + `tsc --noEmit`.

## Specs

S1: "URLs/infra: FRONTEND_URL, API_URL (http URLs, localhost permitido),
TZ, DB_POOL_MAX/MIN (int >=1), REDIS_URL, REDIS_ENABLED (boolean-string).
Opcionales; formato validado cuando vienen seteadas".
S2: "Email: EMAIL_FROM, RESEND_API_KEY, SMTP_HOST/PORT/USER/PASS/SECURE.
Opcionales; PORT int 1-65535, SECURE boolean-string".
S3: "Billing/seguridad/misc: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
STRIPE_PRICE_PRO_ANNUAL, ADMIN_API_KEY, WEBHOOK_SECRET_KEY (min 32, como
exige el crypto service), JWT_SECRET_ROTATION_DAYS (int >=1),
GOOGLE_/GITHUB_ CLIENT_ID/SECRET/CALLBACK_URL (URLs sin TLD requerido)".
Cada slice con spec que prueba válido/inválido/ausente.

## Tasks

- [x] T1 (S1): URLs/infra + spec. Estado: done (5/5: RED con 3
  fallos sin validación, GREEN tras declarar; hallazgo: IsUrl exige
  require_protocol:true o acepta 'not-a-url').
- [x] T2 (S2): email + spec. Estado: done (7/7).
- [x] T3 (S3): billing/seguridad/misc + spec. Estado: done (10/10,
  suite completa 1530 verde, 0 errores eslint en src/config).
  Nota: `tsc -p tsconfig.build.json` en main trae 2 errores
  preexistentes (verificados en HEAD intacto: el dist de core trae
  getCompletionsForHabits/findByIds que el backend de main no
  implementa — scope de la rama 027, no de este cambio).

## Log

L1: "ya no tengo PR que dar merge, sigamos con tu recomendacion"
(2026-11-02). 027/028 viven en ramas sin PR; en main se sigue con el
recorte S3 de 027 (env vars sin validar). Slices T1-T3 en esta sesión.
