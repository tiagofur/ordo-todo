Run docker/build-push-action@v6
GitHub Actions runtime token ACs
Docker info
Proxy configuration
Buildx version
Builder info
/usr/bin/docker buildx build --cache-from type=gha --cache-to type=gha,mode=max --file apps/backend/Dockerfile --iidfile /home/runner/work/_temp/docker-actions-toolkit-ksi712/build-iidfile-b105ad200f.txt --label org.opencontainers.image.created=2025-12-12T05:10:44.586Z --label org.opencontainers.image.description= --label org.opencontainers.image.licenses= --label org.opencontainers.image.revision=8a7a8874733501e5504051474072ba665fdc17da --label org.opencontainers.image.source=https://github.com/tiagofur/ordo-todo --label org.opencontainers.image.title=ordo-todo --label org.opencontainers.image.url=https://github.com/tiagofur/ordo-todo --label org.opencontainers.image.version=latest --attest type=provenance,mode=min,inline-only=true,builder-id=https://github.com/tiagofur/ordo-todo/actions/runs/20156965978/attempts/1 --tag ghcr.io/tiagofur/ordo-todo-backend:latest --tag ghcr.io/tiagofur/ordo-todo-backend:8a7a887 --metadata-file /home/runner/work/_temp/docker-actions-toolkit-ksi712/build-metadata-2650a7a892.json --push .
#0 building with "builder-ca3e7a03-ac92-4c55-89a2-56ec2b55799a" instance using docker-container driver

#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 3.17kB done
#1 DONE 0.0s

#2 [internal] load metadata for docker.io/library/node:20-alpine
#2 ...

#3 [auth] library/node:pull token for registry-1.docker.io
#3 DONE 0.0s

#2 [internal] load metadata for docker.io/library/node:20-alpine
#2 DONE 1.0s

#4 [internal] load .dockerignore
#4 transferring context: 758B done
#4 DONE 0.0s

#5 [internal] load build context
#5 DONE 0.0s

#6 [deps  1/12] FROM docker.io/library/node:20-alpine@sha256:643e7036aa985317ebfee460005e322aa550c6b6883000d01daefb58689a58e2
#6 resolve docker.io/library/node:20-alpine@sha256:643e7036aa985317ebfee460005e322aa550c6b6883000d01daefb58689a58e2 done
#6 DONE 0.0s

#7 importing cache manifest from gha:5404460553196337880
#7 DONE 0.2s

#5 [internal] load build context
#5 transferring context: 2.26MB 0.2s done
#5 DONE 0.2s

#6 [deps  1/12] FROM docker.io/library/node:20-alpine@sha256:643e7036aa985317ebfee460005e322aa550c6b6883000d01daefb58689a58e2
#6 sha256:6ac8cc1f0b52065d2132d052abc59bf19e19ac0c65729d4300ab41db30fed855 446B / 446B 0.1s done
#6 sha256:34226f5414967f183a8ba2d2a0bf2809b3864182e8f68c07c066fa83f025024a 0B / 1.26MB 0.1s
#6 sha256:d28ab52fe4290429b930e8fa368da4da8a7e63cf143c38f9b869950a67c32645 0B / 42.78MB 0.2s
#6 sha256:34226f5414967f183a8ba2d2a0bf2809b3864182e8f68c07c066fa83f025024a 1.26MB / 1.26MB 0.2s done
#6 sha256:d28ab52fe4290429b930e8fa368da4da8a7e63cf143c38f9b869950a67c32645 22.02MB / 42.78MB 0.3s
#6 sha256:014e56e613968f73cce0858124ca5fbc601d7888099969a4eea69f31dcd71a53 0B / 3.86MB 0.2s
#6 sha256:014e56e613968f73cce0858124ca5fbc601d7888099969a4eea69f31dcd71a53 3.86MB / 3.86MB 0.3s done
#6 extracting sha256:014e56e613968f73cce0858124ca5fbc601d7888099969a4eea69f31dcd71a53 0.1s done
#6 sha256:d28ab52fe4290429b930e8fa368da4da8a7e63cf143c38f9b869950a67c32645 42.78MB / 42.78MB 0.5s done
#6 extracting sha256:d28ab52fe4290429b930e8fa368da4da8a7e63cf143c38f9b869950a67c32645
#6 extracting sha256:d28ab52fe4290429b930e8fa368da4da8a7e63cf143c38f9b869950a67c32645 1.2s done
#6 DONE 1.7s

