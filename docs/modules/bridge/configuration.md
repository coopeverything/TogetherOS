# Bridge Configuration Guide

This guide covers setting up Bridge for local development and production deployment.

## Prerequisites

- Node.js 20+
- npm or pnpm
- OpenAI API account (required)

## Environment Variables

Bridge requires several environment variables to function. Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Required Variables

#### `OPENAI_API_KEY`
**Required**: Yes
**Purpose**: Authenticates requests to OpenAI's API for generating responses
**How to obtain**:
1. Sign up at https://platform.openai.com
2. Navigate to API Keys section
3. Create a new secret key
4. Copy the key (starts with `sk-`)

**Example**:
```bash
OPENAI_API_KEY=sk-proj-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

**Cost considerations**:
- Bridge uses `gpt-3.5-turbo` by default (~$0.002 per 1K tokens)
- Average question + answer: ~500 tokens = $0.001 per interaction
- With 30 requests/hour/IP default limit: ~$0.72/day max per active user
- Monitor usage at https://platform.openai.com/usage

### Optional Variables

#### `BRIDGE_RATE_LIMIT_PER_HOUR`
**Default**: `30`
**Purpose**: Maximum requests per hour per IP address
**Recommended values**:
- Development: `100` (relaxed for testing)
- Production: `30` (prevents abuse)
- High-traffic sites: `10-20` (cost control)

**Example**:
```bash
BRIDGE_RATE_LIMIT_PER_HOUR=30
```

#### `BRIDGE_IP_SALT`
**Default**: Auto-generated UUID if not set
**Purpose**: Salt for hashing IP addresses in logs (privacy protection)
**How to generate**:
```bash
# Linux/macOS
openssl rand -hex 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example**:
```bash
BRIDGE_IP_SALT=a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2
```

**Important**: Keep this secret! If leaked, IP addresses in logs can be de-anonymized.

#### `BRIDGE_ENV`
**Default**: `development`
**Purpose**: Environment indicator for logging and debugging
**Allowed values**: `development`, `production`

**Example**:
```bash
BRIDGE_ENV=production
```

## Setup Steps

### 1. Install Dependencies

```bash
# From project root
npm install
```

### 2. Configure Environment

```bash
# Copy example
cp .env.example .env

# Edit with your values
nano .env  # or vim, code, etc.
```

### 3. Verify Configuration

```bash
# Check OpenAI API key is valid
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  | grep -q "gpt-3.5-turbo" && echo "✓ API key valid" || echo "✗ API key invalid"
```

### 4. Run Development Server

```bash
cd apps/web
npm run dev
```

Visit http://localhost:3000/bridge to test.

### 5. Test Rate Limiting

```bash
# Send 35 requests rapidly (should hit rate limit after 30)
for i in {1..35}; do
  curl -X POST http://localhost:3000/api/bridge/ask \
    -H "Content-Type: application/json" \
    -d '{"question":"test"}' \
    && echo " [$i]"
done
```

You should see HTTP 429 responses after request 30.

## Fallback Handling

If OpenAI API fails (network issues, quota exceeded, etc.), Bridge returns appropriate errors:

- **401 Unauthorized**: Invalid or missing API key → Check `OPENAI_API_KEY`
- **429 Rate Limited**: User exceeded request limit → Wait for rate limit window to reset
- **500 Server Error**: OpenAI API failure → Check OpenAI status page

### Testing Fallbacks

```bash
# Test with invalid API key (should return 401)
OPENAI_API_KEY=invalid npm run dev

# Test rate limiting (send 31 requests)
# See step 5 above
```

## Production Deployment

### Additional Considerations

1. **Security**:
   - Never commit `.env` to version control (already in `.gitignore`)
   - Use environment variable injection (Vercel, Railway, etc.)
   - Rotate `BRIDGE_IP_SALT` periodically

2. **Cost Control**:
   - Set `BRIDGE_RATE_LIMIT_PER_HOUR=20` or lower
   - Monitor OpenAI usage dashboard daily
   - Set up billing alerts at https://platform.openai.com/account/billing

3. **Logging**:
   - Logs are written to `logs/bridge/actions-YYYY-MM-DD.ndjson`
   - Ensure log directory has write permissions
   - Set up log rotation (logrotate, systemd, etc.)

4. **Monitoring**:
   - Check logs for 429 errors (rate limit abuse)
   - Check logs for 401 errors (API key issues)
   - Monitor `latency_ms` field for performance degradation

### Example Production `.env`

```bash
# Production
OPENAI_API_KEY=sk-proj-[your-production-key]
BRIDGE_RATE_LIMIT_PER_HOUR=20
BRIDGE_IP_SALT=[64-char-hex-string]
BRIDGE_ENV=production
```

## Troubleshooting

### "401 Unauthorized" on every request
- Check `OPENAI_API_KEY` is set correctly
- Verify key is active at https://platform.openai.com/api-keys
- Check for extra whitespace in `.env` file

### "429 Rate limit exceeded" from OpenAI (not Bridge)
- You've exceeded OpenAI's quota
- Add credits at https://platform.openai.com/account/billing
- Or wait for quota reset (check your plan limits)

### No response, hangs indefinitely
- OpenAI API may be down (check https://status.openai.com)
- Network connectivity issues
- Firewall blocking outbound HTTPS

### Logs not being created
- Check `logs/bridge/` directory exists and is writable
- Run `mkdir -p logs/bridge && chmod 755 logs/bridge`

### IP hashing not working
- Set `BRIDGE_IP_SALT` explicitly (don't rely on auto-generation)
- Verify salt is at least 32 characters

## Next Steps

- Review [landing-pilot.md](./landing-pilot.md) for full Bridge architecture
- Check [../../STATUS_v2.md](../../STATUS_v2.md) for Bridge roadmap
- Explore validator script: [../../../scripts/validate-bridge-logs.sh](../../../scripts/validate-bridge-logs.sh)

---

*Last updated: 2025-10-27*
