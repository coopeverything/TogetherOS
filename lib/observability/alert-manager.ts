/**
 * Self-Hosted Alert Manager
 *
 * Centralized alerting via Discord, Slack, or custom webhooks
 * No external service signups required - just webhook URLs
 */

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface Alert {
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Send alert to Discord webhook
 */
async function sendDiscordAlert(webhookUrl: string, alert: Alert): Promise<void> {
  const emoji = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🔵',
  }[alert.severity];

  const payload = {
    content: `${emoji} **${alert.severity.toUpperCase()}**: ${alert.title}`,
    embeds: [
      {
        description: alert.message,
        timestamp: alert.timestamp || new Date().toISOString(),
        color: {
          critical: 0xff0000,
          high: 0xff6600,
          medium: 0xffcc00,
          low: 0x0099ff,
        }[alert.severity],
        fields: alert.metadata
          ? Object.entries(alert.metadata).map(([key, value]) => ({
              name: key,
              value: String(value),
              inline: true,
            }))
          : undefined,
      },
    ],
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`);
  }
}

/**
 * Send alert to Slack webhook
 */
async function sendSlackAlert(webhookUrl: string, alert: Alert): Promise<void> {
  const emoji = {
    critical: ':red_circle:',
    high: ':large_orange_circle:',
    medium: ':large_yellow_circle:',
    low: ':large_blue_circle:',
  }[alert.severity];

  const payload = {
    text: `${emoji} *${alert.severity.toUpperCase()}*: ${alert.title}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${emoji} *${alert.severity.toUpperCase()}*: ${alert.title}\n\n${alert.message}`,
        },
      },
      ...(alert.metadata
        ? [
            {
              type: 'section',
              fields: Object.entries(alert.metadata).map(([key, value]) => ({
                type: 'mrkdwn',
                text: `*${key}:*\n${String(value)}`,
              })),
            },
          ]
        : []),
    ],
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Slack webhook failed: ${response.status} ${response.statusText}`);
  }
}

/**
 * Send alert to generic webhook
 */
async function sendWebhookAlert(webhookUrl: string, alert: Alert): Promise<void> {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alert),
  });

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
  }
}

/**
 * Send alert to configured channels
 */
export async function sendAlert(alert: Alert): Promise<void> {
  const { severity } = alert;

  // Check minimum severity threshold
  const minSeverity = process.env.ALERT_MIN_SEVERITY || 'medium';
  const severityLevels: AlertSeverity[] = ['low', 'medium', 'high', 'critical'];
  const minLevel = severityLevels.indexOf(minSeverity as AlertSeverity);
  const alertLevel = severityLevels.indexOf(severity);

  if (alertLevel < minLevel) {
    // Alert below threshold, skip
    return;
  }

  const promises: Promise<void>[] = [];

  // Discord webhook
  const discordWebhook = process.env.ALERT_DISCORD_WEBHOOK;
  if (discordWebhook) {
    promises.push(
      sendDiscordAlert(discordWebhook, alert).catch(err => {
        console.error('Failed to send Discord alert:', err);
      })
    );
  }

  // Slack webhook
  const slackWebhook = process.env.ALERT_SLACK_WEBHOOK;
  if (slackWebhook) {
    promises.push(
      sendSlackAlert(slackWebhook, alert).catch(err => {
        console.error('Failed to send Slack alert:', err);
      })
    );
  }

  // Generic webhook
  const genericWebhook = process.env.ALERT_WEBHOOK_URL;
  if (genericWebhook) {
    promises.push(
      sendWebhookAlert(genericWebhook, alert).catch(err => {
        console.error('Failed to send webhook alert:', err);
      })
    );
  }

  // If no webhooks configured, log to console
  if (promises.length === 0) {
    console.warn('[Alert]', JSON.stringify(alert));
    return;
  }

  // Wait for all alerts to send (with error handling)
  await Promise.allSettled(promises);
}

/**
 * Convenience functions for common alert types
 */
export const alerts = {
  healthCheckFailed: (details: string) =>
    sendAlert({
      severity: 'critical',
      title: 'Health Check Failed',
      message: `System health check failed: ${details}`,
      metadata: { source: 'health-check', timestamp: new Date().toISOString() },
    }),

  errorSpike: (count: number, window: string) =>
    sendAlert({
      severity: 'high',
      title: 'Error Spike Detected',
      message: `${count} errors in ${window}`,
      metadata: { error_count: count, time_window: window },
    }),

  memoryWarning: (percentage: number) =>
    sendAlert({
      severity: percentage > 90 ? 'critical' : 'high',
      title: 'High Memory Usage',
      message: `Memory usage at ${percentage.toFixed(1)}%`,
      metadata: { memory_percentage: percentage },
    }),

  deploymentFailed: (details: string) =>
    sendAlert({
      severity: 'critical',
      title: 'Deployment Failed',
      message: `Deployment failed: ${details}`,
      metadata: { source: 'deployment', timestamp: new Date().toISOString() },
    }),

  slowResponse: (route: string, latency: number) =>
    sendAlert({
      severity: 'medium',
      title: 'Slow Response Detected',
      message: `Route ${route} took ${latency}ms (threshold: 1000ms)`,
      metadata: { route, latency_ms: latency },
    }),
};
