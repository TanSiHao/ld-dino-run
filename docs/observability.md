# LaunchDarkly Observability Guide

Implementation guide for adding official observability and session replay to the LaunchDarkly Dino Run game using the [official LaunchDarkly plugins](https://launchdarkly.com/docs/sdk/observability/javascript).

## Current Status

⚠️ **Observability features are NOT currently implemented** - this guide shows how to add them.

**What's included:**
- ✅ Packages installed: `@launchdarkly/observability` and `@launchdarkly/session-replay`
- ✅ CSP headers configured for observability endpoints
- ❌ **Plugins not yet configured** in LaunchDarkly client initialization
- ❌ **Session replay not yet enabled**
- ❌ **Custom event tracking not yet implemented**

## Implementation Steps

### Step 1: Edit `launchDarklyConfig.js`

Add the observability imports at the top of the file:

```javascript
// Add these imports after existing imports
import { LDObserve } from '@launchdarkly/observability';
import { LDRecord } from '@launchdarkly/session-replay';
```

In the `initialize()` method, add plugins to the client configuration:

```javascript
// Find the LDClient.initialize() call and add plugins option
this.client = LDClient.initialize(this.clientSideId, userContext, {
    // ... existing options ...
    
    // Add observability plugins
    plugins: [
        LDObserve({
            tracingOrigins: [window.location.origin],
            webVitals: { enabled: true },
            eventCapture: { 
                captureClicks: true,
                captureFormSubmits: true,
                capturePageViews: true
            }
        }),
        LDRecord({
            privacySetting: 'default',
            sampleRate: 0.1, // Record 10% of sessions
            maxSessionLength: 30, // Maximum 30 minutes
            blockSelectors: [
                'input[type="password"]',
                '[data-private]'
            ],
            maskTextSelector: '[data-mask]'
        })
    ]
});
```

Add session replay control methods to the LaunchDarklyManager class:

```javascript
// Add these methods to LaunchDarklyManager class

/**
 * Start session replay manually
 */
startSessionReplay() {
    if (this.isReady() && window.LDRecord) {
        window.LDRecord.start();
        this.trackEvent('session_replay_started', { timestamp: new Date().toISOString() });
        console.log('🎥 Session replay started');
        return true;
    }
    console.warn('⚠️ Session replay not available');
    return false;
}

/**
 * Stop session replay manually
 */
stopSessionReplay() {
    if (this.isReady() && window.LDRecord) {
        window.LDRecord.stop();
        this.trackEvent('session_replay_stopped', { timestamp: new Date().toISOString() });
        console.log('⏹️ Session replay stopped');
        return true;
    }
    return false;
}

/**
 * Check if session replay is active
 */
isSessionReplayActive() {
    return this.isReady() && window.LDRecord && window.LDRecord.isRecording();
}

/**
 * Get session replay status
 */
getSessionReplayStatus() {
    if (!this.isReady()) return { available: false, reason: 'LaunchDarkly not initialized' };
    if (!window.LDRecord) return { available: false, reason: 'Session replay plugin not loaded' };
    
    return {
        available: true,
        recording: window.LDRecord.isRecording(),
        sessionId: window.LDRecord.getSessionId(),
        recordingUrl: window.LDRecord.getRecordingUrl()
    };
}

/**
 * Track custom game events with observability
 */
trackGameEvent(eventName, properties = {}) {
    if (!this.isReady()) return;
    
    // Enhanced event with observability metadata
    const eventData = {
        ...properties,
        game: 'dino-run',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        sessionId: this.getCurrentContext()?.key || 'unknown',
        url: window.location.href,
        userAgent: navigator.userAgent.substring(0, 50)
    };
    
    // Send to LaunchDarkly
    this.client.track(eventName, eventData);
    
    // Log for debugging
    console.log(`📊 Event tracked: ${eventName}`, eventData);
}

/**
 * Track performance metrics
 */
trackPerformanceMetric(metricName, value, unit = 'ms') {
    this.trackGameEvent('performance_metric', {
        metric: metricName,
        value: value,
        unit: unit,
        performance: {
            now: performance.now(),
            memory: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
            } : null
        }
    });
}
```

### Step 2: Edit `gameEngine.js`

Add observability tracking to game events:

```javascript
// In the startGame() method, add:
if (window.ldManager) {
    window.ldManager.trackGameEvent('game_started', {
        difficulty: window.ldManager.getDifficulty(),
        dinoColor: window.ldManager.getDinoColor(),
        weather: window.ldManager.getWeather(),
        playerName: this.player?.name || 'Anonymous'
    });
}

// In the gameOver() method, add:
if (window.ldManager) {
    window.ldManager.trackGameEvent('game_ended', {
        finalScore: this.score,
        duration: Date.now() - this.gameStartTime,
        isHighScore: this.score > this.player?.bestScore,
        collisionType: 'obstacle' // or whatever caused game over
    });
}

// In collision detection, add:
if (window.ldManager) {
    window.ldManager.trackGameEvent('obstacle_collision', {
        score: this.score,
        gameSpeed: this.gameSpeed,
        obstacleType: 'cactus', // or current obstacle type
        position: { x: obstacle.x, y: obstacle.y }
    });
}
```

### Step 3: Edit `main.js`

Add performance tracking and session replay controls:

```javascript
// Add performance tracking when page loads
window.addEventListener('load', () => {
    // Track load performance
    setTimeout(() => {
        if (window.ldManager && performance.getEntriesByType) {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                window.ldManager.trackPerformanceMetric('page_load_time', navigation.loadEventEnd - navigation.fetchStart);
                window.ldManager.trackPerformanceMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
            }
        }
    }, 1000);
});

// Add keyboard shortcuts for session replay
document.addEventListener('keydown', (e) => {
    if (e.altKey) {
        switch(e.key.toLowerCase()) {
            // ... existing shortcuts ...
            
            case 'v': // Alt+V - Start session replay
                e.preventDefault();
                if (window.ldManager) {
                    window.ldManager.startSessionReplay();
                }
                break;
                
            case 'x': // Alt+X - Stop session replay  
                e.preventDefault();
                if (window.ldManager) {
                    window.ldManager.stopSessionReplay();
                }
                break;
                
            case 'z': // Alt+Z - Session replay status
                e.preventDefault();
                if (window.ldManager) {
                    console.log('🎥 Session Replay Status:', window.ldManager.getSessionReplayStatus());
                }
                break;
        }
    }
});
```

### Step 4: Verify CSP Headers (Already Configured)

Your `index.html` already includes the required CSP headers:

```html
<meta http-equiv="Content-Security-Policy" content="
    connect-src 'self' https://clientsdk.launchdarkly.com https://events.launchdarkly.com 
                https://pub.observability.app.launchdarkly.com https://otel.observability.app.launchdarkly.com;
    worker-src 'self' data: blob:;
">
```

## Testing Implementation

After making the changes above:

```javascript
// Test observability features
window.ldManager.getSessionReplayStatus();
window.ldManager.startSessionReplay();
window.ldManager.trackGameEvent('test_event', {source: 'console'});

// Track custom performance
window.ldManager.trackPerformanceMetric('test_metric', 42, 'units');

// Check plugins loaded
console.log('Plugins available:', {
    observe: !!window.LDObserve,
    record: !!window.LDRecord
});
```

### New Keyboard Shortcuts
- **Alt + V**: Start session replay
- **Alt + X**: Stop session replay  
- **Alt + Z**: Show session replay status

## Files to Edit Summary

1. **`launchDarklyConfig.js`**: Add imports, plugins configuration, and session replay methods
2. **`gameEngine.js`**: Add game event tracking to start, end, and collision methods
3. **`main.js`**: Add performance tracking and keyboard shortcuts
4. **`index.html`**: CSP headers (already configured ✅)

## Expected Benefits After Implementation

✅ **Automatic Web Vitals**: CLS, FCP, FID, INP, LCP, TTFB tracking  
✅ **Session Replay**: Record and replay user game sessions  
✅ **Custom Game Events**: Track game actions with rich metadata  
✅ **Performance Metrics**: Monitor game performance and load times  
✅ **User Interaction Tracking**: Clicks, form submissions, page views  

## Viewing Data After Implementation

### LaunchDarkly Dashboard
1. **Insights** → **Events**: View custom game events
2. **Session Replay**: Watch recorded user sessions  
3. **Observability**: View performance metrics and web vitals

For detailed API documentation, see the [official LaunchDarkly docs](https://launchdarkly.com/docs/sdk/observability/javascript). 