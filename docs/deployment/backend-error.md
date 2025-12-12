Run docker/build-push-action@v6
GitHub Actions runtime token ACs
Docker info
Proxy configuration
Buildx version
Builder info
/usr/bin/docker buildx build --build-arg NEXT_PUBLIC_API_URL=https://api.ordotodo.app --build-arg NEXTAUTH_URL=https://ordotodo.app --cache-from type=gha --cache-to type=gha,mode=max --file apps/web/Dockerfile --iidfile /home/runner/work/_temp/docker-actions-toolkit-rHA6lN/build-iidfile-934e43251b.txt --label org.opencontainers.image.created=2025-12-12T05:00:20.783Z --label org.opencontainers.image.description= --label org.opencontainers.image.licenses= --label org.opencontainers.image.revision=b83346ddda25e9969f63e572ba90b7a226a7f48b --label org.opencontainers.image.source=https://github.com/tiagofur/ordo-todo --label org.opencontainers.image.title=ordo-todo --label org.opencontainers.image.url=https://github.com/tiagofur/ordo-todo --label org.opencontainers.image.version=latest --attest type=provenance,mode=min,inline-only=true,builder-id=https://github.com/tiagofur/ordo-todo/actions/runs/20156772480/attempts/1 --tag ghcr.io/tiagofur/ordo-todo-web:latest --tag ghcr.io/tiagofur/ordo-todo-web:b83346d --metadata-file /home/runner/work/_temp/docker-actions-toolkit-rHA6lN/build-metadata-793c46a6e3.json --push .
#0 building with "builder-84a50c17-3df4-46b7-9f22-154df0b2d8aa" instance using docker-container driver

#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 2.76kB done
#1 DONE 0.0s

#2 [internal] load metadata for docker.io/library/node:20-alpine
#2 ...

#3 [auth] library/node:pull token for registry-1.docker.io
#3 DONE 0.0s

#2 [internal] load metadata for docker.io/library/node:20-alpine
#2 DONE 0.9s

#4 [internal] load .dockerignore
#4 transferring context: 758B done
#4 DONE 0.0s

#5 [internal] load build context
#5 DONE 0.0s

#6 [deps  1/15] FROM docker.io/library/node:20-alpine@sha256:643e7036aa985317ebfee460005e322aa550c6b6883000d01daefb58689a58e2
#6 resolve docker.io/library/node:20-alpine@sha256:643e7036aa985317ebfee460005e322aa550c6b6883000d01daefb58689a58e2 done
#6 DONE 0.0s

#7 importing cache manifest from gha:5490303012025437279
#7 DONE 0.2s

#5 [internal] load build context
#5 transferring context: 4.61MB 0.3s done
#5 DONE 0.3s

#6 [deps  1/15] FROM docker.io/library/node:20-alpine@sha256:643e7036aa985317ebfee460005e322aa550c6b6883000d01daefb58689a58e2
#6 sha256:6ac8cc1f0b52065d2132d052abc59bf19e19ac0c65729d4300ab41db30fed855 446B / 446B 0.1s done
#6 sha256:34226f5414967f183a8ba2d2a0bf2809b3864182e8f68c07c066fa83f025024a 1.26MB / 1.26MB 0.2s done
#6 sha256:014e56e613968f73cce0858124ca5fbc601d7888099969a4eea69f31dcd71a53 0B / 3.86MB 0.2s
#6 sha256:d28ab52fe4290429b930e8fa368da4da8a7e63cf143c38f9b869950a67c32645 6.29MB / 42.78MB 0.3s
#6 sha256:014e56e613968f73cce0858124ca5fbc601d7888099969a4eea69f31dcd71a53 3.86MB / 3.86MB 0.4s done
#6 sha256:d28ab52fe4290429b930e8fa368da4da8a7e63cf143c38f9b869950a67c32645 31.67MB / 42.78MB 0.5s
#6 extracting sha256:014e56e613968f73cce0858124ca5fbc601d7888099969a4eea69f31dcd71a53
#6 sha256:d28ab52fe4290429b930e8fa368da4da8a7e63cf143c38f9b869950a67c32645 42.78MB / 42.78MB 0.5s done
#6 extracting sha256:014e56e613968f73cce0858124ca5fbc601d7888099969a4eea69f31dcd71a53 0.1s done
#6 extracting sha256:d28ab52fe4290429b930e8fa368da4da8a7e63cf143c38f9b869950a67c32645
#6 extracting sha256:d28ab52fe4290429b930e8fa368da4da8a7e63cf143c38f9b869950a67c32645 1.0s done
#6 DONE 1.6s

#6 [deps  1/15] FROM docker.io/library/node:20-alpine@sha256:643e7036aa985317ebfee460005e322aa550c6b6883000d01daefb58689a58e2
#6 extracting sha256:34226f5414967f183a8ba2d2a0bf2809b3864182e8f68c07c066fa83f025024a 0.0s done
#6 extracting sha256:6ac8cc1f0b52065d2132d052abc59bf19e19ac0c65729d4300ab41db30fed855 done
#6 DONE 1.6s

