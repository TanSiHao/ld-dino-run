# LaunchDarkly Observability Guide

Implementation guide for adding official observability and session replay to the LaunchDarkly Dino Run game using the [official LaunchDarkly plugins](https://launchdarkly.com/docs/sdk/observability/javascript).

## Current Status

✅ **Observability features are implemented and ready to use** - this guide shows the complete configuration.

**What's included:**
- ✅ Packages installed: `@launchdarkly/observability@0.3.7` and `@launchdarkly/session-replay@0.3.7`
- ✅ CSP headers configured for observability endpoints
- ✅ Import maps configured for browser ES6 module resolution (using CDN version 0.3.7)
- ✅ **Working implementation** using constructor pattern with default imports
- ✅ **Session replay enabled** with privacy controls (`privacySetting: 'none'`)
- ✅ **Network recording enabled** with headers and body recording
- ✅ **Custom event tracking implemented** with game-specific metadata

**Currently working features:**
- 🎥 **Session replay recording** (100% capture with current settings)
- 📊 **Web vitals tracking** and performance metrics
- 🌐 **Network recording** with full request/response capture
- 🎮 **Custom game event tracking** with observability metadata
- 📈 **Performance metrics collection** 
- 🖱️ **User interaction tracking**

## Implementation Steps

### Step 0: Configure Import Maps (Required for Browser ES6 Modules)

**⚠️ CRITICAL: This step must be completed first or the observability imports will crash the game.**

#### Why This Is Needed
Browser ES6 modules require explicit URL mappings for npm packages. Unlike Node.js, browsers cannot automatically resolve package names like `@launchdarkly/observability` without import maps.

#### Edit `index.html`
Find the import map section (around line 210) and update it to include the observability packages:

```html
<!-- Import maps with observability support -->
<script type="importmap">
{
    "imports": {
        "launchdarkly-js-client-sdk": "https://esm.run/launchdarkly-js-client-sdk@3.8.1",
        "@launchdarkly/observability": "https://esm.run/@launchdarkly/observability@0.3.7",
        "@launchdarkly/session-replay": "https://esm.run/@launchdarkly/session-replay@0.3.7"
    }
}
</script>
```

#### Common Import Errors (Before Fix)
If you see errors like these, it means the import map is missing:
```
Failed to resolve module specifier "@launchdarkly/observability"
Uncaught TypeError: Failed to resolve module specifier '@launchdarkly/observability'
```

### Step 1: Edit `launchDarklyConfig.js`

#### Add the Observability Imports
At the top of the file (around lines 5-6), ensure these imports are present and **not commented out**:

```javascript
// ES6 imports with observability support  
import { initialize } from "launchdarkly-js-client-sdk";
import Observability from '@launchdarkly/observability'
import SessionReplay from '@launchdarkly/session-replay'
```

**⚠️ Important**: Use **default imports** (not named exports) for the observability packages. The working pattern is `import Observability from` rather than `import { Observability } from`.

#### Configure the Plugins in Client Options

In the `_performInitialization()` method (around line 149), find the LaunchDarkly client initialization and update it to use the **constructor pattern**:

```javascript
// Use the constructor pattern directly in the initialize call:
this.client = initialize(this.clientSideId, context, {
    plugins: [ 
        new Observability({
            tracingOrigins: true,
            networkRecording: {
                enabled: true,
                recordHeadersAndBody: true
            }
        }), 
        new SessionReplay({
            privacySetting: 'none',
        }) 
    ]
});
```

**✅ Key Points:**
- **Constructor pattern**: Use `new Observability()` and `new SessionReplay()` 
- **Simple configuration**: Directly pass the plugins array to `initialize()`
- **No conditional checks needed**: The imports will fail early if packages aren't available

### Step 2: Verification

After implementing the above changes, you should see successful initialization in the browser console:

```
✅ LaunchDarkly client initialized successfully
🎥 Session replay should be recording
📊 Observability data being collected
```

## Working Implementation Notes

### Key Success Factors

1. **Default Imports**: The working implementation uses default imports, not named exports:
   ```javascript
   // ✅ Working
   import Observability from '@launchdarkly/observability'
   import SessionReplay from '@launchdarkly/session-replay'
   
   // ❌ Not working 
   import { Observability } from '@launchdarkly/observability'
   import { LDObserve } from '@launchdarkly/observability'
   ```

2. **Constructor Pattern**: Use `new` keyword with clean configuration:
   ```javascript
   // ✅ Working - Simple and clean
   plugins: [ new Observability({...}), new SessionReplay({...}) ]
   
   // ❌ Problematic - Function calls
   plugins: [ LDObserve({...}), LDRecord({...}) ]
   ```

3. **Version Consistency**: Ensure all versions match (currently 0.3.7):
   - `package.json` dependencies
   - Import map CDN URLs
   - Actual implementation

### Current Configuration Details

**Observability Settings:**
- `tracingOrigins: true` - Enables tracing for all origins
- `networkRecording.enabled: true` - Records all network requests
- `recordHeadersAndBody: true` - Captures full request/response data

**Session Replay Settings:**
- `privacySetting: 'none'` - Records everything (adjust for production)
- Full session capture enabled
- No sampling limitations (100% recording)

## Legacy Documentation (Kept for Reference)

The following sections document previous implementation attempts that didn't work:

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

## Verification and Troubleshooting

### Verify Import Maps Are Working
Open browser console and check for these messages when the page loads:

```
✅ - LDObserve: function  
✅ - LDRecord: function
🔌 - Total plugins configured: 2
```

### Common Issues and Solutions

#### Issue: Module Resolution Errors
```
Failed to resolve module specifier "@launchdarkly/observability"
```
**Solution**: Complete Step 0 - add import maps to `index.html`

#### Issue: Imports Commented Out
```
🔌 - Total plugins configured: 0
```
**Solution**: Uncomment the import statements in `launchDarklyConfig.js`

#### Issue: Plugins Not Loading
```
❌ - Observability (LDObserve): ❌ not available
```
**Solution**: Check that import maps URLs are accessible and imports are correct

#### Issue: CSP Violations
```
Content Security Policy: directive "connect-src" violated
```
**Solution**: Verify CSP headers in `index.html` include observability endpoints

### Debug Commands
```javascript
// Check if modules loaded correctly
console.log('LDObserve:', typeof LDObserve);
console.log('LDRecord:', typeof LDRecord);

// Check LaunchDarkly manager status
window.ldManager.getStatus();

// Test plugins directly
console.log('Plugins:', window.ldManager.client?.getConfiguration?.()?.plugins?.length);
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

## Summary

This implementation successfully integrates LaunchDarkly Observability and Session Replay using:

- **Version 0.3.7** of both observability packages
- **Default imports** with constructor pattern
- **Simple, direct configuration** in the LaunchDarkly client initialization
- **Full session recording** and network monitoring enabled

The key breakthrough was using the correct import syntax and constructor pattern rather than the named exports and function calls documented elsewhere.

For detailed API documentation, see the [official LaunchDarkly docs](https://launchdarkly.com/docs/sdk/observability/javascript). 