#6 [deps  1/12] FROM docker.io/library/node:20-alpine@sha256:643e7036aa985317ebfee460005e322aa550c6b6883000d01daefb58689a58e2
#6 extracting sha256:34226f5414967f183a8ba2d2a0bf2809b3864182e8f68c07c066fa83f025024a 0.0s done
#6 extracting sha256:6ac8cc1f0b52065d2132d052abc59bf19e19ac0c65729d4300ab41db30fed855 done
#6 DONE 1.8s

#8 [deps  2/12] WORKDIR /app
#8 DONE 0.5s

#9 [runner  3/12] RUN addgroup --system --gid 1001 nodejs &&     adduser --system --uid 1001 nestjs
#9 DONE 0.1s

#10 [deps  3/12] RUN apk add --no-cache libc6-compat python3 make g++
#10 0.406 ( 1/32) Installing libstdc++-dev (15.2.0-r2)
#10 0.758 ( 2/32) Installing jansson (2.14.1-r0)
#10 0.763 ( 3/32) Installing zstd-libs (1.5.7-r2)
#10 0.781 ( 4/32) Installing binutils (2.45.1-r0)
#10 0.943 ( 5/32) Installing libgomp (15.2.0-r2)
#10 0.953 ( 6/32) Installing libatomic (15.2.0-r2)
#10 0.956 ( 7/32) Installing gmp (6.3.0-r4)
#10 0.970 ( 8/32) Installing isl26 (0.26-r1)
#10 1.020 ( 9/32) Installing mpfr4 (4.2.2-r0)
#10 1.038 (10/32) Installing mpc1 (1.3.1-r1)
#10 1.043 (11/32) Installing gcc (15.2.0-r2)
#10 3.077 (12/32) Installing musl-dev (1.2.5-r21)
#10 3.249 (13/32) Installing g++ (15.2.0-r2)
#10 3.963 (14/32) Installing musl-obstack (1.2.3-r2)
#10 3.966 (15/32) Installing libucontext (1.3.3-r0)
#10 3.969 (16/32) Installing gcompat (1.1.0-r4)
#10 3.973 (17/32) Installing make (4.4.1-r3)
#10 3.979 (18/32) Installing libbz2 (1.0.8-r6)
#10 3.982 (19/32) Installing libexpat (2.7.3-r0)
#10 3.987 (20/32) Installing libffi (3.5.2-r0)
#10 3.990 (21/32) Installing gdbm (1.26-r0)
#10 3.994 (22/32) Installing xz-libs (5.8.1-r0)
#10 4.000 (23/32) Installing mpdecimal (4.0.1-r0)
#10 4.004 (24/32) Installing ncurses-terminfo-base (6.5_p20251123-r0)
#10 4.012 (25/32) Installing libncursesw (6.5_p20251123-r0)
#10 4.019 (26/32) Installing libpanelw (6.5_p20251123-r0)
#10 4.021 (27/32) Installing readline (8.3.1-r0)
#10 4.027 (28/32) Installing sqlite-libs (3.51.1-r0)
#10 4.066 (29/32) Installing python3 (3.12.12-r0)
#10 4.399 (30/32) Installing python3-pycache-pyc0 (3.12.12-r0)
#10 4.585 (31/32) Installing pyc (3.12.12-r0)
#10 4.585 (32/32) Installing python3-pyc (3.12.12-r0)
#10 4.585 Executing busybox-1.37.0-r29.trigger
#10 4.596 OK: 301 MiB in 50 packages
#10 DONE 5.9s

#11 [deps  4/12] COPY package.json package-lock.json ./
#11 DONE 0.1s

#12 [deps  5/12] COPY apps/backend/package.json ./apps/backend/
#12 DONE 0.0s

#13 [deps  6/12] COPY packages/core/package.json ./packages/core/
#13 DONE 0.0s

#14 [deps  7/12] COPY packages/db/package.json ./packages/db/
#14 DONE 0.0s

#15 [deps  8/12] COPY packages/config/package.json ./packages/config/
#15 DONE 0.0s

#16 [deps  9/12] COPY packages/db/prisma ./packages/db/prisma
#16 DONE 0.0s

#17 [deps 10/12] COPY packages/db/prisma.config.ts ./packages/db/
#17 DONE 0.0s

