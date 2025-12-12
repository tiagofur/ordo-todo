Run appleboy/ssh-action@v1.0.3
/usr/bin/docker run --name c0d4cff15d64f2dda742f888345d18bef4474a_a5fa73 --label c0d4cf --workdir /github/workspace --rm -e "NODE_VERSION" -e "REGISTRY" -e "BACKEND_IMAGE" -e "WEB_IMAGE" -e "IMAGE_TAG" -e "GITHUB_USER" -e "GITHUB_TOKEN" -e "INPUT_HOST" -e "INPUT_USERNAME" -e "INPUT_KEY" -e "INPUT_PORT" -e "INPUT_ENVS" -e "INPUT_SCRIPT" -e "INPUT_PASSPHRASE" -e "INPUT_PASSWORD" -e "INPUT_SYNC" -e "INPUT_USE_INSECURE_CIPHER" -e "INPUT_CIPHER" -e "INPUT_TIMEOUT" -e "INPUT_COMMAND_TIMEOUT" -e "INPUT_KEY_PATH" -e "INPUT_FINGERPRINT" -e "INPUT_PROXY_HOST" -e "INPUT_PROXY_PORT" -e "INPUT_PROXY_USERNAME" -e "INPUT_PROXY_PASSWORD" -e "INPUT_PROXY_PASSPHRASE" -e "INPUT_PROXY_TIMEOUT" -e "INPUT_PROXY_KEY" -e "INPUT_PROXY_KEY_PATH" -e "INPUT_PROXY_FINGERPRINT" -e "INPUT_PROXY_CIPHER" -e "INPUT_PROXY_USE_INSECURE_CIPHER" -e "INPUT_SCRIPT_STOP" -e "INPUT_ENVS_FORMAT" -e "INPUT_DEBUG" -e "INPUT_ALLENVS" -e "INPUT_REQUEST_PTY" -e "HOME" -e "GITHUB_JOB" -e "GITHUB_REF" -e "GITHUB_SHA" -e "GITHUB_REPOSITORY" -e "GITHUB_REPOSITORY_OWNER" -e "GITHUB_REPOSITORY_OWNER_ID" -e "GITHUB_RUN_ID" -e "GITHUB_RUN_NUMBER" -e "GITHUB_RETENTION_DAYS" -e "GITHUB_RUN_ATTEMPT" -e "GITHUB_ACTOR_ID" -e "GITHUB_ACTOR" -e "GITHUB_WORKFLOW" -e "GITHUB_HEAD_REF" -e "GITHUB_BASE_REF" -e "GITHUB_EVENT_NAME" -e "GITHUB_SERVER_URL" -e "GITHUB_API_URL" -e "GITHUB_GRAPHQL_URL" -e "GITHUB_REF_NAME" -e "GITHUB_REF_PROTECTED" -e "GITHUB_REF_TYPE" -e "GITHUB_WORKFLOW_REF" -e "GITHUB_WORKFLOW_SHA" -e "GITHUB_REPOSITORY_ID" -e "GITHUB_TRIGGERING_ACTOR" -e "GITHUB_WORKSPACE" -e "GITHUB_ACTION" -e "GITHUB_EVENT_PATH" -e "GITHUB_ACTION_REPOSITORY" -e "GITHUB_ACTION_REF" -e "GITHUB_PATH" -e "GITHUB_ENV" -e "GITHUB_STEP_SUMMARY" -e "GITHUB_STATE" -e "GITHUB_OUTPUT" -e "RUNNER_OS" -e "RUNNER_ARCH" -e "RUNNER_NAME" -e "RUNNER_ENVIRONMENT" -e "RUNNER_TOOL_CACHE" -e "RUNNER_TEMP" -e "RUNNER_WORKSPACE" -e "ACTIONS_RUNTIME_URL" -e "ACTIONS_RUNTIME_TOKEN" -e "ACTIONS_CACHE_URL" -e "ACTIONS_RESULTS_URL" -e GITHUB_ACTIONS=true -e CI=true -v "/var/run/docker.sock":"/var/run/docker.sock" -v "/home/runner/work/_temp":"/github/runner_temp" -v "/home/runner/work/_temp/_github_home":"/github/home" -v "/home/runner/work/_temp/_github_workflow":"/github/workflow" -v "/home/runner/work/_temp/_runner_file_commands":"/github/file_commands" -v "/home/runner/work/ordo-todo/ordo-todo":"/github/workspace" c0d4cf:f15d64f2dda742f888345d18bef4474a
======CMD======
set -euo pipefail

cd /opt/ordo-todo

echo "[$(date)] 🚀 Starting deployment..."

# Export variables for docker-compose
export IMAGE_TAG=$IMAGE_TAG
export GITHUB_USER=$GITHUB_USER
export GITHUB_TOKEN=$GITHUB_TOKEN

# Login to GitHub Container Registry
echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USER" --password-stdin

# Pull new images
echo "[$(date)] 📦 Pulling new images..."
docker compose pull

# Run database migrations
echo "[$(date)] 🗄️ Running database migrations..."
docker compose up migrations --exit-code-from migrations || true

# Deploy with zero-downtime rolling update
echo "[$(date)] 🔄 Deploying services..."
docker compose up -d --remove-orphans backend web

# Wait for health checks
echo "[$(date)] ⏳ Waiting for services to be healthy..."
sleep 30

# Verify deployment
echo "[$(date)] ✅ Verifying deployment..."
docker compose ps

# Cleanup old images
echo "[$(date)] 🧹 Cleaning up..."
docker image prune -af --filter "until=168h" || true

echo "[$(date)] ✅ Deployment completed successfully!"

======END======
out: [Fri Dec 12 15:48:39 UTC 2025] 🚀 Starting deployment...
err: WARNING! Your credentials are stored unencrypted in '/***/.docker/config.json'.
err: Configure a credential helper to remove this warning. See
err: https://docs.docker.com/go/credential-store/
out: Login Succeeded
out: [Fri Dec 12 15:48:39 UTC 2025] 📦 Pulling new images...
err:  Image ghcr.io/tiagofur/ordo-todo-backend:42823aaa11a73e971535f004112e45f6cb105ceb Pulling 
err:  Image postgres:16-alpine Pulling 
err:  Image ghcr.io/tiagofur/ordo-todo-web:42823aaa11a73e971535f004112e45f6cb105ceb Pulling 
err:  Image postgres:16-alpine Pulled 
err:  Image ghcr.io/tiagofur/ordo-todo-web:42823aaa11a73e971535f004112e45f6cb105ceb Error manifest unknown
err:  Image ghcr.io/tiagofur/ordo-todo-backend:42823aaa11a73e971535f004112e45f6cb105ceb Interrupted 
err: Error response from daemon: manifest unknown
2025/12/12 15:48:40 Process exited with status 1