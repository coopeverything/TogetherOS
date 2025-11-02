# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability in TogetherOS, please report it responsibly:

**Email:** security@coopeverything.org

**Please include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Any suggested fixes (optional)

**Response time:** We aim to respond within 48 hours.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| yolo    | :white_check_mark: |

## Security Measures

TogetherOS implements several security measures:

- **Code Scanning:** GitHub CodeQL analyzes code for vulnerabilities
- **Secret Scanning:** Automated detection of committed secrets
- **Dependency Scanning:** Dependabot monitors for vulnerable dependencies
- **Dual-bot PR Review:** Codex + Copilot review all code changes
- **Error Tracking:** Sentry monitors production errors
- **Health Monitoring:** Automated health checks with rollback capability

## Privacy

TogetherOS is privacy-first:
- No raw prompts stored
- IP hashing for logs
- PII redaction in audit trails
- Append-only NDJSON logs for transparency

For more details, see our [Privacy Documentation](docs/PRIVACY.md).
