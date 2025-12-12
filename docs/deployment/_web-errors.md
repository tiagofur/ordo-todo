Run docker/build-push-action@v6
GitHub Actions runtime token ACs
Docker info
Proxy configuration
Buildx version
Builder info
/usr/bin/docker buildx build --file apps/backend/Dockerfile --iidfile /home/runner/work/_temp/docker-actions-toolkit-4wKDc6/build-iidfile-7eb246e5f8.txt --attest type=provenance,mode=min,inline-only=true,builder-id=https://github.com/tiagofur/ordo-todo/actions/runs/20171780687/attempts/1 --tag :42823aaa11a73e971535f004112e45f6cb105ceb --tag :latest --metadata-file /home/runner/work/_temp/docker-actions-toolkit-4wKDc6/build-metadata-f2c8c7247a.json --push .
ERROR: failed to build: invalid tag ":42823aaa11a73e971535f004112e45f6cb105ceb": invalid reference format
Reference
Check build summary support
Error: buildx failed with: ERROR: failed to build: invalid tag ":42823aaa11a73e971535f004112e45f6cb105ceb": invalid reference format


Run docker/build-push-action@v6
GitHub Actions runtime token ACs
Docker info
Proxy configuration
Buildx version
Builder info
/usr/bin/docker buildx build --build-arg NEXT_PUBLIC_API_URL=https://api.ordotodo.app --build-arg NEXTAUTH_URL=https://ordotodo.app --file apps/web/Dockerfile --iidfile /home/runner/work/_temp/docker-actions-toolkit-v4tZHB/build-iidfile-3d97c2dc25.txt --attest type=provenance,mode=min,inline-only=true,builder-id=https://github.com/tiagofur/ordo-todo/actions/runs/20171780687/attempts/1 --tag :42823aaa11a73e971535f004112e45f6cb105ceb --tag :latest --metadata-file /home/runner/work/_temp/docker-actions-toolkit-v4tZHB/build-metadata-0cb7532437.json --push .
ERROR: failed to build: invalid tag ":42823aaa11a73e971535f004112e45f6cb105ceb": invalid reference format
Reference
Check build summary support
Error: buildx failed with: ERROR: failed to build: invalid tag ":42823aaa11a73e971535f004112e45f6cb105ceb": invalid reference format