# LaunchDarkly Observability Guide

Advanced observability features for the LaunchDarkly Dino Run game.

## Overview

LaunchDarkly observability provides:
- **Real-time Metrics**: Track flag evaluation performance and user interactions
- **Session Replay**: Record and replay user sessions to understand flag impact
- **Custom Events**: Track game-specific events for deeper analytics
- **Performance Monitoring**: Monitor flag evaluation latency and errors

## Quick Implementation

The game already includes basic observability features:

```javascript
// Track game events (already implemented)
window.ldManager.trackGameEvent('game_started', {
    difficulty: 'medium',
    dinoColor: 'green'
});

// Track performance metrics
window.ldManager.trackPerformanceMetric('load_time', 1200, 'ms');
```

## Enhanced Setup (Optional)

For advanced features like session replay:

### 1. Install Packages
```bash
npm install @launchdarkly/observability
npm install @launchdarkly/session-replay
```

### 2. Update HTML (index.html)
Add after the LaunchDarkly SDK script:
```html
<script src="https://unpkg.com/@launchdarkly/observability@latest/dist/observability.min.js"></script>
<script src="https://unpkg.com/@launchdarkly/session-replay@latest/dist/session-replay.min.js"></script>
```

### 3. Update LaunchDarkly Config
In `launchDarklyConfig.js`, replace the client initialization:

```javascript
this.client = window.LDClient.initialize(this.clientSideId, userContext, {
    plugins: [
        new window.LDObserve({
            tracingOrigins: true,
            networkRecording: { enabled: true }
        }),
        new window.LDRecord({
            privacySetting: 'default',
            sampleRate: 0.1,
            maxSessionLength: 30
        })
    ]
});
```

## Built-in Tracking Events

The game automatically tracks:
- `session_started` - When page loads
- `game_started` - When game begins
- `game_ended` - When game ends
- `obstacle_collision` - When player hits obstacle
- `performance_metric` - Page load and other metrics

## Viewing Data

1. **LaunchDarkly Dashboard** → **Insights** → **Events**
2. **Session Replay** → Filter by user or events
3. **Custom Metrics** → Analyze game performance

## Testing

```javascript
// Test in browser console
window.ldManager.trackGameEvent('test_event', {test: true});
window.ldManager.trackPerformanceMetric('test_metric', 100);
```

## Privacy & Performance

- Use appropriate sample rates (0.1 = 10% of sessions)
- Block sensitive selectors for privacy
- Monitor impact on game performance
- Consider data retention policies

For detailed implementation, see the LaunchDarkly [official documentation](https://launchdarkly.com/docs/sdk/observability/javascript). 