#18 [deps 11/12] RUN npm ci --legacy-peer-deps --ignore-scripts
#18 7.041 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
#18 7.193 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
#18 7.522 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
#18 25.06 
#18 25.06 added 1127 packages, and audited 1143 packages in 25s
#18 25.06 
#18 25.06 227 packages are looking for funding
#18 25.06   run `npm fund` for details
#18 25.17 
#18 25.17 5 vulnerabilities (1 moderate, 4 high)
#18 25.17 
#18 25.17 To address all issues, run:
#18 25.17   npm audit fix
#18 25.17 
#18 25.17 Run `npm audit` for details.
#18 25.17 npm notice
#18 25.17 npm notice New major version of npm available! 10.8.2 -> 11.7.0
#18 25.17 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.7.0
#18 25.17 npm notice To update run: npm install -g npm@11.7.0
#18 25.17 npm notice
#18 DONE 28.4s

#19 [deps 12/12] RUN cd packages/db && npx prisma generate --schema=prisma/schema.prisma
#19 2.269 Loaded Prisma config from prisma.config.ts.
#19 2.269 
#19 3.067 Prisma schema loaded from prisma/schema.prisma
#19 3.077 warn Preview feature "driverAdapters" is deprecated. The functionality can be used without specifying it as a preview feature.
#19 4.286 
#19 4.286 ✔ Generated Prisma Client (v7.0.1) to ./../../node_modules/@prisma/client in 740ms
#19 4.286 
#19 4.286 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
#19 4.286 
#19 4.286 Tip: Interested in query caching in just a few lines of code? Try Accelerate today! https://pris.ly/tip-3-accelerate
#19 4.286 
#19 DONE 4.3s

#20 [builder  3/16] COPY --from=deps /app/node_modules ./node_modules
#20 DONE 11.5s

#21 [builder  4/16] COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
#21 DONE 0.9s

#22 [builder  5/16] COPY package.json package-lock.json turbo.json ./
#22 DONE 0.0s

#23 [builder  6/16] COPY apps/backend ./apps/backend
#23 DONE 0.0s

#24 [builder  7/16] COPY packages/core ./packages/core
#24 DONE 0.0s

#25 [builder  8/16] COPY packages/db ./packages/db
#25 DONE 0.0s

#26 [builder  9/16] COPY packages/config ./packages/config
#26 DONE 0.0s

#27 [builder 10/16] RUN npx prisma generate --schema=packages/db/prisma/schema.prisma
#27 1.770 Prisma schema loaded from packages/db/prisma/schema.prisma
#27 1.813 warn Preview feature "driverAdapters" is deprecated. The functionality can be used without specifying it as a preview feature.
#27 3.031 
#27 3.031 ✔ Generated Prisma Client (v7.0.1) to ./node_modules/@prisma/client in 668ms
#27 3.031 
#27 3.031 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
#27 3.031 
#27 3.031 Tip: Want to turn off tips and other hints? https://pris.ly/tip-4-nohints
#27 3.031 
#27 3.062 npm notice
#27 3.062 npm notice New major version of npm available! 10.8.2 -> 11.7.0
#27 3.062 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.7.0
#27 3.062 npm notice To update run: npm install -g npm@11.7.0
#27 3.062 npm notice
#27 DONE 3.1s

#28 [builder 11/16] WORKDIR /app/packages/core
#28 DONE 0.0s

#29 [builder 12/16] RUN npm run build || true
#29 0.237 
#29 0.237 > @ordo-todo/core@0.1.0 build
#29 0.237 > tsup src/index.ts --format cjs,esm --dts --minify
#29 0.237 
#29 0.242 sh: tsup: not found
#29 0.245 npm error Lifecycle script `build` failed with error:
#29 0.246 npm error code 127
#29 0.246 npm error path /app/packages/core
#29 0.246 npm error workspace @ordo-todo/core@0.1.0
#29 0.246 npm error location /app/packages/core
#29 0.247 npm error command failed
#29 0.247 npm error command sh -c tsup src/index.ts --format cjs,esm --dts --minify
#29 DONE 0.3s

#30 [builder 13/16] WORKDIR /app/packages/config
#30 DONE 0.0s

#31 [builder 14/16] RUN npm run build || true
#31 0.234 
#31 0.234 > @ordo-todo/config@1.0.0 build
#31 0.234 > tsc
#31 0.234 
#31 10.04 tsconfig.json(2,14): error TS6053: File '@ordo-todo/typescript-config/base.json' not found.
#31 10.08 npm error Lifecycle script `build` failed with error:
#31 10.08 npm error code 2
#31 10.08 npm error path /app/packages/config
#31 10.08 npm error workspace @ordo-todo/config@1.0.0
#31 10.08 npm error location /app/packages/config
#31 10.08 npm error command failed
#31 10.08 npm error command sh -c tsc
#31 DONE 10.1s