#8 [deps  2/15] WORKDIR /app
#8 DONE 0.5s

#9 [runner 3/6] RUN addgroup --system --gid 1001 nodejs &&     adduser --system --uid 1001 nextjs
#9 DONE 0.1s

#10 [deps  3/15] RUN apk add --no-cache libc6-compat
#10 0.480 (1/3) Installing musl-obstack (1.2.3-r2)
#10 0.493 (2/3) Installing libucontext (1.3.3-r0)
#10 0.504 (3/3) Installing gcompat (1.1.0-r4)
#10 0.520 OK: 10 MiB in 21 packages
#10 DONE 0.5s

#11 [deps  4/15] COPY package.json package-lock.json ./
#11 DONE 0.0s

#12 [deps  5/15] COPY apps/web/package.json ./apps/web/
#12 DONE 0.0s

#13 [deps  6/15] COPY packages/core/package.json ./packages/core/
#13 DONE 0.0s

#14 [deps  7/15] COPY packages/db/package.json ./packages/db/
#14 DONE 0.0s

#15 [deps  8/15] COPY packages/config/package.json ./packages/config/
#15 DONE 0.0s

#16 [deps  9/15] COPY packages/ui/package.json ./packages/ui/
#16 DONE 0.0s

#17 [deps 10/15] COPY packages/hooks/package.json ./packages/hooks/
#17 DONE 0.0s

#18 [deps 11/15] COPY packages/stores/package.json ./packages/stores/
#18 DONE 0.0s

#19 [deps 12/15] COPY packages/i18n/package.json ./packages/i18n/
#19 DONE 0.0s

#20 [deps 13/15] COPY packages/styles/package.json ./packages/styles/
#20 DONE 0.0s

#21 [deps 14/15] COPY packages/api-client/package.json ./packages/api-client/
#21 DONE 0.0s

#22 [deps 15/15] RUN npm ci --legacy-peer-deps
#22 9.811 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
#22 10.44 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
#22 12.68 npm warn deprecated @types/jwt-decode@3.1.0: This is a stub types definition. jwt-decode provides its own type definitions, so you do not need this installed.
#22 44.95 npm error code 1
#22 44.95 npm error path /app/packages/db
#22 44.95 npm error command failed
#22 44.95 npm error command sh -c prisma generate
#22 44.95 npm error Error: Could not find Prisma Schema that is required for this command.
#22 44.95 npm error You can either provide it with `--schema` argument,
#22 44.95 npm error set it in your Prisma Config file (e.g., `prisma.config.ts`),
#22 44.95 npm error set it as `prisma.schema` in your package.json,
#22 44.95 npm error or put it into the default location (`./prisma/schema.prisma`, or `./schema.prisma`.
#22 44.95 npm error Checked following paths:
#22 44.95 npm error
#22 44.95 npm error schema.prisma: file not found
#22 44.95 npm error prisma/schema.prisma: file not found
#22 44.95 npm error
#22 44.95 npm error See also https://pris.ly/d/prisma-schema-location
#22 44.95 npm notice
#22 44.95 npm notice New major version of npm available! 10.8.2 -> 11.7.0
#22 44.95 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.7.0
#22 44.95 npm notice To update run: npm install -g npm@11.7.0
#22 44.95 npm notice
#22 44.95 npm error A complete log of this run can be found in: /root/.npm/_logs/2025-12-12T05_00_25_785Z-debug-0.log
#22 ERROR: process "/bin/sh -c npm ci --legacy-peer-deps" did not complete successfully: exit code: 1
------
 > [deps 15/15] RUN npm ci --legacy-peer-deps:
44.95 npm error schema.prisma: file not found
44.95 npm error prisma/schema.prisma: file not found
44.95 npm error
44.95 npm error See also https://pris.ly/d/prisma-schema-location
44.95 npm notice
44.95 npm notice New major version of npm available! 10.8.2 -> 11.7.0
44.95 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.7.0
44.95 npm notice To update run: npm install -g npm@11.7.0
44.95 npm notice
44.95 npm error A complete log of this run can be found in: /root/.npm/_logs/2025-12-12T05_00_25_785Z-debug-0.log
------
Dockerfile:23
--------------------
  21 |     
  22 |     # Install dependencies
  23 | >>> RUN npm ci --legacy-peer-deps
  24 |     
  25 |     # =============================================================================
--------------------
ERROR: failed to build: failed to solve: process "/bin/sh -c npm ci --legacy-peer-deps" did not complete successfully: exit code: 1
Reference
Check build summary support
Error: buildx failed with: ERROR: failed to build: failed to solve: process "/bin/sh -c npm ci --legacy-peer-deps" did not complete successfully: exit code: 1