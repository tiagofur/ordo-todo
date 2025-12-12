Run docker/build-push-action@v6
GitHub Actions runtime token ACs
Docker info
Proxy configuration
Buildx version
Builder info
/usr/bin/docker buildx build --build-arg NEXT_PUBLIC_API_URL=https://api.ordotodo.app --build-arg NEXTAUTH_URL=https://ordotodo.app --cache-from type=gha --cache-to type=gha,mode=max --file apps/web/Dockerfile --iidfile /home/runner/work/_temp/docker-actions-toolkit-7doMA7/build-iidfile-3bf3c5e715.txt --label org.opencontainers.image.created=2025-12-12T05:10:36.272Z --label org.opencontainers.image.description= --label org.opencontainers.image.licenses= --label org.opencontainers.image.revision=8a7a8874733501e5504051474072ba665fdc17da --label org.opencontainers.image.source=https://github.com/tiagofur/ordo-todo --label org.opencontainers.image.title=ordo-todo --label org.opencontainers.image.url=https://github.com/tiagofur/ordo-todo --label org.opencontainers.image.version=latest --attest type=provenance,mode=min,inline-only=true,builder-id=https://github.com/tiagofur/ordo-todo/actions/runs/20156965978/attempts/1 --tag ghcr.io/tiagofur/ordo-todo-web:latest --tag ghcr.io/tiagofur/ordo-todo-web:8a7a887 --metadata-file /home/runner/work/_temp/docker-actions-toolkit-7doMA7/build-metadata-2117e76979.json --push .
#0 building with "builder-be261b2c-5ad0-4953-8ae4-d5c787ec01e3" instance using docker-container driver

#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 3.05kB done
#1 DONE 0.0s

#2 [auth] library/node:pull token for registry-1.docker.io
#2 DONE 0.0s

#3 [internal] load metadata for docker.io/library/node:20-alpine
#3 DONE 0.4s

#4 [internal] load .dockerignore
#4 transferring context: 758B done
#4 DONE 0.0s

#5 [internal] load build context
#5 DONE 0.0s

#6 [deps  1/18] FROM docker.io/library/node:20-alpine@sha256:643e7036aa985317ebfee460005e322aa550c6b6883000d01daefb58689a58e2
#6 resolve docker.io/library/node:20-alpine@sha256:643e7036aa985317ebfee460005e322aa550c6b6883000d01daefb58689a58e2 done
#6 DONE 0.0s

#7 importing cache manifest from gha:15547732738115880413
#7 DONE 0.1s

#6 [deps  1/18] FROM docker.io/library/node:20-alpine@sha256:643e7036aa985317ebfee460005e322aa550c6b6883000d01daefb58689a58e2
#6 sha256:6ac8cc1f0b52065d2132d052abc59bf19e19ac0c65729d4300ab41db30fed855 446B / 446B 0.1s done
#6 sha256:34226f5414967f183a8ba2d2a0bf2809b3864182e8f68c07c066fa83f025024a 1.26MB / 1.26MB 0.1s done
#6 sha256:d28ab52fe4290429b930e8fa368da4da8a7e63cf143c38f9b869950a67c32645 1.05MB / 42.78MB 0.2s
#6 sha256:014e56e613968f73cce0858124ca5fbc601d7888099969a4eea69f31dcd71a53 671.74kB / 3.86MB 0.2s
#6 sha256:014e56e613968f73cce0858124ca5fbc601d7888099969a4eea69f31dcd71a53 3.86MB / 3.86MB 0.2s done
#6 extracting sha256:014e56e613968f73cce0858124ca5fbc601d7888099969a4eea69f31dcd71a53
#6 ...

#5 [internal] load build context
#5 transferring context: 4.61MB 0.4s done
#5 DONE 0.4s

#6 [deps  1/18] FROM docker.io/library/node:20-alpine@sha256:643e7036aa985317ebfee460005e322aa550c6b6883000d01daefb58689a58e2
#6 sha256:d28ab52fe4290429b930e8fa368da4da8a7e63cf143c38f9b869950a67c32645 16.78MB / 42.78MB 0.3s
#6 extracting sha256:014e56e613968f73cce0858124ca5fbc601d7888099969a4eea69f31dcd71a53 0.2s done
#6 sha256:d28ab52fe4290429b930e8fa368da4da8a7e63cf143c38f9b869950a67c32645 27.26MB / 42.78MB 0.5s
#6 sha256:d28ab52fe4290429b930e8fa368da4da8a7e63cf143c38f9b869950a67c32645 42.00MB / 42.78MB 0.6s
#6 sha256:d28ab52fe4290429b930e8fa368da4da8a7e63cf143c38f9b869950a67c32645 42.78MB / 42.78MB 0.6s done
#6 extracting sha256:d28ab52fe4290429b930e8fa368da4da8a7e63cf143c38f9b869950a67c32645
#6 extracting sha256:d28ab52fe4290429b930e8fa368da4da8a7e63cf143c38f9b869950a67c32645 1.1s done
#6 DONE 1.7s

#6 [deps  1/18] FROM docker.io/library/node:20-alpine@sha256:643e7036aa985317ebfee460005e322aa550c6b6883000d01daefb58689a58e2
#6 extracting sha256:34226f5414967f183a8ba2d2a0bf2809b3864182e8f68c07c066fa83f025024a 0.0s done
#6 extracting sha256:6ac8cc1f0b52065d2132d052abc59bf19e19ac0c65729d4300ab41db30fed855 done
#6 DONE 1.8s

#8 [deps  2/18] WORKDIR /app
#8 DONE 0.5s

#9 [runner 3/6] RUN addgroup --system --gid 1001 nodejs &&     adduser --system --uid 1001 nextjs
#9 DONE 0.1s

#10 [deps  3/18] RUN apk add --no-cache libc6-compat
#10 0.544 (1/3) Installing musl-obstack (1.2.3-r2)
#10 0.552 (2/3) Installing libucontext (1.3.3-r0)
#10 0.559 (3/3) Installing gcompat (1.1.0-r4)
#10 0.569 OK: 10 MiB in 21 packages
#10 DONE 0.6s

#11 [deps  4/18] COPY package.json package-lock.json ./
#11 DONE 0.0s

#12 [deps  5/18] COPY apps/web/package.json ./apps/web/
#12 DONE 0.0s

#13 [deps  6/18] COPY packages/core/package.json ./packages/core/
#13 DONE 0.0s

