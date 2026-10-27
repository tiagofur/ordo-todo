# Billing (issue #240) — referencia Stripe

> Estado: **no vivo todavía** — T1 mergeada (#329), T2-T5 pendientes.
> Números de negocio: issue #240 (comentario 2026-10-26) y ODD `odd/tasks/012-billing-stripe.md` L2.

## Cuenta Stripe

- Cuenta: `acct_1S2EXxDr2YHFlh6k` ("Creapolis Dev", del owner) — Ordo vive dentro como productos propios.
- Stripe CLI instalada en el Mac del owner (`brew install stripe/stripe-cli/stripe`).

## Productos y precios (TEST MODE — recrear en live al pasar a producción)

| Plan | Precio | Product | Price ID (test) |
|---|---|---|---|
| Pro mensual | $9/mes | `prod_VVzx9FItCvvgg2` | `price_1UUxy3Dr2YHFlh6kzhJ4UPUy` |
| Pro anual | $81/año (−25%) | `prod_VVzx9FItCvvgg2` | `price_1UUxy3Dr2YHFlh6kHgGaZRoK` |
| Team mensual | $19/seat/mes | `prod_VVzx7bGD9m37O6` | `price_1UUxy4Dr2YHFlh6kQMNO0XER` |
| Team anual | $171/seat/año (−25%) | `prod_VVzx7bGD9m37O6` | `price_1UUxy4Dr2YHFlh6kfjxC3jZW` |

- Team es **por asiento**: el precio es unitario y la suscripción lleva `quantity = asientos` (mínimo 2, `minSeats` en la tabla única).
- Los IDs de test son desechables: al pasar a live se recrean los productos (o se duplican a mano) y se actualizan las variables de entorno.

## Variables de entorno (a definir en T2, misma nomenclatura en local y VPS)

```
STRIPE_SECRET_KEY=            # sk_test_... (dev) / sk_live_... (producción)
STRIPE_WEBHOOK_SECRET=        # whsec_... del endpoint firmado
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_PRO_ANNUAL=
STRIPE_PRICE_TEAM_MONTHLY=
STRIPE_PRICE_TEAM_ANNUAL=
```

- Local: claves de test en `apps/backend/.env` (gitignored). El webhook local se prueba con `stripe listen --forward-to localhost:3101/api/v1/billing/webhook` (el `whsec_` que imprime va en `STRIPE_WEBHOOK_SECRET`).
- Producción (VPS `/opt/ordo-todo/.env`): solo claves **live**, cuando el módulo esté deployado y verificado en test. Entonces crear el endpoint de webhook en el dashboard apuntando a `https://api.ordotodo.app/api/v1/billing/webhook` y añadir las variables (RUNBOOK §6: editar `.env` → `docker compose up -d backend` → `health.sh`).

## Créditos de IA (modelo cerrado 2026-10-26)

- Unidad: el ledger existente de ODD 004 S6 (`ask=1`, `tool=2`, `report=5`).
- Pro/Team: **recarga mensual de 500 créditos/seat** al renovar la suscripción (evento de webhook o renovación). Free: solo el trial único de 100.
- Packs de recarga aparte (~$10/1.000 créditos, ancla Notion): diferidos hasta GA de agentes externos.

## Go-live (checklist futuro)

1. Recrear productos/precios en live mode y anotar los IDs live.
2. Verificar negocio en Stripe (datos fiscales/bancarios) para poder cobrar de verdad.
3. `STRIPE_*` live en `/opt/ordo-todo/.env` + endpoint webhook en dashboard + `docker compose up -d backend`.
4. Prueba humana: suscribirse de verdad con tarjeta real → factura → cancelar → gracia 14 días.
