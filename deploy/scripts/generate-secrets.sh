#!/bin/bash
# =============================================================================
# Generate Secure Secrets for Ordo-Todo Production
# =============================================================================

echo "=========================================="
echo "  Ordo-Todo Secret Generator"
echo "=========================================="
echo ""

echo "Copy these values to your .env file:"
echo ""
echo "# Database Password"
echo "POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)"
echo ""
echo "# JWT Secrets"
echo "JWT_SECRET=$(openssl rand -base64 64)"
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 64)"
echo ""
echo "# NextAuth Secret"
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"
echo ""

read -p "Enter admin password for Traefik dashboard: " TRAEFIK_PASS
if [ -n "$TRAEFIK_PASS" ]; then
    echo ""
    echo "# Traefik Dashboard Auth (escape $ as \$\$ in docker-compose)"
    htpasswd -nb admin "$TRAEFIK_PASS" | sed 's/\$/\$\$/g'
fi

echo ""
echo "=========================================="
echo "  Done! Save these secrets securely."
echo "=========================================="