#32 [builder 15/16] WORKDIR /app/apps/backend
#32 DONE 0.0s

#33 [builder 16/16] RUN npm run build
#33 0.241 
#33 0.241 > @ordo-todo/backend@1.0.0 build
#33 0.241 > nest build
#33 0.241 
#33 14.44 src/ai/ai.service.ts:8:8 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 8 } from '@ordo-todo/core';
#33 14.44          ~~~~~~~~~~~~~~~~~
#33 14.44 src/ai/ai.service.ts:13:8 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 13 } from '@ordo-todo/core';
#33 14.44           ~~~~~~~~~~~~~~~~~
#33 14.44 src/analytics/analytics.service.ts:2:59 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 2 import type { AnalyticsRepository, TimerRepository } from '@ordo-todo/core';
#33 14.44                                                             ~~~~~~~~~~~~~~~~~
#33 14.44 src/analytics/analytics.service.ts:3:40 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 3 import { GetDailyMetricsUseCase } from '@ordo-todo/core';
#33 14.44                                          ~~~~~~~~~~~~~~~~~
#33 14.44 src/auth/auth.service.ts:9:62 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 9 import { RegisterUser, UserLogin, type UserRepository } from '@ordo-todo/core';
#33 14.44                                                                ~~~~~~~~~~~~~~~~~
#33 14.44 src/auth/crypto/bcrypt-crypto.provider.ts:3:37 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 3 import type { CryptoProvider } from '@ordo-todo/core';
#33 14.44                                       ~~~~~~~~~~~~~~~~~
#33 14.44 src/habits/habits.service.ts:24:8 - error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
#33 14.44 
#33 14.44 24 } from 'date-fns';
#33 14.44           ~~~~~~~~~~
#33 14.44 src/objectives/objectives.service.ts:25:8 - error TS2307: Cannot find module 'date-fns' or its corresponding type declarations.
#33 14.44 
#33 14.44 25 } from 'date-fns';
#33 14.44           ~~~~~~~~~~
#33 14.44 src/projects/projects.service.ts:2:40 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 2 import type { ProjectRepository } from '@ordo-todo/core';
#33 14.44                                          ~~~~~~~~~~~~~~~~~
#33 14.44 src/projects/projects.service.ts:8:8 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 8 } from '@ordo-todo/core';
#33 14.44          ~~~~~~~~~~~~~~~~~
#33 14.44 src/repositories/ai-profile.repository.ts:3:48 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 3 import { AIProfile, AIProfileRepository } from '@ordo-todo/core';
#33 14.44                                                  ~~~~~~~~~~~~~~~~~
#33 14.44 src/repositories/analytics.repository.ts:3:51 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 3 import { DailyMetrics, AnalyticsRepository } from '@ordo-todo/core';
#33 14.44                                                     ~~~~~~~~~~~~~~~~~
#33 14.44 src/repositories/productivity-report.repository.ts:10:8 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 10 } from '@ordo-todo/core';
#33 14.44           ~~~~~~~~~~~~~~~~~
#33 14.44 src/repositories/project.repository.ts:3:44 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 3 import { Project, ProjectRepository } from '@ordo-todo/core';
#33 14.44                                              ~~~~~~~~~~~~~~~~~
#33 14.44 src/repositories/tag.repository.ts:3:36 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 3 import { Tag, TagRepository } from '@ordo-todo/core';
#33 14.44                                      ~~~~~~~~~~~~~~~~~
#33 14.44 src/repositories/task.repository.ts:12:8 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 12 } from '@ordo-todo/core';
#33 14.44           ~~~~~~~~~~~~~~~~~
#33 14.44 src/repositories/timer.repository.ts:14:8 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 14 } from '@ordo-todo/core';
#33 14.44           ~~~~~~~~~~~~~~~~~
#33 14.44 src/repositories/user.repository.ts:3:38 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 3 import { User, UserRepository } from '@ordo-todo/core';
#33 14.44                                        ~~~~~~~~~~~~~~~~~
#33 14.44 src/repositories/workflow.repository.ts:2:46 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 2 import { Workflow, WorkflowRepository } from '@ordo-todo/core';
#33 14.44                                                ~~~~~~~~~~~~~~~~~
#33 14.44 src/repositories/workspace-audit-log.repository.ts:7:8 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 7 } from '@ordo-todo/core';
#33 14.44          ~~~~~~~~~~~~~~~~~
#33 14.44 src/repositories/workspace-invitation.repository.ts:12:8 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 12 } from '@ordo-todo/core';
#33 14.44           ~~~~~~~~~~~~~~~~~
#33 14.44 src/repositories/workspace-settings.repository.ts:10:8 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 10 } from '@ordo-todo/core';
#33 14.44           ~~~~~~~~~~~~~~~~~
#33 14.44 src/repositories/workspace.repository.ts:16:8 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 16 } from '@ordo-todo/core';
#33 14.44           ~~~~~~~~~~~~~~~~~
#33 14.44 src/tags/tags.service.ts:2:36 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 2 import type { TagRepository } from '@ordo-todo/core';
#33 14.44                                      ~~~~~~~~~~~~~~~~~
#33 14.44 src/tags/tags.service.ts:8:8 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 8 } from '@ordo-todo/core';
#33 14.44          ~~~~~~~~~~~~~~~~~
#33 14.44 src/tasks/tasks.service.ts:9:58 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 9 import type { TaskRepository, AnalyticsRepository } from '@ordo-todo/core';
#33 14.44                                                            ~~~~~~~~~~~~~~~~~
#33 14.44 src/tasks/tasks.service.ts:14:8 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 14 } from '@ordo-todo/core';
#33 14.44           ~~~~~~~~~~~~~~~~~
#33 14.44 src/timers/timers.service.ts:8:8 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 8 } from '@ordo-todo/core';
#33 14.44          ~~~~~~~~~~~~~~~~~
#33 14.44 src/timers/timers.service.ts:18:8 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 18 } from '@ordo-todo/core';
#33 14.44           ~~~~~~~~~~~~~~~~~
#33 14.44 src/users/users.service.ts:7:37 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 7 import type { UserRepository } from '@ordo-todo/core';
#33 14.44                                       ~~~~~~~~~~~~~~~~~
#33 14.44 src/users/users.service.ts:8:45 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 8 import { UserByEmail, ChangeUserName } from '@ordo-todo/core';
#33 14.44                                               ~~~~~~~~~~~~~~~~~
#33 14.44 src/workflows/workflows.service.ts:2:41 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 2 import type { WorkflowRepository } from '@ordo-todo/core';
#33 14.44                                           ~~~~~~~~~~~~~~~~~
#33 14.44 src/workflows/workflows.service.ts:8:8 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 8 } from '@ordo-todo/core';
#33 14.44          ~~~~~~~~~~~~~~~~~
#33 14.44 src/workspaces/workspaces.service.ts:13:8 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 13 } from '@ordo-todo/core';
#33 14.44           ~~~~~~~~~~~~~~~~~
#33 14.44 src/workspaces/workspaces.service.ts:27:8 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 27 } from '@ordo-todo/core';
#33 14.44           ~~~~~~~~~~~~~~~~~
#33 14.44 src/workspaces/workspaces.service.ts:28:52 - error TS2307: Cannot find module '@ordo-todo/core' or its corresponding type declarations.
#33 14.44 
#33 14.44 28 import type { WorkspaceInvitationRepository } from '@ordo-todo/core';
#33 14.44                                                       ~~~~~~~~~~~~~~~~~
#33 14.44 
#33 14.44 Found 36 error(s).
#33 14.44 
#33 14.51 npm error Lifecycle script `build` failed with error:
#33 14.51 npm error code 1
#33 14.51 npm error path /app/apps/backend
#33 14.51 npm error workspace @ordo-todo/backend@1.0.0
#33 14.51 npm error location /app/apps/backend
#33 14.51 npm error command failed
#33 14.51 npm error command sh -c nest build
#33 ERROR: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
------
 > [builder 16/16] RUN npm run build:
14.44 
14.44 Found 36 error(s).
14.44 
14.51 npm error Lifecycle script `build` failed with error:
14.51 npm error code 1
14.51 npm error path /app/apps/backend
14.51 npm error workspace @ordo-todo/backend@1.0.0
14.51 npm error location /app/apps/backend
14.51 npm error command failed
14.51 npm error command sh -c nest build
------
Dockerfile:54
--------------------
  52 |     # Build the backend
  53 |     WORKDIR /app/apps/backend
  54 | >>> RUN npm run build
  55 |     
  56 |     # =============================================================================
--------------------
ERROR: failed to build: failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
Reference
Check build summary support
Error: buildx failed with: ERROR: failed to build: failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1