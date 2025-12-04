#!/bin/bash
#
# Add SSH public key to authorized_keys
#
# Usage:
#   SSH_PUBLIC_KEY="ssh-ed25519 AAAA..." ./scripts/add-claude-key.sh
#
# Or pass as argument:
#   ./scripts/add-claude-key.sh "ssh-ed25519 AAAA..."
#
# Security note: Public keys should be passed via environment variable
# or command line, never hardcoded in scripts.

set -euo pipefail

# Get key from argument or environment variable
SSH_PUBLIC_KEY="${1:-${SSH_PUBLIC_KEY:-}}"

if [ -z "$SSH_PUBLIC_KEY" ]; then
  echo "Error: SSH_PUBLIC_KEY not provided"
  echo ""
  echo "Usage:"
  echo "  SSH_PUBLIC_KEY=\"ssh-ed25519 AAAA...\" $0"
  echo "  $0 \"ssh-ed25519 AAAA...\""
  echo ""
  echo "Example:"
  echo "  SSH_PUBLIC_KEY=\"ssh-ed25519 AAAAC3... user@host\" ./scripts/add-claude-key.sh"
  exit 1
fi

# Validate key format (basic check)
if [[ ! "$SSH_PUBLIC_KEY" =~ ^ssh-(ed25519|rsa|ecdsa) ]]; then
  echo "Error: Invalid SSH public key format"
  echo "Key should start with: ssh-ed25519, ssh-rsa, or ssh-ecdsa"
  exit 1
fi

# Ensure .ssh directory exists with correct permissions
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Check if key already exists (avoid duplicates)
if grep -qF "$SSH_PUBLIC_KEY" ~/.ssh/authorized_keys 2>/dev/null; then
  echo "Key already exists in authorized_keys"
  exit 0
fi

# Add key
echo "$SSH_PUBLIC_KEY" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

echo "Key added successfully"
