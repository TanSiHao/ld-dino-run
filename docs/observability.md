# LaunchDarkly Observability Guide

Official observability and session replay implementation for the LaunchDarkly Dino Run game using the [official LaunchDarkly plugins](https://launchdarkly.com/docs/sdk/observability/javascript).

## Overview

This implementation uses the **official LaunchDarkly observability plugins**:
- **`@launchdarkly/observability`**: Real-time metrics, web vitals, and performance tracking
- **`@launchdarkly/session-replay`**: Record and replay user sessions
- **Custom Events**: Game-specific event tracking with enhanced metadata
- **Performance Monitoring**: Automatic web vitals and custom performance metrics

## ✅ Current Implementation

The game **already includes** the official observability features:

### Automatic Tracking
- 🎯 **Web Vitals**: CLS, FCP, FID, INP, LCP, TTFB
- 🎮 **Game Events**: Game start/end, collisions, player actions
- 📊 **Performance Metrics**: Load times, frame rates, memory usage
- 🔗 **Network Tracking**: LaunchDarkly API calls and responses
- 👆 **User Interactions**: Clicks, form submissions, page views

### Manual Controls
```javascript
// Start/stop session replay manually
window.ldManager.startSessionReplay();
window.ldManager.stopSessionReplay();

// Check replay status
window.ldManager.isSessionReplayActive();
window.ldManager.getSessionReplayStatus();

// Track custom game events
window.ldManager.trackGameEvent('level_completed', {
    level: 5,
    score: 1200,
    duration: 45000
});

// Track performance metrics
window.ldManager.trackPerformanceMetric('fps', 60, 'fps');
```

## Technical Implementation

### ES6 Module Imports
```javascript
// Official LaunchDarkly imports (already implemented)
import { initialize } from 'launchdarkly-js-client-sdk';
import { Observability, LDObserve } from '@launchdarkly/observability';
import { SessionReplay, LDRecord } from '@launchdarkly/session-replay';
```

### Plugin Configuration
```javascript
// Official plugin initialization (already implemented)
const client = initialize(clientSideId, userContext, {
    plugins: [
        LDObserve({
            tracingOrigins: [window.location.origin],
            webVitals: { enabled: true },
            eventCapture: { captureClicks: true }
        }),
        LDRecord({
            privacySetting: 'default',
            sampleRate: 0.1,
            maxSessionLength: 30
        })
    ]
});
```

### Content Security Policy
Required CSP headers (already implemented):
```html
<meta http-equiv="Content-Security-Policy" content="
    connect-src 'self' https://clientsdk.launchdarkly.com https://events.launchdarkly.com 
                https://pub.observability.app.launchdarkly.com https://otel.observability.app.launchdarkly.com;
    worker-src 'self' data: blob:;
">
```

## Built-in Game Events

The game automatically tracks these events:

| Event | Description | Metadata |
|-------|-------------|----------|
| `session_started` | Page/game session begins | Referrer, URL, user agent |
| `game_started` | Player starts playing | Difficulty, dino color, weather |
| `game_ended` | Game over or completion | Final score, duration, high score |
| `obstacle_collision` | Player hits obstacle | Score, game speed, obstacle type |
| `performance_metric` | Performance measurements | Load time, FPS, memory usage |
| `flag_evaluation` | Feature flag evaluations | Flag key, value, reason |
| `session_replay_started` | Manual replay start | Options, timestamp |
| `session_replay_stopped` | Manual replay stop | Duration, timestamp |

## Viewing Data

### LaunchDarkly Dashboard
1. **Insights** → **Events**: View custom game events
2. **Session Replay**: Watch recorded user sessions
3. **Observability**: View performance metrics and web vitals

### Console Testing
```javascript
// Test observability features
window.ldManager.startObservabilitySession();
window.ldManager.trackGameEvent('test_event', {source: 'console'});
window.ldManager.getSessionReplayStatus();

// View current configuration
console.log('Plugins loaded:', {
    observe: !!window.LDObserve,
    record: !!window.LDRecord,
    sessionReplay: !!window.SessionReplay
});
```

## Privacy & Performance

### Current Settings
- **Sample Rate**: 10% of sessions recorded (adjustable in `launchDarklyConfig.js`)
- **Privacy**: Default privacy settings with blocked password fields
- **Performance**: Web vitals tracking enabled
- **Session Length**: Maximum 30 minutes per recording

### Privacy Controls
```javascript
// Block sensitive elements (already configured)
blockSelectors: [
    'input[type="password"]',
    '[data-private]',
    '.sensitive-data'
]

// Mask text elements
maskTextSelector: '[data-mask]'
```

## Troubleshooting

### Common Issues
1. **Events not appearing**: Check LaunchDarkly client initialization
2. **Session replay not working**: Verify CSP headers and sample rate
3. **Performance impact**: Adjust sample rate or disable features

### Debug Commands
```javascript
// Check plugin status
window.ldManager.getSessionReplayStatus();

// View tracked events in console
window.ldManager.trackGameEvent('debug_test', {debug: true});

// Check LaunchDarkly connection
window.ldManager.testConnection();
```

## Benefits

✅ **Official Implementation**: Uses LaunchDarkly's official observability plugins  
✅ **Zero Configuration**: Works out of the box with sensible defaults  
✅ **Privacy Compliant**: Automatic masking of sensitive data  
✅ **Performance Optimized**: Minimal impact on game performance  
✅ **Comprehensive Tracking**: Web vitals, custom events, and session replay  

For detailed API documentation, see the [official LaunchDarkly docs](https://launchdarkly.com/docs/sdk/observability/javascript). 