#14 [deps  7/18] COPY packages/db/package.json ./packages/db/
#14 DONE 0.0s

#15 [deps  8/18] COPY packages/config/package.json ./packages/config/
#15 DONE 0.0s

#16 [deps  9/18] COPY packages/ui/package.json ./packages/ui/
#16 DONE 0.0s

#17 [deps 10/18] COPY packages/hooks/package.json ./packages/hooks/
#17 DONE 0.0s

#18 [deps 11/18] COPY packages/stores/package.json ./packages/stores/
#18 DONE 0.0s

#19 [deps 12/18] COPY packages/i18n/package.json ./packages/i18n/
#19 DONE 0.0s

#20 [deps 13/18] COPY packages/styles/package.json ./packages/styles/
#20 DONE 0.0s

#21 [deps 14/18] COPY packages/api-client/package.json ./packages/api-client/
#21 DONE 0.0s

#22 [deps 15/18] COPY packages/db/prisma ./packages/db/prisma
#22 DONE 0.0s

#23 [deps 16/18] COPY packages/db/prisma.config.ts ./packages/db/
#23 DONE 0.0s

#24 [deps 17/18] RUN npm ci --legacy-peer-deps --ignore-scripts
#24 10.23 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
#24 11.01 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
#24 13.92 npm warn deprecated @types/jwt-decode@3.1.0: This is a stub types definition. jwt-decode provides its own type definitions, so you do not need this installed.
#24 42.01 
#24 42.01 added 1360 packages, and audited 1376 packages in 42s
#24 42.01 
#24 42.01 342 packages are looking for funding
#24 42.01   run `npm fund` for details
#24 42.18 
#24 42.18 6 vulnerabilities (1 moderate, 4 high, 1 critical)
#24 42.18 
#24 42.18 To address all issues, run:
#24 42.18   npm audit fix
#24 42.18 
#24 42.18 Run `npm audit` for details.
#24 42.18 npm notice
#24 42.18 npm notice New major version of npm available! 10.8.2 -> 11.7.0
#24 42.18 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.7.0
#24 42.18 npm notice To update run: npm install -g npm@11.7.0
#24 42.18 npm notice
#24 DONE 44.3s

#25 [deps 18/18] RUN cd packages/db && npx prisma generate --schema=prisma/schema.prisma
#25 2.608 Loaded Prisma config from prisma.config.ts.
#25 2.608 
#25 3.474 Prisma schema loaded from prisma/schema.prisma
#25 3.489 warn Preview feature "driverAdapters" is deprecated. The functionality can be used without specifying it as a preview feature.
#25 4.628 
#25 4.628 ✔ Generated Prisma Client (v7.0.1) to ./../../node_modules/@prisma/client in 661ms
#25 4.628 
#25 4.628 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
#25 4.628 
#25 4.628 Tip: Want to turn off tips and other hints? https://pris.ly/tip-4-nohints
#25 4.628 
#25 DONE 4.7s

#26 [builder  3/23] COPY --from=deps /app/node_modules ./node_modules
#26 DONE 16.6s

#27 [builder  4/23] COPY package.json package-lock.json turbo.json ./
#27 DONE 0.7s

#28 [builder  5/23] COPY apps/web ./apps/web
#28 DONE 0.0s

#29 [builder  6/23] COPY packages ./packages
#29 DONE 0.1s

#30 [builder  7/23] RUN npx prisma generate --schema=packages/db/prisma/schema.prisma
#30 1.849 Prisma schema loaded from packages/db/prisma/schema.prisma
#30 1.868 warn Preview feature "driverAdapters" is deprecated. The functionality can be used without specifying it as a preview feature.
#30 3.253 
#30 3.253 ✔ Generated Prisma Client (v7.0.1) to ./node_modules/@prisma/client in 762ms
#30 3.253 
#30 3.253 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
#30 3.253 
#30 3.253 Tip: Interested in query caching in just a few lines of code? Try Accelerate today! https://pris.ly/tip-3-accelerate
#30 3.253 
#30 3.286 npm notice
#30 3.286 npm notice New major version of npm available! 10.8.2 -> 11.7.0
#30 3.286 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.7.0
#30 3.286 npm notice To update run: npm install -g npm@11.7.0
#30 3.286 npm notice
#30 DONE 3.3s

#31 [builder  8/23] WORKDIR /app/packages/core
#31 DONE 0.0s

#32 [builder  9/23] RUN npm run build || true
#32 0.259 
#32 0.259 > @ordo-todo/core@0.1.0 build
#32 0.259 > tsup src/index.ts --format cjs,esm --dts --minify
#32 0.259 
#32 0.265 sh: tsup: not found
#32 0.269 npm error Lifecycle script `build` failed with error:
#32 0.270 npm error code 127
#32 0.270 npm error path /app/packages/core
#32 0.271 npm error workspace @ordo-todo/core@0.1.0
#32 0.271 npm error location /app/packages/core
#32 0.271 npm error command failed
#32 0.271 npm error command sh -c tsup src/index.ts --format cjs,esm --dts --minify
#32 DONE 0.3s

#33 [builder 10/23] WORKDIR /app/packages/config
#33 DONE 0.0s

#34 [builder 11/23] RUN npm run build || true
#34 0.257 
#34 0.257 > @ordo-todo/config@1.0.0 build
#34 0.257 > tsc
#34 0.257 
#34 DONE 3.1s

#35 [builder 12/23] WORKDIR /app/packages/ui
#35 DONE 0.0s

#36 [builder 13/23] RUN npm run build || true
#36 0.255 
#36 0.255 > @ordo-todo/ui@1.0.0 build
#36 0.255 > tsc
#36 0.255 
#36 16.20 src/components/project/create-project-dialog.tsx(22,53): error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#36 16.20 src/components/project/create-project-dialog.tsx(318,42): error TS7006: Parameter 'color' implicitly has an 'any' type.
#36 16.20 src/components/project/project-card.tsx(20,35): error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#36 16.20 src/components/project/project-settings-dialog.tsx(20,53): error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#36 16.20 src/components/project/project-settings-dialog.tsx(152,38): error TS7006: Parameter 'color' implicitly has an 'any' type.
#36 16.20 src/components/project/project-settings.tsx(21,53): error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#36 16.20 src/components/project/project-settings.tsx(234,36): error TS7006: Parameter 'color' implicitly has an 'any' type.
#36 16.20 src/components/tag/create-tag-dialog.tsx(4,28): error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#36 16.20 src/components/tag/create-tag-dialog.tsx(148,32): error TS7006: Parameter 'color' implicitly has an 'any' type.
#36 16.20 src/components/task/create-task-dialog.tsx(7,34): error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#36 16.20 src/components/workspace/create-workspace-dialog.tsx(20,39): error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#36 16.26 npm error Lifecycle script `build` failed with error:
#36 16.27 npm error code 2
#36 16.27 npm error path /app/packages/ui
#36 16.27 npm error workspace @ordo-todo/ui@1.0.0
#36 16.27 npm error location /app/packages/ui
#36 16.27 npm error command failed
#36 16.27 npm error command sh -c tsc
#36 DONE 16.3s

