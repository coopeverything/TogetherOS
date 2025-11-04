# Recommendation System Cron Jobs

## Overview

The recommendation system includes two background jobs that should run on a schedule:

1. **Generate Job** - Creates recommendations for active users
2. **Cleanup Job** - Removes old recommendations and refreshes analytics

## Job Endpoints

### 1. Generate Recommendations

**Endpoint:** `POST /api/bridge/recommendations/jobs/generate`

**Headers:**
```
x-api-key: your-job-api-key
Content-Type: application/json
```

**Body:**
```json
{
  "batchSize": 100,
  "maxBatches": 10
}
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "usersProcessed": 450,
    "recommendationsGenerated": 2250,
    "errors": 5,
    "duration": "45000ms"
  },
  "errorSample": ["Error messages..."]
}
```

### 2. Cleanup Old Recommendations

**Endpoint:** `POST /api/bridge/recommendations/jobs/cleanup`

**Headers:**
```
x-api-key: your-job-api-key
Content-Type: application/json
```

**Body:**
```json
{
  "olderThanDays": 30
}
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "deleted": 1250,
    "olderThanDays": 30
  }
}
```

## Cron Schedule Recommendations

### Using System Cron

Add to `/etc/crontab` or user crontab:

```bash
# Generate recommendations daily at 2 AM
0 2 * * * curl -X POST https://your-domain.com/api/bridge/recommendations/jobs/generate \
  -H "x-api-key: $JOB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 100, "maxBatches": 10}'

# Cleanup weekly on Sunday at 3 AM
0 3 * * 0 curl -X POST https://your-domain.com/api/bridge/recommendations/jobs/cleanup \
  -H "x-api-key: $JOB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"olderThanDays": 30}'
```

### Using GitHub Actions (Recommended for VPS deployments)

Create `.github/workflows/recommendation-jobs.yml`:

```yaml
name: Recommendation Jobs

on:
  schedule:
    # Generate recommendations daily at 2 AM UTC
    - cron: '0 2 * * *'
    # Cleanup weekly on Sunday at 3 AM UTC
    - cron: '0 3 * * 0'
  workflow_dispatch: # Allow manual trigger

jobs:
  generate:
    if: github.event.schedule == '0 2 * * *' || github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    steps:
      - name: Generate Recommendations
        run: |
          curl -X POST https://www.coopeverything.org/api/bridge/recommendations/jobs/generate \
            -H "x-api-key: ${{ secrets.JOB_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"batchSize": 100, "maxBatches": 10}'

  cleanup:
    if: github.event.schedule == '0 3 * * 0' || github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    steps:
      - name: Cleanup Old Recommendations
        run: |
          curl -X POST https://www.coopeverything.org/api/bridge/recommendations/jobs/cleanup \
            -H "x-api-key: ${{ secrets.JOB_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{"olderThanDays": 30}'
```

**Setup:**
1. Add `JOB_API_KEY` to repository secrets
2. Enable GitHub Actions in repository settings
3. Jobs will run automatically on schedule

### Using Node-Cron (In-Process Scheduler)

For development or single-server deployments, add to `apps/web/app/api/cron/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateRecommendationsForActiveUsers, cleanupOldRecommendations } from '@/lib/bridge/recommendation-jobs';
import { refreshPerformanceView } from '@/lib/bridge/recommendation-analytics';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const job = request.nextUrl.searchParams.get('job');

  if (job === 'generate') {
    const result = await generateRecommendationsForActiveUsers(100, 10);
    return NextResponse.json(result);
  }

  if (job === 'cleanup') {
    const deleted = await cleanupOldRecommendations(30);
    await refreshPerformanceView();
    return NextResponse.json({ deleted });
  }

  return NextResponse.json({ error: 'Unknown job' }, { status: 400 });
}
```

Then use Vercel Cron or similar service to trigger it.

## Environment Variables

Add to `.env`:

```bash
# Job API key for cron job authentication
JOB_API_KEY=your-secure-random-key-here
```

**Generate secure key:**
```bash
openssl rand -hex 32
```

## Monitoring

Monitor job execution via:
- Application logs
- Database query: `SELECT * FROM user_activity WHERE action LIKE 'job_%'`
- Analytics dashboard: Track `recommendationsGenerated`, `errors`, `duration`

## Troubleshooting

**Job takes too long:**
- Reduce `batchSize` or `maxBatches`
- Increase server timeout limits
- Consider splitting into smaller jobs

**High error rate:**
- Check database connection
- Verify user_interests table has data
- Check logs for specific error messages

**No recommendations generated:**
- Verify users have `onboarding_completed_at` set
- Check users have `last_seen_at` within 30 days
- Ensure user_interests table has entries
