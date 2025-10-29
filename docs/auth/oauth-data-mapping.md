# OAuth Data Mapping

When users sign up with OAuth, we automatically capture all available data without asking them to re-enter it.

## Data Captured by Provider

### Google OAuth

**Auto-filled fields:**
- `email` → user's Gmail address
- `email_verified` → true (Google verifies emails)
- `oauth_display_name` → user's full name
- `oauth_avatar_url` → profile picture URL
- `oauth_locale` → user's language preference (e.g., "en")
- `google_id` → unique Google user ID
- `oauth_raw_profile` → complete profile JSON

**Available but requires extra permissions:**
- Birthday (requires `birthday` scope)
- Gender (requires `profile` scope)

### Facebook OAuth

**Auto-filled fields:**
- `email` → user's Facebook email
- `oauth_display_name` → user's name
- `oauth_avatar_url` → profile picture URL
- `facebook_id` → unique Facebook user ID
- `oauth_raw_profile` → complete profile JSON

**Available with permissions:**
- `city` / `state` / `country` → location (requires `user_location`)
- Birthday (requires `user_birthday`)
- Friends list (requires `user_friends`)

### Bluesky OAuth

**Auto-filled fields:**
- `bluesky_handle` → @username.bsky.social
- `oauth_display_name` → display name
- `oauth_avatar_url` → avatar URL
- `bio` → user bio
- `oauth_raw_profile` → complete profile JSON

**Notes:**
- Email may not be available (Bluesky doesn't require email)
- If no email, we'll ask user to provide one for account recovery

### Mastodon OAuth

**Auto-filled fields:**
- `mastodon_handle` → @username@instance.social
- `oauth_display_name` → display name
- `oauth_avatar_url` → avatar URL
- `bio` → user bio
- `oauth_raw_profile` → complete profile JSON

**Notes:**
- Instance URL stored in `oauth_raw_profile.instance_url`
- Email may not be available depending on instance settings

### Instagram OAuth

**Auto-filled fields:**
- `instagram_id` → unique Instagram user ID
- `oauth_display_name` → username or full name
- `oauth_avatar_url` → profile picture URL
- `bio` → user bio (Business accounts only)
- `oauth_raw_profile` → complete profile JSON

**Notes:**
- Requires Instagram Business or Creator account for full data
- Personal accounts have limited data access

## Mapping Strategy

### On OAuth Signup

1. **Store raw profile** → Save everything in `oauth_raw_profile`
2. **Auto-fill fields** → Map provider data to our schema
3. **User can override** → All auto-filled data is editable by user
4. **Email required** → If provider doesn't give email, ask during onboarding

### Field Priority

When a user has multiple OAuth accounts linked:

1. User's manual input (if they edited it) takes precedence
2. Most recently linked OAuth account's data
3. First OAuth account's data (fallback)

## Privacy

- Raw OAuth profiles are stored for functionality, not shared
- Users can disconnect OAuth providers anytime
- Disconnecting an OAuth provider doesn't delete their TogetherOS account
- Users can request full data export or deletion (GDPR compliant)

## Implementation

See `/lib/auth/oauth-handlers/` for provider-specific mapping functions:
- `google.ts` - Google OAuth handler
- `facebook.ts` - Facebook OAuth handler
- `bluesky.ts` - Bluesky OAuth handler
- `mastodon.ts` - Mastodon OAuth handler
- `instagram.ts` - Instagram OAuth handler

Each handler implements:
```typescript
interface OAuthHandler {
  // Exchange code for tokens
  getTokens(code: string): Promise<OAuthTokens>;

  // Fetch user profile from provider
  getUserProfile(accessToken: string): Promise<OAuthProfile>;

  // Map provider profile to our user schema
  mapToUser(profile: OAuthProfile): Partial<User>;
}
```
