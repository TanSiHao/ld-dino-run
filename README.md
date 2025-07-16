# 🦕 LaunchDarkly Dino Run

A browser-based Dino Run game (similar to Chrome's offline game) with LaunchDarkly feature flags integration. Control game features dynamically without code deployments!

## Features

- **Classic Dino Run Gameplay**: Jump over obstacles, avoid collisions, and score points
- **LaunchDarkly Integration**: Three feature flags to control game behavior:
  - 🎨 **Dino Color**: Change the dinosaur's color (green, blue, red, purple, orange, pink)
  - 🎯 **Difficulty Levels**: Three difficulty settings (easy, medium, hard)
  - 🌤️ **Weather Backgrounds**: Four seasonal backgrounds (spring, summer, autumn, winter)
- **Responsive Design**: Works on desktop and mobile devices
- **Local Storage**: Saves high scores locally
- **Observability Ready**: [Easy setup for LaunchDarkly observability & session replay](#launchdarkly-observability--session-replay)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Application

```bash
npm start
```

This will start a local development server at `http://localhost:3000` and automatically open the game in your browser.

### 3. Play the Game

- Press **SPACE** to start the game and jump
- Avoid the brown obstacles
- Try to achieve the highest score possible!

## LaunchDarkly Setup

### Option 1: Automated Setup with Terraform (Recommended)

The fastest way to set up LaunchDarkly is using the included Terraform configuration:

1. **Install Terraform** (if not already installed):
   ```bash
   # macOS
   brew install terraform
   ```

2. **Set up LaunchDarkly credentials**:
   ```bash
   # Copy environment template
   cp environment.example .env
   
   # Edit .env and add your LaunchDarkly access token
   # Get it from: LaunchDarkly Dashboard → Account Settings → Authorization
   ```

3. **Configure and run Terraform**:
   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   
   # Edit terraform.tfvars and add your access token
   # Then run:
   terraform init
   terraform plan   # Review what will be created
   terraform apply  # Create the resources (type 'yes' when prompted)
   ```

4. **Get your Client-side ID**:
   - After Terraform completes, go to the LaunchDarkly dashboard URL shown in the output
   - Copy the Client-side ID from the Development environment
   - Add it to your `.env` file: `LAUNCHDARKLY_CLIENT_SIDE_ID=your-client-side-id`

5. **Update game configuration**:
   ```bash
   # Edit config.js and replace YOUR_CLIENT_SIDE_ID_HERE with your actual client-side ID
   ```

### Option 2: Manual Setup

If you prefer to set up LaunchDarkly manually:

1. **Create LaunchDarkly Account**: Sign up at [LaunchDarkly](https://launchdarkly.com)

2. **Create Environment Configuration**:
   ```bash
   cp environment.example .env
   # Edit .env and add your client-side ID
   ```

3. **Update Application Configuration**:
   - Edit `config.js`
   - Replace `YOUR_CLIENT_SIDE_ID_HERE` with your actual client-side ID from `.env`
   - Update project name if desired

4. **Create Feature Flags** in your LaunchDarkly dashboard:

   #### Flag 1: Dino Color (`dino-color`)
   - **Type**: String
   - **Default Value**: `green`
   - **Possible Values**: `green`, `blue`, `red`, `purple`, `orange`, `pink`

   #### Flag 2: Game Difficulty (`game-difficulty`)
   - **Type**: String  
   - **Default Value**: `medium`
   - **Possible Values**: 
     - `easy` - Slower obstacles, more time to react
     - `medium` - Balanced gameplay
     - `hard` - Faster obstacles, higher challenge

   #### Flag 3: Weather Background (`weather-background`)
   - **Type**: String
   - **Default Value**: `spring`
   - **Possible Values**: 
     - `spring` - Light blue sky
     - `summer` - Bright yellow/blue sky
     - `autumn` - Orange/brown tones
     - `winter` - Light blue/white tones

### Customizing Project Settings

To use a different project name or flag keys:

1. **For Terraform setup**: Edit `terraform/terraform.tfvars`
2. **For manual setup**: Edit `config.js` to match your LaunchDarkly configuration

## Project Structure

```
ld-dino-run/
├── index.html                    # Main HTML file
├── styles.css                    # Game styling
├── config.js                     # Configuration management
├── launchDarklyConfig.js         # LaunchDarkly setup and flag management
├── gameEngine.js                 # Core game mechanics
├── app.js                        # Main application logic
├── package.json                  # Dependencies and scripts
├── environment.example           # Example environment configuration
├── .gitignore                    # Git ignore rules
├── terraform/                    # Infrastructure as code
│   ├── main.tf                   # Terraform main configuration
│   ├── variables.tf              # Terraform variables
│   ├── outputs.tf                # Terraform outputs
│   ├── terraform.tfvars.example  # Example Terraform variables
│   └── README.md                 # Terraform documentation
└── README.md                     # This file
```

## How It Works

### Game Mechanics

- **Player**: The green dinosaur that jumps to avoid obstacles
- **Obstacles**: Brown rectangular blocks that move from right to left
- **Scoring**: Points increase automatically as the game progresses
- **Speed**: Game speed increases gradually based on score

### Feature Flag Integration

1. **Dino Color Flag**: Changes the visual appearance of the dinosaur in real-time
2. **Difficulty Flag**: Adjusts game parameters:
   - Obstacle speed
   - Obstacle generation frequency
   - Jump height
3. **Weather Flag**: Changes the background color and visual theme

### Real-time Updates

The game listens for LaunchDarkly flag changes and applies them immediately without requiring a page refresh. This demonstrates the power of feature flags for real-time configuration changes.

## LaunchDarkly Observability & Session Replay

Enhance your LaunchDarkly implementation with observability and session replay capabilities to gain deeper insights into user behavior and flag performance.

### Overview

LaunchDarkly observability provides:
- **Real-time Metrics**: Track flag evaluation performance and user interactions
- **Session Replay**: Record and replay user sessions to understand flag impact
- **Custom Events**: Track game-specific events for deeper analytics
- **Performance Monitoring**: Monitor flag evaluation latency and errors

### Implementation Guide

#### 1. Enable Session Replay

Add session replay initialization to your `launchDarklyConfig.js` file:

```javascript
// Add this to the LaunchDarklyManager constructor
constructor() {
    // ... existing code ...
    
    // Session Replay Configuration
    this.sessionReplayConfig = {
        enabled: true,
        sampleRate: 0.1, // Record 10% of sessions
        maskAllInputs: true, // Mask sensitive input data
        maskAllText: false, // Keep game text visible
    };
}

// Add this method to LaunchDarklyManager class
async initializeSessionReplay() {
    if (!this.sessionReplayConfig.enabled) return;
    
    try {
        // Initialize session replay
        window.LDSessionReplay = await import('https://unpkg.com/@launchdarkly/js-client-sdk-session-replay@1.0.0/dist/index.js');
        
        const sessionReplay = window.LDSessionReplay.createSessionReplay({
            client: this.client,
            sampleRate: this.sessionReplayConfig.sampleRate,
            maskAllInputs: this.sessionReplayConfig.maskAllInputs,
            maskAllText: this.sessionReplayConfig.maskAllText,
        });
        
        await sessionReplay.start();
        console.log('✅ LaunchDarkly Session Replay initialized');
        
    } catch (error) {
        console.warn('⚠️ Session Replay failed to initialize:', error);
    }
}
```

#### 2. Add Custom Event Tracking

Enhance your game with custom event tracking by adding this to `gameEngine.js`:

```javascript
// Add this method to the DinoGame class
trackGameEvent(eventName, data = {}) {
    if (window.ldManager && window.ldManager.client) {
        try {
            // Track custom events for observability
            window.ldManager.client.track(eventName, {
                ...data,
                timestamp: new Date().toISOString(),
                gameVersion: '1.0.0',
                userAgent: navigator.userAgent,
                screenResolution: `${window.screen.width}x${window.screen.height}`,
            });
            
            console.log(`📊 Tracked event: ${eventName}`, data);
        } catch (error) {
            console.warn('Failed to track event:', error);
        }
    }
}

// Add event tracking to key game actions
start() {
    // ... existing start code ...
    
    // Track game start
    this.trackGameEvent('game_started', {
        dinoColor: window.ldManager?.getDinoColor(),
        difficulty: window.ldManager?.getDifficulty(),
        weather: window.ldManager?.getWeather(),
    });
}

gameOver() {
    // ... existing game over code ...
    
    // Track game completion
    this.trackGameEvent('game_completed', {
        finalScore: this.score,
        survivalTime: Date.now() - this.gameStartTime,
        obstaclesCleared: this.obstaclesCleared,
        dinoColor: window.ldManager?.getDinoColor(),
        difficulty: window.ldManager?.getDifficulty(),
    });
}

// Track flag value changes
onFlagChange(flagName, oldValue, newValue) {
    this.trackGameEvent('flag_changed', {
        flagName,
        oldValue,
        newValue,
        gameState: this.isRunning ? 'playing' : 'stopped',
    });
}
```

#### 3. Update HTML Script Loading

Add the session replay script to your `index.html` file (after the LaunchDarkly SDK):

```html
<!-- LaunchDarkly SDK -->
<script src="https://unpkg.com/launchdarkly-js-client-sdk@3.4.0/dist/ldclient.min.js"></script>

<!-- LaunchDarkly Session Replay (Optional) -->
<script>
    // Load session replay dynamically when needed
    window.loadSessionReplay = async function() {
        try {
            if (!window.LDSessionReplay) {
                const module = await import('https://unpkg.com/@launchdarkly/js-client-sdk-session-replay@1.0.0/dist/index.js');
                window.LDSessionReplay = module;
            }
            return window.LDSessionReplay;
        } catch (error) {
            console.warn('Session Replay not available:', error);
            return null;
        }
    };
</script>
```

#### 4. Initialize Observability Features

Update your `app.js` initialization to include observability:

```javascript
async init() {
    try {
        // ... existing initialization code ...
        
        // Initialize LaunchDarkly
        console.log('🏗️ Initializing LaunchDarkly...');
        await window.ldManager.initialize();
        
        // Initialize observability features
        console.log('📊 Setting up observability...');
        await this.setupObservability();
        
        // ... rest of initialization ...
    } catch (error) {
        console.error('❌ Failed to initialize app:', error);
    }
}

async setupObservability() {
    try {
        // Initialize session replay if available
        if (window.ldManager && typeof window.ldManager.initializeSessionReplay === 'function') {
            await window.ldManager.initializeSessionReplay();
        }
        
        // Set up performance monitoring
        this.setupPerformanceMonitoring();
        
        // Track app initialization
        if (this.game && typeof this.game.trackGameEvent === 'function') {
            this.game.trackGameEvent('app_initialized', {
                loadTime: performance.now(),
                features: ['feature-flags', 'session-replay', 'custom-events'],
            });
        }
        
        console.log('✅ Observability features initialized');
        
    } catch (error) {
        console.warn('⚠️ Some observability features failed to initialize:', error);
    }
}

setupPerformanceMonitoring() {
    // Monitor flag evaluation performance
    if (window.ldManager && window.ldManager.client) {
        const originalVariation = window.ldManager.client.variation;
        
        window.ldManager.client.variation = function(flagKey, defaultValue) {
            const startTime = performance.now();
            const result = originalVariation.call(this, flagKey, defaultValue);
            const endTime = performance.now();
            
            console.log(`⏱️ Flag ${flagKey} evaluated in ${(endTime - startTime).toFixed(2)}ms`);
            return result;
        };
    }
}
```

#### 5. Environment Configuration

Update your `.env` file to include observability settings:

```bash
# LaunchDarkly Observability Configuration
LAUNCHDARKLY_SESSION_REPLAY_ENABLED=true
LAUNCHDARKLY_SESSION_REPLAY_SAMPLE_RATE=0.1
LAUNCHDARKLY_CUSTOM_EVENTS_ENABLED=true
```

And update `config.js` to use these settings:

```javascript
window.DinoRunConfig = {
    // ... existing config ...
    
    // Observability Configuration
    observability: {
        sessionReplay: {
            enabled: process.env.LAUNCHDARKLY_SESSION_REPLAY_ENABLED === 'true' || true,
            sampleRate: parseFloat(process.env.LAUNCHDARKLY_SESSION_REPLAY_SAMPLE_RATE) || 0.1,
        },
        customEvents: {
            enabled: process.env.LAUNCHDARKLY_CUSTOM_EVENTS_ENABLED === 'true' || true,
        }
    }
};
```

### Viewing Observability Data

Once implemented, you can view your observability data in:

1. **LaunchDarkly Dashboard**:
   - Go to your project dashboard
   - Navigate to "Insights" → "Events" to see custom events
   - Check "Debugger" for real-time flag evaluations

2. **Session Replay**:
   - Access "Session Replay" in your LaunchDarkly dashboard
   - Filter sessions by user attributes or custom events
   - Watch recorded sessions to understand user behavior

3. **Custom Metrics**:
   - View game-specific metrics like completion rates
   - Analyze flag impact on user engagement
   - Monitor performance across different flag variations

### Best Practices

- **Privacy**: Always mask sensitive user input in session recordings
- **Sampling**: Use appropriate sample rates to balance insights with performance
- **Event Volume**: Track meaningful events without overwhelming your analytics
- **Performance**: Monitor the impact of observability features on game performance
- **Data Retention**: Understand LaunchDarkly's data retention policies for your plan

### Troubleshooting Observability

- **Session Replay Not Working**: Check browser compatibility and network connectivity
- **Events Not Appearing**: Verify custom event tracking code and LaunchDarkly connection
- **Performance Issues**: Reduce sample rates or disable features if needed
- **Console Warnings**: Check browser console for specific error messages

## Development

### Testing Feature Flags

If you haven't set up LaunchDarkly yet, the game will run with default values:
- Dino Color: Green
- Difficulty: Medium  
- Weather: Spring

### Environment Variables

The application uses environment variables for configuration:

```bash
# Copy the example file
cp environment.example .env

# Edit .env with your values:
LAUNCHDARKLY_CLIENT_SIDE_ID=your-client-side-id-here
LAUNCHDARKLY_PROJECT_NAME=your-project-name
LAUNCHDARKLY_ACCESS_TOKEN=your-access-token-here  # For Terraform only
```

**Important**: Never commit `.env` files to version control. They contain sensitive credentials.

### Browser Console Commands

Open the browser console and try these commands for testing:

```javascript
// Check current flag values
window.ldManager.getDinoColor()
window.ldManager.getDifficulty()
window.ldManager.getWeather()

// Access game instance
window.dinoApp.game

// Validate configuration
window.DinoRunConfig.validate()

// Get setup instructions
console.log(window.DinoRunConfig.getSetupInstructions())
```

### Keyboard Shortcuts (Development)

- **Alt + 1**: Log dino color cycling (for testing)
- **Alt + 2**: Log difficulty cycling (for testing)  
- **Alt + 3**: Log weather cycling (for testing)

## Customization

### Adding New Colors

1. Add new color to `getDinoColorHex()` method in `launchDarklyConfig.js`
2. Update the LaunchDarkly flag to include the new color option

### Adding New Difficulty Levels

1. Update `getDifficultySettings()` method in `launchDarklyConfig.js`
2. Add the new difficulty to your LaunchDarkly flag

### Adding New Weather Effects

1. Update `getWeatherBackground()` method in `launchDarklyConfig.js`
2. Add corresponding CSS classes in `styles.css`
3. Update the LaunchDarkly flag with new weather options

## Security

### Environment Variables
- **Never commit `.env` files** to version control
- Store sensitive data (access tokens, client IDs) in `.env` only
- The `.gitignore` file excludes `.env` files automatically
- Use `environment.example` as a template for others

### Production Deployment
- Use environment-specific configurations
- Consider using CI/CD environment variables instead of `.env` files
- Rotate access tokens regularly
- Use LaunchDarkly's environment-specific client-side IDs

## Troubleshooting

### Game Not Loading
- Check browser console for JavaScript errors
- Ensure all files are in the correct locations
- Verify the local server is running on port 3000
- Check if `config.js` is loaded before other game scripts

### Feature Flags Not Working
- Run `window.DinoRunConfig.validate()` in browser console to check configuration
- Verify your LaunchDarkly client-side ID is correct in `config.js`
- Check that flag keys match between `config.js` and LaunchDarkly dashboard
- Ensure flags are turned ON in LaunchDarkly
- Check browser console for LaunchDarkly connection errors
- Verify you're using the client-side ID (not server-side SDK key)

### Terraform Issues
- Ensure you have the correct LaunchDarkly access token
- Check that your access token has sufficient permissions (writer role)
- If project already exists, consider importing it or using a different project key
- See `terraform/README.md` for detailed Terraform troubleshooting

### Environment Variables
- Ensure `.env` file exists and has correct format
- Check that `config.js` is updated with values from `.env`
- Verify no typos in environment variable names

### Performance Issues
- The game uses `requestAnimationFrame` for smooth animation
- If experiencing lag, check if other browser tabs are consuming resources

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License - feel free to modify and distribute as needed.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with LaunchDarkly
5. Submit a pull request

---

**Have fun playing and experimenting with feature flags! 🦕🚀** 