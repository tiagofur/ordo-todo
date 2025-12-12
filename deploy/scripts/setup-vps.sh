#!/bin/bash
# =============================================================================
# Ordo-Todo VPS Setup Script
# Run this script on your fresh VPS to set up the environment
# Usage: curl -sSL https://raw.githubusercontent.com/tiagofur/ordo-todo/main/deploy/scripts/setup-vps.sh | sudo bash
# =============================================================================

set -euo pipefail

echo "=========================================="
echo "  Ordo-Todo VPS Setup Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# -----------------------------------------------------------------------------
# 1. Update System
# -----------------------------------------------------------------------------
log_info "Updating system packages..."
apt-get update && apt-get upgrade -y

# -----------------------------------------------------------------------------
# 2. Install Essential Packages
# -----------------------------------------------------------------------------
log_info "Installing essential packages..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    htop \
    git \
    ufw \
    fail2ban \
    unzip \
    apache2-utils

# -----------------------------------------------------------------------------
# 3. Install Docker
# -----------------------------------------------------------------------------
log_info "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    log_info "Docker installed successfully!"
else
    log_info "Docker is already installed."
fi

# Install Docker Compose Plugin
log_info "Installing Docker Compose..."
apt-get install -y docker-compose-plugin

# -----------------------------------------------------------------------------
# 4. Create Application User
# -----------------------------------------------------------------------------
log_info "Creating application user 'ordo'..."
if ! id "ordo" &>/dev/null; then
    useradd -m -s /bin/bash -G docker ordo
    log_info "User 'ordo' created and added to docker group."
else
    log_info "User 'ordo' already exists."
fi

# -----------------------------------------------------------------------------
# 5. Setup Directory Structure
# -----------------------------------------------------------------------------
log_info "Setting up directory structure..."
mkdir -p /opt/ordo-todo/{backups,logs}
chown -R ordo:ordo /opt/ordo-todo
chmod 750 /opt/ordo-todo

# -----------------------------------------------------------------------------
# 6. Configure Firewall (UFW)
# -----------------------------------------------------------------------------
log_info "Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
log_info "Firewall configured. Only SSH, HTTP, and HTTPS are allowed."

# -----------------------------------------------------------------------------
# 7. Configure Fail2Ban
# -----------------------------------------------------------------------------
log_info "Configuring Fail2Ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
EOF

systemctl enable fail2ban
systemctl restart fail2ban
log_info "Fail2Ban configured."

# -----------------------------------------------------------------------------
# 8. Setup Automatic Security Updates
# -----------------------------------------------------------------------------
log_info "Configuring automatic security updates..."
apt-get install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

# -----------------------------------------------------------------------------
# 9. Create Deploy Script
# -----------------------------------------------------------------------------
log_info "Creating deploy script..."
cat > /opt/ordo-todo/deploy.sh << 'EOF'
#!/bin/bash
set -euo pipefail

cd /opt/ordo-todo

echo "[$(date)] Starting deployment..."

# Login to GitHub Container Registry
echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USER" --password-stdin

# Pull latest images
docker compose -f docker-compose.prod.yml pull

# Run migrations
docker compose -f docker-compose.prod.yml up migrations --exit-code-from migrations

# Deploy with zero-downtime
docker compose -f docker-compose.prod.yml up -d --remove-orphans

# Cleanup old images
docker image prune -af --filter "until=168h"

echo "[$(date)] Deployment completed successfully!"
EOF

chmod +x /opt/ordo-todo/deploy.sh
chown ordo:ordo /opt/ordo-todo/deploy.sh

# -----------------------------------------------------------------------------
# 10. Create Backup Script
# -----------------------------------------------------------------------------
log_info "Creating backup script..."
cat > /opt/ordo-todo/backup.sh << 'EOF'
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/opt/ordo-todo/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

cd /opt/ordo-todo

echo "[$(date)] Starting database backup..."

# Backup PostgreSQL
docker compose -f docker-compose.prod.yml exec -T postgres \
    pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$BACKUP_DIR/db_$TIMESTAMP.sql.gz"

echo "[$(date)] Backup created: db_$TIMESTAMP.sql.gz"

# Remove old backups
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "[$(date)] Backup completed. Old backups cleaned up."
EOF

chmod +x /opt/ordo-todo/backup.sh
chown ordo:ordo /opt/ordo-todo/backup.sh

# -----------------------------------------------------------------------------
# 11. Setup Cron Jobs
# -----------------------------------------------------------------------------
log_info "Setting up cron jobs..."
cat > /etc/cron.d/ordo-todo << 'EOF'
# Daily database backup at 3 AM
0 3 * * * ordo /opt/ordo-todo/backup.sh >> /opt/ordo-todo/logs/backup.log 2>&1

# Weekly Docker cleanup at 4 AM on Sundays
0 4 * * 0 root docker system prune -af >> /opt/ordo-todo/logs/cleanup.log 2>&1
EOF

# -----------------------------------------------------------------------------
# 12. Final Steps
# -----------------------------------------------------------------------------
log_info "=========================================="
log_info "  VPS Setup Complete!"
log_info "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Copy your .env file to /opt/ordo-todo/.env"
echo "2. Copy docker-compose.prod.yml to /opt/ordo-todo/"
echo "3. Setup SSH key for GitHub Actions deployment"
echo "4. Configure GitHub secrets in your repository"
echo ""
echo "To generate secure passwords, use:"
echo "  openssl rand -base64 32"
echo ""
echo "To generate Traefik dashboard password:"
echo "  htpasswd -nb admin YOUR_PASSWORD"
echo ""
log_warn "Remember to change the default SSH port for extra security!"
