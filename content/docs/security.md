---
title: Security
description: Learn about Eziox's security features and best practices.
category: Account
icon: Shield
order: 7
---

# Security

Your security is our top priority. Here's how we protect your account and data.

## Account Security

### Strong Passwords

We enforce password requirements:

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Two-Factor Authentication (2FA)

Add an extra layer of security with TOTP-based 2FA:

1. Go to **Dashboard → Settings → Security**
2. Click **Enable 2FA**
3. Scan the QR code with your authenticator app
4. Enter the 6-digit code to confirm

**Supported Apps:**
- Google Authenticator
- Authy
- 1Password
- Bitwarden

### Recovery Codes

When you enable 2FA, you'll receive 10 recovery codes:

- Each code can only be used once
- Store them in a safe place
- Use them if you lose access to your authenticator
- Regenerate codes anytime from Settings

### Login Notifications

Get notified when someone logs into your account:

- Email alerts with IP address and device info
- Option to enable/disable in Settings
- Review recent sessions anytime

## Data Protection

### Encryption

- **Passwords** - Hashed with bcrypt (cost factor 12)
- **Sessions** - 64-character cryptographically secure tokens
- **OAuth Tokens** - Encrypted with AES-256-GCM
- **2FA Secrets** - Encrypted at rest

### Secure Cookies

- **HTTP-Only** - Prevents JavaScript access (XSS protection)
- **Secure Flag** - Only sent over HTTPS
- **SameSite=Lax** - CSRF protection

### IP Anonymization

We anonymize IP addresses for GDPR compliance:

- Last octet zeroed (e.g., `192.168.1.x`)
- Full IPs never stored in analytics
- Hashed IPs used for session security

## Bot Protection

### Cloudflare Turnstile

We use Cloudflare Turnstile for invisible bot protection:

- No annoying CAPTCHAs
- Protects sign-up, sign-in, and password reset
- Privacy-preserving verification

### Rate Limiting

We limit requests to prevent abuse:

| Endpoint | Limit |
|----------|-------|
| Login attempts | 5 per 30 minutes |
| Password reset | 3 per hour |
| API requests | 1,000-10,000 per hour |
| File uploads | 10 per minute |

### Account Lockout

After 5 failed login attempts:

- Account locked for 30 minutes
- Email notification sent
- Can unlock via password reset

## Privacy Controls

### Data Export

Download all your data anytime:

1. Go to **Dashboard → Settings → Privacy & Data**
2. Click **Export My Data**
3. Receive a JSON file with all your information

### Account Deletion

Permanently delete your account:

1. Go to **Dashboard → Settings → Danger Zone**
2. Click **Delete Account**
3. Confirm with your password
4. All data deleted within 30 days

### Session Management

View and revoke active sessions:

- See all logged-in devices
- Revoke individual sessions
- Sign out everywhere at once

## Best Practices

### Do's

✅ Use a unique, strong password
✅ Enable two-factor authentication
✅ Keep recovery codes in a safe place
✅ Review login notifications
✅ Sign out on shared devices

### Don'ts

❌ Share your password with anyone
❌ Use the same password on multiple sites
❌ Click suspicious links in emails
❌ Ignore login notifications
❌ Store passwords in plain text

## Reporting Security Issues

Found a vulnerability? Contact us:

- **Email:** security@eziox.link
- **Response Time:** Within 48 hours

We appreciate responsible disclosure and may offer recognition for valid reports.

## Compliance

### GDPR

- Data minimization
- Right to access and deletion
- IP anonymization
- Consent-based processing

### Security Headers

We implement industry-standard security headers:

- `Strict-Transport-Security` (HSTS)
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Content-Security-Policy`

---

Questions about security? Contact us at [security@eziox.link](mailto:security@eziox.link).