#37 [builder 14/23] WORKDIR /app/packages/hooks
#37 DONE 0.0s

#38 [builder 15/23] RUN npm run build || true
#38 0.258 
#38 0.258 > @ordo-todo/hooks@1.0.0 build
#38 0.258 > tsc
#38 0.258 
#38 4.507 src/hooks.ts(46,8): error TS2307: Cannot find module '@ordo-todo/api-client' or its corresponding type declarations.
#38 4.510 src/hooks.ts(384,71): error TS18046: 'workflow' is of type 'unknown'.
#38 4.511 src/hooks.ts(396,71): error TS18046: 'workflow' is of type 'unknown'.
#38 4.512 src/hooks.ts(443,70): error TS18046: 'project' is of type 'unknown'.
#38 4.513 src/hooks.ts(456,69): error TS18046: 'project' is of type 'unknown'.
#38 4.514 src/hooks.ts(457,70): error TS18046: 'project' is of type 'unknown'.
#38 4.514 src/hooks.ts(469,69): error TS18046: 'project' is of type 'unknown'.
#38 4.516 src/hooks.ts(481,69): error TS18046: 'project' is of type 'unknown'.
#38 4.517 src/hooks.ts(531,67): error TS18046: 'task' is of type 'unknown'.
#38 4.518 src/hooks.ts(1030,74): error TS18046: 'comment' is of type 'unknown'.
#38 4.519 src/hooks.ts(1031,73): error TS18046: 'comment' is of type 'unknown'.
#38 4.519 src/hooks.ts(1043,74): error TS18046: 'comment' is of type 'unknown'.
#38 4.520 src/hooks.ts(1044,73): error TS18046: 'comment' is of type 'unknown'.
#38 4.521 src/hooks.ts(1076,77): error TS18046: 'attachment' is of type 'unknown'.
#38 4.522 src/hooks.ts(1077,73): error TS18046: 'attachment' is of type 'unknown'.
#38 4.523 src/query-keys.ts(8,63): error TS2307: Cannot find module '@ordo-todo/api-client' or its corresponding type declarations.
#38 4.526 src/types.ts(5,36): error TS2307: Cannot find module '@ordo-todo/api-client' or its corresponding type declarations.
#38 4.528 src/use-timer.ts(9,36): error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#38 4.555 npm error Lifecycle script `build` failed with error:
#38 4.556 npm error code 2
#38 4.556 npm error path /app/packages/hooks
#38 4.556 npm error workspace @ordo-todo/hooks@1.0.0
#38 4.556 npm error location /app/packages/hooks
#38 4.557 npm error command failed
#38 4.557 npm error command sh -c tsc
#38 DONE 4.6s

#39 [builder 16/23] WORKDIR /app/packages/stores
#39 DONE 0.0s

#40 [builder 17/23] RUN npm run build || true
#40 0.254 
#40 0.254 > @ordo-todo/stores@1.0.0 build
#40 0.254 > tsc
#40 0.254 
#40 DONE 3.4s

#41 [builder 18/23] WORKDIR /app/packages/i18n
#41 DONE 0.0s

#42 [builder 19/23] RUN npm run build || true
#42 0.260 
#42 0.260 > @ordo-todo/i18n@1.0.0 build
#42 0.260 > tsc
#42 0.260 
#42 DONE 3.8s

#43 [builder 20/23] WORKDIR /app/packages/api-client
#43 DONE 0.0s

#44 [builder 21/23] RUN npm run build || true
#44 0.255 
#44 0.255 > @ordo-todo/api-client@1.0.0 build
#44 0.255 > tsc
#44 0.255 
#44 DONE 3.8s

#45 [builder 22/23] WORKDIR /app/apps/web
#45 DONE 0.0s

#46 [builder 23/23] RUN npm run build
#46 0.252 
#46 0.252 > @ordo-todo/web@0.1.0 build
#46 0.252 > next build
#46 0.252 
#46 1.285 Attention: Next.js now collects completely anonymous telemetry regarding usage.
#46 1.285 This information is used to shape Next.js' roadmap and prioritize features.
#46 1.285 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
#46 1.285 https://nextjs.org/telemetry
#46 1.285 
#46 1.299    ▲ Next.js 16.0.6 (Turbopack)
#46 1.299 
#46 1.363  ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
#46 1.413    Creating an optimized production build ...
#46 59.64 
#46 59.64 > Build error occurred
#46 59.65 Error: Turbopack build failed with 18 errors:
#46 59.65 ./apps/web/src/app/api/auth/signup/route.ts:4:1
#46 59.65 Module not found: Can't resolve '@ordo-todo/core'
#46 59.65   2 | import { hash } from "bcryptjs";
#46 59.65   3 | import { prisma } from "@/lib/prisma";
#46 59.65 > 4 | import { registerUserSchema } from "@ordo-todo/core";
#46 59.65     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#46 59.65   5 |
#46 59.65   6 | export async function POST(req: Request) {
#46 59.65   7 |     try {
#46 59.65 
#46 59.65 
#46 59.65 
#46 59.65 https://nextjs.org/docs/messages/module-not-found
#46 59.65 
#46 59.65 
#46 59.65 ./apps/web/src/components/analytics/daily-metrics-card.tsx:4:1
#46 59.65 Module not found: Can't resolve '@ordo-todo/core'
#46 59.65   2 |
#46 59.65   3 | import { useDailyMetrics, useTimerStats } from "@/lib/api-hooks";
#46 59.65 > 4 | import { formatDuration } from "@ordo-todo/core";
#46 59.65     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#46 59.65   5 | import { useTranslations } from "next-intl";
#46 59.65   6 | import { 
#46 59.65   7 |   DailyMetricsCard as DailyMetricsCardUI, 
#46 59.65 
#46 59.65 
#46 59.65 
#46 59.65 Import traces:
#46 59.65   Client Component Browser:
#46 59.65     ./apps/web/src/components/analytics/daily-metrics-card.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/analytics/page.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/analytics/page.tsx [Server Component]
#46 59.65 
#46 59.65   Client Component SSR:
#46 59.65     ./apps/web/src/components/analytics/daily-metrics-card.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/analytics/page.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/analytics/page.tsx [Server Component]
#46 59.65 
#46 59.65 https://nextjs.org/docs/messages/module-not-found
#46 59.65 
#46 59.65 
#46 59.65 ./apps/web/src/components/project/create-project-dialog.tsx:21:1
#46 59.65 Module not found: Can't resolve '@ordo-todo/core'
#46 59.65   19 | import { PROJECT_TEMPLATES, ProjectTemplate } from "@/data/project-templates";
#46 59.65   20 |
#46 59.65 > 21 | import { PROJECT_COLORS, createProjectSchema } from "@ordo-todo/core";
#46 59.65      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#46 59.65   22 |
#46 59.65   23 | interface CreateProjectDialogProps {
#46 59.65   24 |   open: boolean;
#46 59.65 
#46 59.65 
#46 59.65 
#46 59.65 Import traces:
#46 59.65   Client Component Browser:
#46 59.65     ./apps/web/src/components/project/create-project-dialog.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/dashboard/page.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/dashboard/page.tsx [Server Component]
#46 59.65 
#46 59.65   Client Component SSR:
#46 59.65     ./apps/web/src/components/project/create-project-dialog.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/dashboard/page.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/dashboard/page.tsx [Server Component]
#46 59.65 
#46 59.65 https://nextjs.org/docs/messages/module-not-found
#46 59.65 
#46 59.65 
#46 59.65 ./apps/web/src/components/project/project-card.tsx:17:1
#46 59.65 Module not found: Can't resolve '@ordo-todo/core'
#46 59.65   15 | import { motion } from "framer-motion";
#46 59.65   16 | import { useTranslations } from "next-intl";
#46 59.65 > 17 | import { calculateProgress } from "@ordo-todo/core";
#46 59.65      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#46 59.65   18 |
#46 59.65   19 | interface ProjectCardProps {
#46 59.65   20 |   project: {
#46 59.65 
#46 59.65 
#46 59.65 
#46 59.65 Import traces:
#46 59.65   Client Component Browser:
#46 59.65     ./apps/web/src/components/project/project-card.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/projects/page.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/projects/page.tsx [Server Component]
#46 59.65 
#46 59.65   Client Component SSR:
#46 59.65     ./apps/web/src/components/project/project-card.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/projects/page.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/projects/page.tsx [Server Component]
#46 59.65 
#46 59.65 https://nextjs.org/docs/messages/module-not-found
#46 59.65 
#46 59.65 
#46 59.65 ./apps/web/src/components/project/project-settings-dialog.tsx:13:1
#46 59.65 Module not found: Can't resolve '@ordo-todo/core'
#46 59.65   11 | import { useTranslations } from "next-intl";
#46 59.65   12 |
#46 59.65 > 13 | import { PROJECT_COLORS, updateProjectSchema } from "@ordo-todo/core";
#46 59.65      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#46 59.65   14 |
#46 59.65   15 | interface ProjectSettingsDialogProps {
#46 59.65   16 |   projectId: string;
#46 59.65 
#46 59.65 
#46 59.65 
#46 59.65 Import traces:
#46 59.65   Client Component Browser:
#46 59.65     ./apps/web/src/components/project/project-settings-dialog.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/workspaces/[slug]/projects/[projectSlug]/page.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/workspaces/[slug]/projects/[projectSlug]/page.tsx [Server Component]
#46 59.65 
#46 59.65   Client Component SSR:
#46 59.65     ./apps/web/src/components/project/project-settings-dialog.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/workspaces/[slug]/projects/[projectSlug]/page.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/workspaces/[slug]/projects/[projectSlug]/page.tsx [Server Component]
#46 59.65 
#46 59.65 https://nextjs.org/docs/messages/module-not-found
#46 59.65 
#46 59.65 
#46 59.65 ./apps/web/src/components/task/create-task-dialog.tsx:8:1
#46 59.65 Module not found: Can't resolve '@ordo-todo/core'
#46 59.65    6 | import { zodResolver } from "@hookform/resolvers/zod";
#46 59.65    7 | import { z } from "zod";
#46 59.65 >  8 | import { createTaskSchema } from "@ordo-todo/core";
#46 59.65      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#46 59.65    9 | import { useCreateTask, useAllProjects } from "@/lib/api-hooks";
#46 59.65   10 | import { notify } from "@/lib/notify";
#46 59.65   11 | import { Briefcase, Sparkles, Calendar as CalendarIcon, Flag, Clock } from "lucide-react";
#46 59.65 
#46 59.65 
#46 59.65 
#46 59.65 Import traces:
#46 59.65   Client Component Browser:
#46 59.65     ./apps/web/src/components/task/create-task-dialog.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/dashboard/page.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/dashboard/page.tsx [Server Component]
#46 59.65 
#46 59.65   Client Component SSR:
#46 59.65     ./apps/web/src/components/task/create-task-dialog.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/dashboard/page.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/dashboard/page.tsx [Server Component]
#46 59.65 
#46 59.65 https://nextjs.org/docs/messages/module-not-found
#46 59.65 
#46 59.65 
#46 59.65 ./apps/web/src/components/workspace/create-workspace-dialog.tsx:13:1
#46 59.65 Module not found: Can't resolve '@ordo-todo/core'
#46 59.65   11 | import { Building2, Home, Users } from "lucide-react";
#46 59.65   12 | import { useTranslations } from "next-intl";
#46 59.65 > 13 | import { createWorkspaceSchema, WORKSPACE_TYPES } from "@ordo-todo/core";
#46 59.65      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#46 59.65   14 |
#46 59.65   15 | interface CreateWorkspaceDialogProps {
#46 59.65   16 |   open: boolean;
#46 59.65 
#46 59.65 
#46 59.65 
#46 59.65 Import traces:
#46 59.65   Client Component Browser:
#46 59.65     ./apps/web/src/components/workspace/create-workspace-dialog.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/components/shared/sidebar.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/components/shared/app-layout.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/dashboard/page.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/dashboard/page.tsx [Server Component]
#46 59.65 
#46 59.65   Client Component SSR:
#46 59.65     ./apps/web/src/components/workspace/create-workspace-dialog.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/components/shared/sidebar.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/components/shared/app-layout.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/dashboard/page.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/dashboard/page.tsx [Server Component]
#46 59.65 
#46 59.65 https://nextjs.org/docs/messages/module-not-found
#46 59.65 
#46 59.65 
#46 59.65 ./apps/web/src/components/workspace/invite-member-dialog.tsx:14:1
#46 59.65 Module not found: Can't resolve '@ordo-todo/core'
#46 59.65   12 | import { useInviteMember } from "@/lib/api-hooks";
#46 59.65   13 |
#46 59.65 > 14 | import { inviteMemberSchema } from "@ordo-todo/core";
#46 59.65      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#46 59.65   15 |
#46 59.65   16 | // We can extend or use the schema directly. Since the core schema has generic messages,
#46 59.65   17 | // we might want to override them or just use them.
#46 59.65 
#46 59.65 
#46 59.65 
#46 59.65 Import traces:
#46 59.65   Client Component Browser:
#46 59.65     ./apps/web/src/components/workspace/invite-member-dialog.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/components/workspace/workspace-members-settings.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/components/workspace/workspace-settings-dialog.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/components/workspace/workspace-card.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/workspaces/page.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/workspaces/page.tsx [Server Component]
#46 59.65 
#46 59.65   Client Component SSR:
#46 59.65     ./apps/web/src/components/workspace/invite-member-dialog.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/components/workspace/workspace-members-settings.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/components/workspace/workspace-settings-dialog.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/components/workspace/workspace-card.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/workspaces/page.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/workspaces/page.tsx [Server Component]
#46 59.65 
#46 59.65 https://nextjs.org/docs/messages/module-not-found
#46 59.65 
#46 59.65 
#46 59.65 ./apps/web/src/data/hooks/use-session.hook.ts:2:1
#46 59.65 Module not found: Can't resolve '@ordo-todo/core'
#46 59.65   1 | import { useAuth } from "@/contexts/auth-context";
#46 59.65 > 2 | import { User } from "@ordo-todo/core";
#46 59.65     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#46 59.65   3 |
#46 59.65   4 | const useSession = () => {
#46 59.65   5 |     const { user: authUser, isLoading, logout } = useAuth();
#46 59.65 
#46 59.65 
#46 59.65 
#46 59.65 Import traces:
#46 59.65   Client Component Browser:
#46 59.65     ./apps/web/src/data/hooks/use-session.hook.ts [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/profile/page.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/profile/page.tsx [Server Component]
#46 59.65 
#46 59.65   Client Component SSR:
#46 59.65     ./apps/web/src/data/hooks/use-session.hook.ts [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/profile/page.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/profile/page.tsx [Server Component]
#46 59.65 
#46 59.65 https://nextjs.org/docs/messages/module-not-found
#46 59.65 
#46 59.65 
#46 59.65 ./apps/web/src/hooks/use-timer-backend.ts:2:1
#46 59.65 Module not found: Can't resolve '@ordo-todo/core'
#46 59.65   1 | import { useState, useEffect, useRef, useCallback } from "react";
#46 59.65 > 2 | import { formatTimerDisplay } from "@ordo-todo/core";
#46 59.65     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#46 59.65   3 | import { useActiveTimer, useStartTimer, useStopTimer, usePauseTimer, useResumeTimer, useSwitchTask } from "@/lib/api-hooks";
#46 59.65   4 | import { notify } from "@/lib/notify";
#46 59.65   5 | import { useTimerNotifications } from "./use-timer-notifications";
#46 59.65 
#46 59.65 
#46 59.65 
#46 59.65 Import traces:
#46 59.65   Client Component Browser:
#46 59.65     ./apps/web/src/hooks/use-timer-backend.ts [Client Component Browser]
#46 59.65     ./apps/web/src/components/providers/timer-provider.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/components/timer/timer-widget.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/components/shared/sidebar.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/components/shared/app-layout.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/analytics/page.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/analytics/page.tsx [Server Component]
#46 59.65 
#46 59.65   Client Component SSR:
#46 59.65     ./apps/web/src/hooks/use-timer-backend.ts [Client Component SSR]
#46 59.65     ./apps/web/src/components/providers/timer-provider.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/components/timer/timer-widget.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/components/shared/sidebar.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/components/shared/app-layout.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/analytics/page.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/analytics/page.tsx [Server Component]
#46 59.65 
#46 59.65 https://nextjs.org/docs/messages/module-not-found
#46 59.65 
#46 59.65 
#46 59.65 ./packages/ui/dist/components/project/create-project-dialog.js:15:1
#46 59.65 Module not found: Can't resolve '@ordo-todo/core'
#46 59.65   13 | import { ScrollArea } from '../ui/scroll-area.js';
#46 59.65   14 | import { Briefcase, Check, Palette, LayoutTemplate } from 'lucide-react';
#46 59.65 > 15 | import { PROJECT_COLORS, createProjectSchema } from '@ordo-todo/core';
#46 59.65      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#46 59.65   16 | /**
#46 59.65   17 |  * CreateProjectDialog - Platform-agnostic project creation dialog
#46 59.65   18 |  *
#46 59.65 
#46 59.65 
#46 59.65 
#46 59.65 Import traces:
#46 59.65   Server Component:
#46 59.65     ./packages/ui/dist/components/project/create-project-dialog.js
#46 59.65     ./packages/ui/dist/components/project/index.js
#46 59.65     ./packages/ui/dist/components/index.js
#46 59.65     ./packages/ui/dist/index.js
#46 59.65     ./apps/web/src/app/[locale]/not-found.tsx
#46 59.65 
#46 59.65   Client Component Browser:
#46 59.65     ./packages/ui/dist/components/project/create-project-dialog.js [Client Component Browser]
#46 59.65     ./packages/ui/dist/components/project/index.js [Client Component Browser]
#46 59.65     ./packages/ui/dist/components/index.js [Client Component Browser]
#46 59.65     ./packages/ui/dist/index.js [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/workspaces/[slug]/projects/[projectSlug]/page.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/workspaces/[slug]/projects/[projectSlug]/page.tsx [Server Component]
#46 59.65 
#46 59.65   Client Component SSR:
#46 59.65     ./packages/ui/dist/components/project/create-project-dialog.js [Client Component SSR]
#46 59.65     ./packages/ui/dist/components/project/index.js [Client Component SSR]
#46 59.65     ./packages/ui/dist/components/index.js [Client Component SSR]
#46 59.65     ./packages/ui/dist/index.js [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/timer/page.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/timer/page.tsx [Server Component]
#46 59.65 
#46 59.65 https://nextjs.org/docs/messages/module-not-found
#46 59.65 
#46 59.65 
#46 59.65 ./packages/ui/dist/components/project/project-card.js:8:1
#46 59.65 Module not found: Can't resolve '@ordo-todo/core'
#46 59.65    6 | import { motion } from 'framer-motion';
#46 59.65    7 | import { Progress } from '../ui/progress.js';
#46 59.65 >  8 | import { calculateProgress } from '@ordo-todo/core';
#46 59.65      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#46 59.65    9 | const DEFAULT_LABELS = {
#46 59.65   10 |     actions: {
#46 59.65   11 |         archive: 'Archive',
#46 59.65 
#46 59.65 
#46 59.65 
#46 59.65 Import traces:
#46 59.65   Server Component:
#46 59.65     ./packages/ui/dist/components/project/project-card.js
#46 59.65     ./packages/ui/dist/components/project/index.js
#46 59.65     ./packages/ui/dist/components/index.js
#46 59.65     ./packages/ui/dist/index.js
#46 59.65     ./apps/web/src/app/[locale]/not-found.tsx
#46 59.65 
#46 59.65   Client Component Browser:
#46 59.65     ./packages/ui/dist/components/project/project-card.js [Client Component Browser]
#46 59.65     ./packages/ui/dist/components/project/index.js [Client Component Browser]
#46 59.65     ./packages/ui/dist/components/index.js [Client Component Browser]
#46 59.65     ./packages/ui/dist/index.js [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/workspaces/[slug]/projects/[projectSlug]/page.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/workspaces/[slug]/projects/[projectSlug]/page.tsx [Server Component]
#46 59.65 
#46 59.65   Client Component SSR:
#46 59.65     ./packages/ui/dist/components/project/project-card.js [Client Component SSR]
#46 59.65     ./packages/ui/dist/components/project/index.js [Client Component SSR]
#46 59.65     ./packages/ui/dist/components/index.js [Client Component SSR]
#46 59.65     ./packages/ui/dist/index.js [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/timer/page.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/timer/page.tsx [Server Component]
#46 59.65 
#46 59.65 https://nextjs.org/docs/messages/module-not-found
#46 59.65 
#46 59.65 
#46 59.65 ./packages/ui/dist/components/project/project-settings-dialog.js:13:1
#46 59.65 Module not found: Can't resolve '@ordo-todo/core'
#46 59.65   11 | import { Button } from '../ui/button.js';
#46 59.65   12 | import { Palette, Check } from 'lucide-react';
#46 59.65 > 13 | import { PROJECT_COLORS, updateProjectSchema } from '@ordo-todo/core';
#46 59.65      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#46 59.65   14 | /**
#46 59.65   15 |  * ProjectSettingsDialog - Platform-agnostic project settings edit dialog
#46 59.65   16 |  *
#46 59.65 
#46 59.65 
#46 59.65 
#46 59.65 Import traces:
#46 59.65   Server Component:
#46 59.65     ./packages/ui/dist/components/project/project-settings-dialog.js
#46 59.65     ./packages/ui/dist/components/project/index.js
#46 59.65     ./packages/ui/dist/components/index.js
#46 59.65     ./packages/ui/dist/index.js
#46 59.65     ./apps/web/src/app/[locale]/not-found.tsx
#46 59.65 
#46 59.65   Client Component Browser:
#46 59.65     ./packages/ui/dist/components/project/project-settings-dialog.js [Client Component Browser]
#46 59.65     ./packages/ui/dist/components/project/index.js [Client Component Browser]
#46 59.65     ./packages/ui/dist/components/index.js [Client Component Browser]
#46 59.65     ./packages/ui/dist/index.js [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/workspaces/[slug]/projects/[projectSlug]/page.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/workspaces/[slug]/projects/[projectSlug]/page.tsx [Server Component]
#46 59.65 
#46 59.65   Client Component SSR:
#46 59.65     ./packages/ui/dist/components/project/project-settings-dialog.js [Client Component SSR]
#46 59.65     ./packages/ui/dist/components/project/index.js [Client Component SSR]
#46 59.65     ./packages/ui/dist/components/index.js [Client Component SSR]
#46 59.65     ./packages/ui/dist/index.js [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/timer/page.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/timer/page.tsx [Server Component]
#46 59.65 
#46 59.65 https://nextjs.org/docs/messages/module-not-found
#46 59.65 
#46 59.65 
#46 59.65 ./packages/ui/dist/components/project/project-settings.js:10:1
#46 59.65 Module not found: Can't resolve '@ordo-todo/core'
#46 59.65    8 | import { Palette, Check, Archive, Trash2, AlertTriangle } from 'lucide-react';
#46 59.65    9 | import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from '../ui/alert-dialog.js';
#46 59.65 > 10 | import { PROJECT_COLORS, updateProjectSchema } from '@ordo-todo/core';
#46 59.65      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#46 59.65   11 | const DEFAULT_LABELS = {
#46 59.65   12 |     general: {
#46 59.65   13 |         title: 'General Settings',
#46 59.65 
#46 59.65 
#46 59.65 
#46 59.65 Import traces:
#46 59.65   Server Component:
#46 59.65     ./packages/ui/dist/components/project/project-settings.js
#46 59.65     ./packages/ui/dist/components/project/index.js
#46 59.65     ./packages/ui/dist/components/index.js
#46 59.65     ./packages/ui/dist/index.js
#46 59.65     ./apps/web/src/app/[locale]/not-found.tsx
#46 59.65 
#46 59.65   Client Component Browser:
#46 59.65     ./packages/ui/dist/components/project/project-settings.js [Client Component Browser]
#46 59.65     ./packages/ui/dist/components/project/index.js [Client Component Browser]
#46 59.65     ./packages/ui/dist/components/index.js [Client Component Browser]
#46 59.65     ./packages/ui/dist/index.js [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/workspaces/[slug]/projects/[projectSlug]/page.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/workspaces/[slug]/projects/[projectSlug]/page.tsx [Server Component]
#46 59.65 
#46 59.65   Client Component SSR:
#46 59.65     ./packages/ui/dist/components/project/project-settings.js [Client Component SSR]
#46 59.65     ./packages/ui/dist/components/project/index.js [Client Component SSR]
#46 59.65     ./packages/ui/dist/components/index.js [Client Component SSR]
#46 59.65     ./packages/ui/dist/index.js [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/timer/page.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/timer/page.tsx [Server Component]
#46 59.65 
#46 59.65 https://nextjs.org/docs/messages/module-not-found
#46 59.65 
#46 59.65 
#46 59.65 ./packages/ui/dist/components/tag/create-tag-dialog.js:4:1
#46 59.65 Module not found: Can't resolve '@ordo-todo/core'
#46 59.65   2 | import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
#46 59.65   3 | import { useState, useEffect } from 'react';
#46 59.65 > 4 | import { TAG_COLORS } from '@ordo-todo/core';
#46 59.65     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#46 59.65   5 | import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '../ui/dialog.js';
#46 59.65   6 | import { Label } from '../ui/label.js';
#46 59.65   7 | import { Input } from '../ui/input.js';
#46 59.65 
#46 59.65 
#46 59.65 
#46 59.65 Import traces:
#46 59.65   Server Component:
#46 59.65     ./packages/ui/dist/components/tag/create-tag-dialog.js
#46 59.65     ./packages/ui/dist/components/tag/index.js
#46 59.65     ./packages/ui/dist/components/index.js
#46 59.65     ./packages/ui/dist/index.js
#46 59.65     ./apps/web/src/app/[locale]/not-found.tsx
#46 59.65 
#46 59.65   Client Component Browser:
#46 59.65     ./packages/ui/dist/components/tag/create-tag-dialog.js [Client Component Browser]
#46 59.65     ./packages/ui/dist/components/tag/index.js [Client Component Browser]
#46 59.65     ./packages/ui/dist/components/index.js [Client Component Browser]
#46 59.65     ./packages/ui/dist/index.js [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/error.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/error.tsx [Server Component]
#46 59.65 
#46 59.65   Client Component SSR:
#46 59.65     ./packages/ui/dist/components/tag/create-tag-dialog.js [Client Component SSR]
#46 59.65     ./packages/ui/dist/components/tag/index.js [Client Component SSR]
#46 59.65     ./packages/ui/dist/components/index.js [Client Component SSR]
#46 59.65     ./packages/ui/dist/index.js [Client Component SSR]
#46 59.65     ./apps/web/src/components/providers/index.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/components/providers/index.tsx [Server Component]
#46 59.65     ./apps/web/src/app/[locale]/layout.tsx [Server Component]
#46 59.65 
#46 59.65 https://nextjs.org/docs/messages/module-not-found
#46 59.65 
#46 59.65 
#46 59.65 ./packages/ui/dist/components/task/create-task-dialog.js:7:1
#46 59.65 Module not found: Can't resolve '@ordo-todo/core'
#46 59.65    5 | import { zodResolver } from '@hookform/resolvers/zod';
#46 59.65    6 | import { z } from 'zod';
#46 59.65 >  7 | import { createTaskSchema } from '@ordo-todo/core';
#46 59.65      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#46 59.65    8 | import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '../ui/dialog.js';
#46 59.65    9 | import { Label } from '../ui/label.js';
#46 59.65   10 | import { Input } from '../ui/input.js';
#46 59.65 
#46 59.65 
#46 59.65 
#46 59.65 Import traces:
#46 59.65   Server Component:
#46 59.65     ./packages/ui/dist/components/task/create-task-dialog.js
#46 59.65     ./packages/ui/dist/components/task/index.js
#46 59.65     ./packages/ui/dist/components/index.js
#46 59.65     ./packages/ui/dist/index.js
#46 59.65     ./apps/web/src/app/[locale]/not-found.tsx
#46 59.65 
#46 59.65   Client Component Browser:
#46 59.65     ./packages/ui/dist/components/task/create-task-dialog.js [Client Component Browser]
#46 59.65     ./packages/ui/dist/components/task/index.js [Client Component Browser]
#46 59.65     ./packages/ui/dist/components/index.js [Client Component Browser]
#46 59.65     ./packages/ui/dist/index.js [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/workspaces/[slug]/projects/[projectSlug]/page.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/workspaces/[slug]/projects/[projectSlug]/page.tsx [Server Component]
#46 59.65 
#46 59.65   Client Component SSR:
#46 59.65     ./packages/ui/dist/components/task/create-task-dialog.js [Client Component SSR]
#46 59.65     ./packages/ui/dist/components/task/index.js [Client Component SSR]
#46 59.65     ./packages/ui/dist/components/index.js [Client Component SSR]
#46 59.65     ./packages/ui/dist/index.js [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/timer/page.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/timer/page.tsx [Server Component]
#46 59.65 
#46 59.65 https://nextjs.org/docs/messages/module-not-found
#46 59.65 
#46 59.65 
#46 59.65 ./packages/ui/dist/components/workspace/create-workspace-dialog.js:13:1
#46 59.65 Module not found: Can't resolve '@ordo-todo/core'
#46 59.65   11 | import { Button } from '../ui/button.js';
#46 59.65   12 | import { Building2, Home, Users } from 'lucide-react';
#46 59.65 > 13 | import { createWorkspaceSchema } from '@ordo-todo/core';
#46 59.65      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#46 59.65   14 | const DEFAULT_LABELS = {
#46 59.65   15 |     title: 'Create Workspace',
#46 59.65   16 |     description: 'Create a new workspace to organize your projects and tasks.',
#46 59.65 
#46 59.65 
#46 59.65 
#46 59.65 Import traces:
#46 59.65   Server Component:
#46 59.65     ./packages/ui/dist/components/workspace/create-workspace-dialog.js
#46 59.65     ./packages/ui/dist/components/workspace/index.js
#46 59.65     ./packages/ui/dist/components/index.js
#46 59.65     ./packages/ui/dist/index.js
#46 59.65     ./apps/web/src/app/[locale]/not-found.tsx
#46 59.65 
#46 59.65   Client Component Browser:
#46 59.65     ./packages/ui/dist/components/workspace/create-workspace-dialog.js [Client Component Browser]
#46 59.65     ./packages/ui/dist/components/workspace/index.js [Client Component Browser]
#46 59.65     ./packages/ui/dist/components/index.js [Client Component Browser]
#46 59.65     ./packages/ui/dist/index.js [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/workspaces/[slug]/projects/[projectSlug]/page.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/workspaces/[slug]/projects/[projectSlug]/page.tsx [Server Component]
#46 59.65 
#46 59.65   Client Component SSR:
#46 59.65     ./packages/ui/dist/components/workspace/create-workspace-dialog.js [Client Component SSR]
#46 59.65     ./packages/ui/dist/components/workspace/index.js [Client Component SSR]
#46 59.65     ./packages/ui/dist/components/index.js [Client Component SSR]
#46 59.65     ./packages/ui/dist/index.js [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/timer/page.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/timer/page.tsx [Server Component]
#46 59.65 
#46 59.65 https://nextjs.org/docs/messages/module-not-found
#46 59.65 
#46 59.65 
#46 59.65 ./node_modules/recharts/es6/util/ReactUtils.js:3:1
#46 59.65 Module not found: Can't resolve 'react-is'
#46 59.65   1 | import get from 'es-toolkit/compat/get';
#46 59.65   2 | import { Children } from 'react';
#46 59.65 > 3 | import { isFragment } from 'react-is';
#46 59.65     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#46 59.65   4 | import { isNullish } from './DataUtils';
#46 59.65   5 | export var SCALE_TYPES = ['auto', 'linear', 'pow', 'sqrt', 'log', 'identity', 'time', 'band', 'point', 'ordinal', 'quantile', 'quantize', 'utc', 'sequential', 'threshold'];
#46 59.65   6 |
#46 59.65 
#46 59.65 
#46 59.65 
#46 59.65 Import traces:
#46 59.65   Client Component Browser:
#46 59.65     ./node_modules/recharts/es6/util/ReactUtils.js [Client Component Browser]
#46 59.65     ./node_modules/recharts/es6/cartesian/Bar.js [Client Component Browser]
#46 59.65     ./packages/ui/dist/components/analytics/weekly-chart.js [Client Component Browser]
#46 59.65     ./packages/ui/dist/components/analytics/index.js [Client Component Browser]
#46 59.65     ./packages/ui/dist/components/index.js [Client Component Browser]
#46 59.65     ./packages/ui/dist/index.js [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/share/task/[token]/page.tsx [Client Component Browser]
#46 59.65     ./apps/web/src/app/[locale]/share/task/[token]/page.tsx [Server Component]
#46 59.65 
#46 59.65   Client Component SSR:
#46 59.65     ./node_modules/recharts/es6/util/ReactUtils.js [Client Component SSR]
#46 59.65     ./node_modules/recharts/es6/cartesian/Bar.js [Client Component SSR]
#46 59.65     ./packages/ui/dist/components/analytics/weekly-chart.js [Client Component SSR]
#46 59.65     ./packages/ui/dist/components/analytics/index.js [Client Component SSR]
#46 59.65     ./packages/ui/dist/components/index.js [Client Component SSR]
#46 59.65     ./packages/ui/dist/index.js [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/workspaces/[slug]/page.tsx [Client Component SSR]
#46 59.65     ./apps/web/src/app/[locale]/(pages)/(internal)/workspaces/[slug]/page.tsx [Server Component]
#46 59.65 
#46 59.65 https://nextjs.org/docs/messages/module-not-found
#46 59.65 
#46 59.65 
#46 59.65     at <unknown> (./apps/web/src/app/api/auth/signup/route.ts:4:1)
#46 59.65     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
#46 59.65     at <unknown> (./apps/web/src/components/analytics/daily-metrics-card.tsx:4:1)
#46 59.65     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
#46 59.65     at <unknown> (./apps/web/src/components/project/create-project-dialog.tsx:21:1)
#46 59.65     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
#46 59.65     at <unknown> (./apps/web/src/components/project/project-card.tsx:17:1)
#46 59.65     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
#46 59.65     at <unknown> (./apps/web/src/components/project/project-settings-dialog.tsx:13:1)
#46 59.65     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
#46 59.65     at <unknown> (./apps/web/src/components/task/create-task-dialog.tsx:8:1)
#46 59.65     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
#46 59.65     at <unknown> (./apps/web/src/components/workspace/create-workspace-dialog.tsx:13:1)
#46 59.65     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
#46 59.65     at <unknown> (./apps/web/src/components/workspace/invite-member-dialog.tsx:14:1)
#46 59.65     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
#46 59.65     at <unknown> (./apps/web/src/data/hooks/use-session.hook.ts:2:1)
#46 59.65     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
#46 59.65     at <unknown> (./apps/web/src/hooks/use-timer-backend.ts:2:1)
#46 59.65     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
#46 59.65     at <unknown> (./packages/ui/dist/components/project/create-project-dialog.js:15:1)
#46 59.65     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
#46 59.65     at <unknown> (./packages/ui/dist/components/project/project-card.js:8:1)
#46 59.65     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
#46 59.65     at <unknown> (./packages/ui/dist/components/project/project-settings-dialog.js:13:1)
#46 59.65     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
#46 59.65     at <unknown> (./packages/ui/dist/components/project/project-settings.js:10:1)
#46 59.65     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
#46 59.65     at <unknown> (./packages/ui/dist/components/tag/create-tag-dialog.js:4:1)
#46 59.65     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
#46 59.65     at <unknown> (./packages/ui/dist/components/task/create-task-dialog.js:7:1)
#46 59.65     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
#46 59.65     at <unknown> (./packages/ui/dist/components/workspace/create-workspace-dialog.js:13:1)
#46 59.65     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
#46 59.65     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
#46 59.70 npm error Lifecycle script `build` failed with error:
#46 59.70 npm error code 1
#46 59.70 npm error path /app/apps/web
#46 59.70 npm error workspace @ordo-todo/web@0.1.0
#46 59.70 npm error location /app/apps/web
#46 59.70 npm error command failed
#46 59.70 npm error command sh -c next build
#46 ERROR: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
------
 > [builder 23/23] RUN npm run build:
59.65     at <unknown> (./packages/ui/dist/components/workspace/create-workspace-dialog.js:13:1)
59.65     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
59.65     at <unknown> (https://nextjs.org/docs/messages/module-not-found)
59.70 npm error Lifecycle script `build` failed with error:
59.70 npm error code 1
59.70 npm error path /app/apps/web
59.70 npm error workspace @ordo-todo/web@0.1.0
59.70 npm error location /app/apps/web
59.70 npm error command failed
59.70 npm error command sh -c next build
------
Dockerfile:77
--------------------
  75 |     # Build Next.js app
  76 |     WORKDIR /app/apps/web
  77 | >>> RUN npm run build
  78 |     
  79 |     # =============================================================================
--------------------
ERROR: failed to build: failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
Reference
Check build summary support
Error: buildx failed with: ERROR: failed to build: failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1