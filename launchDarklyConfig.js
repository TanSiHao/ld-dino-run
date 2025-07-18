// LaunchDarkly Configuration
// Simple and reliable implementation using CDN

class LaunchDarklyManager {
    constructor() {
        // Load configuration from config.js (available via main.js)
        const config = window.DinoRunConfig || {};
        
        this.clientSideId = config.launchDarkly?.clientSideId || 'YOUR_CLIENT_SIDE_ID_HERE';
        this.projectName = config.launchDarkly?.projectName || 'sihaotan-dino-run';
        this.client = null;
        this.isInitialized = false;
        
        // Default feature flag values (fallbacks)
        this.featureFlags = {
            dinoColor: config.defaults?.dinoColor || 'green',
            difficulty: config.defaults?.difficulty || 'medium',
            weather: config.defaults?.weather || 'spring',
            obstacleType: config.defaults?.obstacleType || 'logos'
        };
        
        // Feature flag keys from configuration
        this.flagKeys = {
            dinoColor: config.launchDarkly?.flags?.dinoColor || 'dino-color',
            difficulty: config.launchDarkly?.flags?.difficulty || 'game-difficulty', 
            weather: config.launchDarkly?.flags?.weather || 'weather-background',
            obstacleType: config.launchDarkly?.flags?.obstacleType || 'obstacle-type'
        };
        
        this.callbacks = [];
        
        // Demo mode for testing
        this.demoMode = false;
        this.demoInterval = null; // To store the interval for demo mode
    }
    
    // Enable demo mode with cycling flags
    enableDemoMode() {
        console.log('🎮 Demo Mode Enabled - Flags will cycle automatically!');
        console.log('💡 To disable auto-cycling, run: window.ldManager.enableStaticMode()');
        this.demoMode = true;
        this.isInitialized = true;
        
        // Cycle through different flag values every 3 seconds
        const colors = ['green', 'blue', 'red', 'purple', 'orange', 'pink'];
        const difficulties = ['easy', 'medium', 'hard'];
        const weathers = ['spring', 'summer', 'autumn', 'winter'];
        const obstacleTypes = ['logos', 'classic'];
        
        let colorIndex = 0;
        let difficultyIndex = 0;
        let weatherIndex = 0;
        let obstacleTypeIndex = 0;
        
        this.demoInterval = setInterval(() => {
            // Cycle dino color
            this.featureFlags.dinoColor = colors[colorIndex];
            colorIndex = (colorIndex + 1) % colors.length;
            
            // Cycle difficulty every 4 color changes
            if (colorIndex === 0) {
                this.featureFlags.difficulty = difficulties[difficultyIndex];
                difficultyIndex = (difficultyIndex + 1) % difficulties.length;
            }
            
            // Cycle weather every 2 difficulty changes
            if (colorIndex === 0 && difficultyIndex === 0) {
                this.featureFlags.weather = weathers[weatherIndex];
                weatherIndex = (weatherIndex + 1) % weathers.length;
            }
            
            // Cycle obstacle type every 3 color changes
            if (colorIndex % 3 === 0) {
                this.featureFlags.obstacleType = obstacleTypes[obstacleTypeIndex];
                obstacleTypeIndex = (obstacleTypeIndex + 1) % obstacleTypes.length;
            }
            
            console.log('🎯 Demo flags updated:', {
                color: this.featureFlags.dinoColor,
                difficulty: this.featureFlags.difficulty,
                weather: this.featureFlags.weather,
                obstacles: this.featureFlags.obstacleType
            });
            
            this.updateFlagDisplay();
            this.notifyCallbacks();
        }, 3000);
        
        this.notifyCallbacks();
        return true;
    }
    
    // Enable static mode (no auto-cycling)
    enableStaticMode() {
        console.log('🔒 Static Mode Enabled - Using default values');
        
        // Clear any existing demo interval
        if (this.demoInterval) {
            clearInterval(this.demoInterval);
            this.demoInterval = null;
        }
        
        this.demoMode = false;
        this.isInitialized = true;
        
        // Reset to default values
        this.featureFlags = {
            dinoColor: 'green',
            difficulty: 'medium', 
            weather: 'spring',
            obstacleType: 'logos'
        };
        
        console.log('✅ Static flags set:', this.featureFlags);
        this.updateFlagDisplay();
        this.notifyCallbacks();
        return true;
    }
    
    // Manual flag setters for testing
    setDinoColor(color) {
        if (['green', 'blue', 'red', 'purple', 'orange', 'pink'].includes(color)) {
            this.featureFlags.dinoColor = color;
            this.updateFlagDisplay();
            this.notifyCallbacks();
            console.log('🎨 Dino color set to:', color);
        }
    }
    
    setDifficulty(difficulty) {
        if (['easy', 'medium', 'hard'].includes(difficulty)) {
            this.featureFlags.difficulty = difficulty;
            this.updateFlagDisplay();
            this.notifyCallbacks();
            console.log('⚡ Difficulty set to:', difficulty);
        }
    }
    
    setWeather(weather) {
        if (['spring', 'summer', 'autumn', 'winter'].includes(weather)) {
            this.featureFlags.weather = weather;
            this.updateFlagDisplay();
            this.notifyCallbacks();
            console.log('🌤️ Weather set to:', weather);
        }
    }
    
    setObstacleType(obstacleType) {
        if (['logos', 'classic'].includes(obstacleType)) {
            this.featureFlags.obstacleType = obstacleType;
            this.updateFlagDisplay();
            this.notifyCallbacks();
            console.log('🚧 Obstacle type set to:', obstacleType);
        }
    }
    
    async initialize(playerName = null) {
        console.log('🚀 Initializing LaunchDarkly...');
        
        try {
            // Generate user context
            let userContext;
            if (window.userDetection) {
                console.log('🔍 Detecting user environment...');
                userContext = await window.userDetection.generateUserContext(playerName);
                
                // Save player data for future sessions
                if (playerName) {
                    window.userDetection.savePlayerData(userContext);
                }
                
                console.log('👤 User Context Created');
            } else {
                // Fallback user context
                userContext = {
                    key: 'user-' + Math.random().toString(36).substr(2, 9),
                    name: playerName || 'Game Player',
                    email: playerName ? `${playerName.toLowerCase().replace(/\s+/g, '.')}@dino-run.game` : 'player@example.com',
                    custom: {
                        project: this.projectName,
                        gameVersion: '1.0.0'
                    }
                };
            }
            
            console.log(`🚀 Initializing LaunchDarkly for project: ${this.projectName}`);
            console.log('🔑 Client ID:', this.clientSideId);
            console.log(`👋 Welcome, ${userContext.name}!`);
            
            // Store the current user context
            this.currentUser = userContext;
            
            // Check if LaunchDarkly SDK is available
            if (!window.LDClient || !window.LDClient.initialize) {
                throw new Error('LaunchDarkly SDK not loaded');
            }
            
            console.log('✅ LaunchDarkly SDK found, initializing...');
            
            // Initialize LaunchDarkly client with localhost-friendly configuration
            this.client = window.LDClient.initialize(this.clientSideId, userContext, {
                sendEvents: false, // Disable events to avoid CORS issues on localhost
                useReport: false,  // Use GET requests instead of POST to avoid preflight
                bootstrap: 'localStorage',
                streaming: true,   // Enable streaming for real-time flag updates
                streamReconnectDelay: 1000, // Reconnect quickly if stream drops
                allAttributesPrivate: false,
                privateAttributeNames: [],
                // Use correct streaming URL for real-time updates
                baseUrl: 'https://clientsdk.launchdarkly.com',
                streamUrl: 'https://stream.launchdarkly.com',
                eventsUrl: 'https://events.launchdarkly.com'
            });
            
            console.log('⏳ Waiting for LaunchDarkly initialization...');
            
            // Wait for initialization with better error handling
            try {
                const initTimeout = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('LaunchDarkly initialization timeout (10s)')), 10000)
                );
                
                await Promise.race([
                    this.client.waitForInitialization(),
                    initTimeout
                ]);
                
                // Verify client actually initialized
                if (!this.client.isInitialized) {
                    throw new Error('LaunchDarkly client failed to initialize properly');
                }
                
                // Test if we can get flags
                const allFlags = this.client.allFlags();
                console.log('🎯 All flags from LaunchDarkly:', allFlags);
                
                if (Object.keys(allFlags).length === 0) {
                    console.warn('⚠️ No flags found in LaunchDarkly project');
                    console.log('🔧 This usually means:');
                    console.log('  1. Flags don\'t exist in your LaunchDarkly project');
                    console.log('  2. Wrong environment or project');
                    console.log('  3. Client-side access not enabled for flags');
                }
                
                this.isInitialized = true;
                
                // Get initial flag values
                await this.updateAllFlags();
                
                // Listen for flag changes with enhanced real-time updates
                this.client.on('change', (changes) => {
                    console.log('🔄 Flag change detected from LaunchDarkly!', changes);
                    console.log('🎮 Applying changes in real-time during gameplay...');
                    
                    // Update our local flag values first
                    this.updateAllFlags();
                    
                    // Force immediate application during gameplay
                    this.applyRealTimeUpdates(changes);
                });
                
                console.log('✅ LaunchDarkly initialized successfully');
                console.log(`📋 Project: ${this.projectName}`);
                console.log('🎯 Feature flags:', Object.keys(this.flagKeys));
                console.log('📊 Available flags from LD:', Object.keys(allFlags));
                this.notifyCallbacks();
                
            } catch (initError) {
                console.error('❌ LaunchDarkly initialization failed:', initError);
                console.log('🔧 Detailed diagnostics:');
                console.log('  - Client exists:', !!this.client);
                console.log('  - Client initialized:', this.client ? this.client.isInitialized : 'N/A');
                console.log('  - All flags:', this.client ? this.client.allFlags() : 'N/A');
                
                // Try to get more info about the failure
                if (this.client) {
                    console.log('🧪 Testing individual flag access:');
                    try {
                        const testColor = this.client.variation(this.flagKeys.dinoColor, 'fallback-green');
                        const testDifficulty = this.client.variation(this.flagKeys.difficulty, 'fallback-medium');
                        const testWeather = this.client.variation(this.flagKeys.weather, 'fallback-spring');
                        
                        console.log('  - Color flag result:', testColor);
                        console.log('  - Difficulty flag result:', testDifficulty);
                        console.log('  - Weather flag result:', testWeather);
                        
                        // If we got fallback values, the client is partially working
                        if (testColor.startsWith('fallback-')) {
                            console.log('⚠️ Getting fallback values - flags likely don\'t exist in LaunchDarkly');
                        }
                    } catch (flagTestError) {
                        console.error('❌ Even flag testing failed:', flagTestError);
                    }
                }
                
                throw initError;
            }
            
        } catch (error) {
            console.error('❌ LaunchDarkly initialization failed:', error);
            console.log('🔧 Troubleshooting tips:');
            console.log('  1. Check your client-side ID in config.js:', this.clientSideId);
            console.log('  2. Verify the flags exist in your LaunchDarkly project:');
            console.log('     - dino-color');
            console.log('     - game-difficulty'); 
            console.log('     - weather-background');
            console.log('  3. Ensure flags have "SDKs using Client-side ID" enabled');
            console.log('  4. Check browser console for CORS or network errors');
            console.log('  5. Verify you\'re using the correct environment');
            console.log('🎮 Using default values - game will still work!');
            
            // Set fallback values and mark as initialized so game works
            this.featureFlags = {
                dinoColor: 'green',
                difficulty: 'medium',
                weather: 'spring'
            };
            this.isInitialized = true;
            this.updateFlagDisplay();
            this.notifyCallbacks();
        }
    }
    
    // Re-initialize with new user context (when name is provided)
    async reinitializeWithUser(playerName) {
        console.log('🔄 Reinitializing LaunchDarkly with user:', playerName);
        
        if (this.client) {
            try {
                console.log('📴 Closing existing LaunchDarkly client...');
                await this.client.close();
                console.log('✅ Previous client closed');
            } catch (e) {
                console.log('⚠️ Error closing previous client:', e);
            }
        }
        
        // Clear current state
        this.isInitialized = false;
        this.client = null;
        this.currentUser = null;
        
        console.log('🚀 Starting fresh initialization with player name...');
        await this.initialize(playerName);
        
        // Verify the user was set correctly
        if (this.currentUser) {
            console.log('✅ LaunchDarkly reinitialized successfully');
            console.log('👤 Current user context:', {
                key: this.currentUser.key,
                name: this.currentUser.name,
                email: this.currentUser.email
            });
            
            // Trigger flag update to ensure all UI elements are updated
            this.updateAllFlags();
        } else {
            console.error('❌ Failed to set user context after reinitialization');
        }
    }
    
    // Get current user information
    getCurrentUser() {
        return this.currentUser;
    }
    
    // Update user context (for dynamic changes)
    async updateUserContext(updates) {
        if (!this.client) return;
        
        try {
            const updatedContext = {
                ...this.currentUser,
                ...updates,
                custom: {
                    ...this.currentUser.custom,
                    ...updates.custom
                }
            };
            
            await this.client.identify(updatedContext);
            this.currentUser = updatedContext;
            
            console.log('👤 User context updated:', updates);
        } catch (error) {
            console.error('Error updating user context:', error);
        }
    }
    
    async updateAllFlags() {
        if (!this.client) return;
        
        try {
            // Get dino color flag
            const dinoColor = this.client.variation(this.flagKeys.dinoColor, 'green');
            this.featureFlags.dinoColor = dinoColor;
            
            // Get difficulty flag
            const difficulty = this.client.variation(this.flagKeys.difficulty, 'medium');
            this.featureFlags.difficulty = difficulty;
            
                    // Get weather flag
        const weather = this.client.variation(this.flagKeys.weather, 'spring');
        this.featureFlags.weather = weather;
        
        // Get obstacle type flag
        const obstacleType = this.client.variation(this.flagKeys.obstacleType, 'logos');
        this.featureFlags.obstacleType = obstacleType;
            
            // Update UI
            this.updateFlagDisplay();
            this.notifyCallbacks();
            
        } catch (error) {
            console.error('Error updating flags:', error);
        }
    }
    
    updateFlagDisplay() {
        // Update dino color display
        const dinoColorElement = document.getElementById('dino-color-value');
        if (dinoColorElement) {
            dinoColorElement.textContent = this.featureFlags.dinoColor;
            dinoColorElement.style.color = this.getDinoColorHex(this.featureFlags.dinoColor);
        }
        
        // Update difficulty display
        const difficultyElement = document.getElementById('difficulty-value');
        if (difficultyElement) {
            difficultyElement.textContent = this.featureFlags.difficulty;
        }
        
        // Update weather display
        const weatherElement = document.getElementById('weather-value');
        if (weatherElement) {
            weatherElement.textContent = this.featureFlags.weather;
        }
        
        // Update obstacle type display (if element exists)
        const obstacleTypeElement = document.getElementById('obstacle-type-value');
        if (obstacleTypeElement) {
            obstacleTypeElement.textContent = this.featureFlags.obstacleType;
        }
    }
    
    // Apply real-time updates during active gameplay
    applyRealTimeUpdates(changes) {
        console.log('🎯 Real-time update triggered with changes:', changes);
        
        // Check if game is currently running
        const isGameRunning = window.dinoApp?.game?.isRunning;
        console.log('🎮 Game running status:', isGameRunning);
        
        if (isGameRunning) {
            console.log('⚡ Applying changes to active game...');
            
            // Force immediate application of all settings during gameplay
            if (window.dinoApp?.game?.applySettings) {
                window.dinoApp.game.applySettings();
                console.log('✅ Game settings applied during gameplay');
            }
            
            // Force player color update immediately
            if (window.dinoApp?.game?.updatePlayerColor) {
                window.dinoApp.game.updatePlayerColor();
                console.log('🎨 Player color updated during gameplay');
            }
            
            // Update weather effects immediately
            if (window.dinoApp?.game?.applyWeatherBackground) {
                window.dinoApp.game.applyWeatherBackground();
                console.log('🌤️ Weather updated during gameplay');
            }
        }
        
        // Always update the UI display
        this.updateFlagDisplay();
        
        // Notify all registered callbacks
        this.notifyCallbacks();
        
        console.log('🔄 Real-time update complete!');
    }
    
    getDinoColorHex(colorName) {
        const colors = {
            'green': '#2d7d32',
            'blue': '#1976d2',
            'red': '#d32f2f',
            'purple': '#7b1fa2',
            'orange': '#f57c00',
            'pink': '#c2185b'
        };
        return colors[colorName] || '#2d7d32';
    }
    
    getDinoColor() {
        return this.featureFlags.dinoColor;
    }
    
    getDifficulty() {
        return this.featureFlags.difficulty;
    }
    
    getWeather() {
        return this.featureFlags.weather;
    }
    
    getObstacleType() {
        return this.featureFlags.obstacleType;
    }
    
    getDifficultySettings() {
        const settings = {
            'easy': {
                obstacleSpeed: 3,
                obstacleFrequency: 120,
                jumpHeight: 100
            },
            'medium': {
                obstacleSpeed: 5,
                obstacleFrequency: 100,
                jumpHeight: 90
            },
            'hard': {
                obstacleSpeed: 7,
                obstacleFrequency: 80,
                jumpHeight: 80
            }
        };
        return settings[this.featureFlags.difficulty] || settings['medium'];
    }
    
    getWeatherBackground() {
        const backgrounds = {
            'spring': '#87ceeb',
            'summer': '#ffeb3b',
            'autumn': '#ff9800',
            'winter': '#e3f2fd'
        };
        return backgrounds[this.featureFlags.weather] || backgrounds['spring'];
    }
    
    onFlagsUpdated(callback) {
        this.callbacks.push(callback);
    }
    
    notifyCallbacks() {
        this.callbacks.forEach(callback => callback());
    }

    // Simple test function to validate LaunchDarkly setup
    async testConnection() {
        console.log('🧪 Testing LaunchDarkly Connection...');
        console.log('📋 Configuration:');
        console.log('  Client ID:', this.clientSideId);
        console.log('  Project:', this.projectName);
        console.log('  Environment: client-side');
        
        // Test if client ID format is valid (should be 32 characters)
        if (this.clientSideId.length !== 32) {
            console.error('❌ Invalid client ID format. Should be 32 characters.');
            console.log('💡 Get your client-side ID from LaunchDarkly dashboard:');
            console.log('   1. Go to Account Settings → Projects');
            console.log('   2. Select your project');
            console.log('   3. Go to Environments');
            console.log('   4. Copy the Client-side ID (not SDK key)');
            return false;
        }
        
        // Test if we can create a basic client
        try {
            const testUser = {
                key: 'test-connection-user',
                name: 'Test User'
            };
            
            console.log('🔗 Attempting to connect...');
            const testClient = window.LDClient.initialize(this.clientSideId, testUser);
            
            // Wait with shorter timeout for connection test
            const timeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Connection timeout')), 5000)
            );
            
            await Promise.race([
                testClient.waitForInitialization(),
                timeout
            ]);
            
            console.log('✅ Connection successful!');
            
            // Test flag retrieval
            console.log('🏁 Testing flags:');
            Object.entries(this.flagKeys).forEach(([feature, flagKey]) => {
                try {
                    const value = testClient.variation(flagKey, this.featureFlags[feature]);
                    console.log(`  ✅ ${feature} (${flagKey}): ${value}`);
                } catch (error) {
                    console.log(`  ❌ ${feature} (${flagKey}): ${error.message}`);
                }
            });
            
            await testClient.close();
            return true;
            
        } catch (error) {
            console.error('❌ Connection failed:', error.message);
            console.log('🔧 Common issues:');
            console.log('  1. Wrong client-side ID');
            console.log('  2. Flags don\'t exist in LaunchDarkly');
            console.log('  3. Network/firewall blocking LaunchDarkly');
            console.log('  4. Project environment not set up correctly');
            return false;
        }
    }

    // ========================================
    // ENHANCED OBSERVABILITY METHODS
    // ========================================
    // 
    // These methods provide enhanced event tracking and observability
    // compatible with the current SDK (v3.4.0+). No upgrade required!
    //
    // Usage Examples:
    // - window.ldManager.trackGameEvent('game_started', {difficulty: 'hard'})
    // - window.ldManager.trackPerformanceMetric('load_time', 1200, 'ms')
    // - window.ldManager.trackFlagEvaluation('dino-color', 'blue', 'fallthrough')
    //
    // For full observability with session replay, see README.md

    /**
     * Enhanced game event tracking with detailed metadata
     * Tracks custom events with comprehensive context information
     * 
     * @param {string} eventName - Name of the event (e.g., 'game_started', 'obstacle_hit')
     * @param {object} eventData - Additional data to include with the event
     */
    trackGameEvent(eventName, eventData = {}) {
        if (this.client && this.isInitialized) {
            const enhancedData = {
                ...eventData,
                
                // Game session information
                gameSessionId: this.generateGameSessionId(),
                sessionStartTime: this.sessionStartTime || Date.now(),
                
                // Current flag states for correlation analysis
                flagStates: {
                    dinoColor: this.featureFlags.dinoColor,
                    difficulty: this.featureFlags.difficulty,
                    weather: this.featureFlags.weather
                },
                
                // Browser and user context
                userAgent: navigator.userAgent,
                screenResolution: `${screen.width}x${screen.height}`,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                timestamp: Date.now(),
                
                // Game-specific metadata
                gameMode: 'dino-run',
                version: '1.0.0',
                sdkVersion: 'v3.8.1'
            };
            
            // Track the event with LaunchDarkly
            this.client.track(eventName, enhancedData);
            console.log(`📊 Enhanced tracking: ${eventName}`, enhancedData);
            
            return enhancedData; // Return for further processing if needed
        } else {
            console.warn('⚠️ Cannot track event: LaunchDarkly client not initialized');
            return null;
        }
    }
    
    /**
     * Track performance metrics for observability
     * Useful for monitoring game performance and optimization
     * 
     * @param {string} metricName - Name of the metric (e.g., 'frame_rate', 'load_time')
     * @param {number} value - Numeric value of the metric
     * @param {string} unit - Unit of measurement (e.g., 'ms', 'fps', 'mb')
     */
    trackPerformanceMetric(metricName, value, unit = 'ms') {
        this.trackGameEvent('performance_metric', {
            metricName: metricName,
            value: value,
            unit: unit,
            performanceNow: performance.now(),
            memoryUsage: performance.memory ? {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize
            } : null
        });
    }
    
    /**
     * Track flag evaluation events for debugging and analysis
     * Helps understand flag evaluation patterns and troubleshoot issues
     * 
     * @param {string} flagKey - The feature flag key
     * @param {*} value - The evaluated flag value
     * @param {string} reason - Reason for the evaluation result
     */
    trackFlagEvaluation(flagKey, value, reason = 'unknown') {
        this.trackGameEvent('flag_evaluation', {
            flagKey: flagKey,
            flagValue: value,
            evaluationReason: reason,
            clientInitialized: this.isInitialized,
            flagKeys: this.flagKeys // Include all configured flag keys for context
        });
    }
    
    // ========================================
    // OFFICIAL SESSION REPLAY CONTROLS
    // ========================================
    // 
    // These methods provide manual control over session replay recording
    // according to the official LaunchDarkly documentation
    
    /**
     * Start a new session replay recording manually
     * Call this when you want to begin recording a user session
     * 
     * @param {object} options - Optional configuration for session start
     */
    startSessionReplay(options = {}) {
        if (window.SessionReplay && typeof window.SessionReplay.start === 'function') {
            try {
                window.SessionReplay.start({
                    forceNew: true, // Start a new recording session
                    silent: false,  // Show console warnings
                    ...options
                });
                console.log('🎥 Session replay started manually');
                
                // Track custom event for session start
                this.trackGameEvent('session_replay_started', {
                    timestamp: Date.now(),
                    manual_start: true,
                    options: options
                });
                
                return true;
            } catch (error) {
                console.error('❌ Failed to start session replay:', error);
                return false;
            }
        } else {
            console.warn('⚠️ Session replay not available. Ensure @launchdarkly/session-replay is properly imported and initialized');
            return false;
        }
    }
    
    /**
     * Stop the current session replay recording
     * Call this when you want to end the recording
     */
    stopSessionReplay() {
        if (window.SessionReplay && typeof window.SessionReplay.stop === 'function') {
            try {
                window.SessionReplay.stop();
                console.log('🛑 Session replay stopped manually');
                
                // Track custom event for session stop
                this.trackGameEvent('session_replay_stopped', {
                    timestamp: Date.now(),
                    manual_stop: true
                });
                
                return true;
            } catch (error) {
                console.error('❌ Failed to stop session replay:', error);
                return false;
            }
        } else {
            console.warn('⚠️ Session replay not available');
            return false;
        }
    }
    
    /**
     * Check if session replay is currently recording
     * 
     * @returns {boolean} True if recording, false otherwise
     */
    isSessionReplayActive() {
        if (window.SessionReplay && typeof window.SessionReplay.isRecording === 'function') {
            return window.SessionReplay.isRecording();
        }
        return false;
    }
    
    /**
     * Get session replay status and configuration
     * 
     * @returns {object} Status information about session replay
     */
    getSessionReplayStatus() {
        const status = {
            available: !!(window.SessionReplay),
            recording: this.isSessionReplayActive(),
            timestamp: Date.now()
        };
        
        console.log('📊 Session replay status:', status);
        return status;
    }
    
    /**
     * Generate a unique session ID for tracking game sessions
     * Persists for the duration of the page session
     * 
     * @returns {string} Unique session identifier
     */
    generateGameSessionId() {
        if (!this.gameSessionId) {
            this.gameSessionId = `dino_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.sessionStartTime = Date.now();
            
            // Track session start
            this.trackGameEvent('session_started', {
                sessionId: this.gameSessionId,
                referrer: document.referrer,
                currentUrl: window.location.href,
                userAgent: navigator.userAgent.substring(0, 100)
            });
        }
        return this.gameSessionId;
    }
    
    /**
     * Start enhanced observability session with official plugins
     * Sets up tracking for this session and logs initial context
     */
    startObservabilitySession() {
        const sessionId = this.generateGameSessionId();
        
        console.log('🔍 Enhanced observability session started with official plugins');
        console.log('📋 Session ID:', sessionId);
        console.log('🎯 Flag states:', this.featureFlags);
        console.log('🎥 Session replay status:', this.getSessionReplayStatus());
        console.log('💡 Tip: View events in LaunchDarkly Dashboard > Insights > Events');
        
        // Track initial page load
        this.trackPerformanceMetric('page_load_time', performance.now(), 'ms');
        
        // Track initial observability setup
        this.trackGameEvent('observability_session_started', {
            sessionId: sessionId,
            hasSessionReplay: this.isSessionReplayActive(),
            pluginsLoaded: {
                observe: !!(window.LDObserve),
                record: !!(window.LDRecord),
                sessionReplay: !!(window.SessionReplay),
                observability: !!(window.Observability)
            }
        });
        
        return sessionId;
    }

    // Force real LaunchDarkly connection (bypass demo mode)
    async forceRealLaunchDarkly(playerName = null) {
        console.log('🚀 FORCING REAL LAUNCHDARKLY CONNECTION - No demo mode fallback');
        
        // Clear any demo mode
        if (this.demoInterval) {
            clearInterval(this.demoInterval);
            this.demoInterval = null;
        }
        this.demoMode = false;
        
        try {
            // Generate user context
            let userContext;
            if (window.userDetection) {
                userContext = await window.userDetection.generateUserContext(playerName);
                if (playerName) {
                    window.userDetection.savePlayerData(userContext);
                }
            } else {
                userContext = {
                    key: 'user-' + Math.random().toString(36).substr(2, 9),
                    name: playerName || 'Game Player',
                    email: playerName ? `${playerName.toLowerCase().replace(/\s+/g, '.')}@dino-run.game` : 'player@example.com',
                    custom: {
                        project: this.projectName,
                        gameVersion: '1.0.0'
                    }
                };
            }
            
            console.log('👤 User Context for LaunchDarkly:', userContext);
            console.log('🔑 Client-side ID:', this.clientSideId);
            console.log('🎯 Flag keys to check:', this.flagKeys);
            
            // Check LaunchDarkly SDK
            if (!window.LDClient || !window.LDClient.initialize) {
                throw new Error('LaunchDarkly SDK not loaded. Check if ldclient.min.js loaded properly.');
            }
            
            console.log('✅ LaunchDarkly SDK found, initializing...');
            
            // Initialize LaunchDarkly with localhost-friendly configuration
            this.client = window.LDClient.initialize(this.clientSideId, userContext, {
                sendEvents: false, // Disable events to avoid CORS issues on localhost
                useReport: false,  // Use GET requests instead of POST to avoid preflight
                bootstrap: 'localStorage',
                streaming: true    // Enable streaming for real-time flag updates
            });
            
            console.log('⏳ Waiting for LaunchDarkly initialization...');
            
            // Wait for initialization with detailed timeout
            const initTimeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('LaunchDarkly initialization timeout after 10 seconds')), 10000)
            );
            
            await Promise.race([
                this.client.waitForInitialization(),
                initTimeout
            ]);
            
            this.isInitialized = true;
            this.currentUser = userContext;
            
            console.log('✅ LaunchDarkly initialized successfully!');
            
            // Test flag retrieval immediately
            console.log('🧪 Testing flag retrieval...');
            try {
                const testColor = this.client.variation(this.flagKeys.dinoColor, 'green');
                const testDifficulty = this.client.variation(this.flagKeys.difficulty, 'medium');
                const testWeather = this.client.variation(this.flagKeys.weather, 'spring');
                
                console.log('🎯 Flag test results:');
                console.log(`  🎨 ${this.flagKeys.dinoColor}: ${testColor}`);
                console.log(`  ⚡ ${this.flagKeys.difficulty}: ${testDifficulty}`);
                console.log(`  🌤️ ${this.flagKeys.weather}: ${testWeather}`);
                
                // Update flags
                await this.updateAllFlags();
                
                // Listen for flag changes
                this.client.on('change', () => {
                    console.log('🔄 Flag change detected from LaunchDarkly!');
                    this.updateAllFlags();
                });
                
                this.notifyCallbacks();
                
                console.log('🎉 Real LaunchDarkly connection established successfully!');
                console.log('💡 Try changing flag values in your LaunchDarkly dashboard now');
                
                return true;
                
            } catch (flagError) {
                console.error('❌ Error retrieving flags:', flagError);
                console.log('🔧 This usually means:');
                console.log('  1. Flags don\'t exist in your LaunchDarkly project');
                console.log('  2. Flag keys don\'t match:', this.flagKeys);
                console.log('  3. User doesn\'t have access to flags');
                throw flagError;
            }
            
        } catch (error) {
            console.error('❌ Real LaunchDarkly connection failed:', error);
            console.error('Stack trace:', error.stack);
            console.log('🔧 Debugging info:');
            console.log('  - Client-side ID:', this.clientSideId);
            console.log('  - Project name:', this.projectName);
            console.log('  - Flag keys:', this.flagKeys);
            console.log('  - LDClient available:', typeof window.LDClient);
            
            // Don't fallback to demo mode - throw the error so user can see it
            throw error;
        }
    }

    // Clean reset - go back to working LaunchDarkly
    cleanReset() {
        console.log('🧹 CLEAN RESET - Clearing all demo mode and reinitializing LaunchDarkly');
        
        // Stop any demo intervals
        if (this.demoInterval) {
            clearInterval(this.demoInterval);
            this.demoInterval = null;
        }
        
        // Close existing client if any
        if (this.client) {
            try {
                this.client.close();
            } catch (e) {
                console.log('Note: Error closing client (normal if already closed)');
            }
        }
        
        // Reset all state
        this.client = null;
        this.isInitialized = false;
        this.demoMode = false;
        this.currentUser = null;
        
        // Reset to defaults
        this.featureFlags = {
            dinoColor: 'green',
            difficulty: 'medium',
            weather: 'spring'
        };
        
        console.log('✅ State cleared. Now reinitializing with real LaunchDarkly...');
        
        // Reinitialize properly
        return this.initialize();
    }

    // Simple test to verify LaunchDarkly is working
    testFlags() {
        console.log('🧪 Testing LaunchDarkly flag retrieval...');
        
        if (!this.client || !this.isInitialized) {
            console.log('❌ LaunchDarkly not initialized');
            return false;
        }
        
        try {
            console.log('🎯 Current flag values:');
            const color = this.getDinoColor();
            const difficulty = this.getDifficulty();
            const weather = this.getWeather();
            
            console.log(`  🎨 Dino Color: ${color}`);
            console.log(`  ⚡ Difficulty: ${difficulty}`);
            console.log(`  🌤️ Weather: ${weather}`);
            
            console.log('✅ LaunchDarkly flags working correctly!');
            console.log('💡 Try changing flag values in your LaunchDarkly dashboard');
            return true;
            
        } catch (error) {
            console.error('❌ Error testing flags:', error);
            return false;
        }
    }

    // Force refresh flags from LaunchDarkly (fixes stale flag issue)
    async forceRefreshFlags() {
        console.log('🔄 === FORCING FLAG REFRESH ===');
        
        if (!this.client || !this.isInitialized) {
            console.log('❌ LaunchDarkly not initialized, cannot refresh');
            return false;
        }
        
        try {
            console.log('💫 Forcing flag refresh from LaunchDarkly...');
            
            // Force the client to fetch fresh flags
            await this.client.flush();
            
            // Wait a moment for fresh data
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Get fresh flag values
            const freshColor = this.client.variation(this.flagKeys.dinoColor, 'green');
            const freshDifficulty = this.client.variation(this.flagKeys.difficulty, 'medium');
            const freshWeather = this.client.variation(this.flagKeys.weather, 'spring');
            
            console.log('🎯 Fresh flag values from LaunchDarkly:');
            console.log(`  🎨 Color: ${freshColor}`);
            console.log(`  ⚡ Difficulty: ${freshDifficulty}`);
            console.log(`  🌤️ Weather: ${freshWeather}`);
            
            // Update our local flags
            this.featureFlags.dinoColor = freshColor;
            this.featureFlags.difficulty = freshDifficulty;
            this.featureFlags.weather = freshWeather;
            
            // Update UI and notify game
            this.updateFlagDisplay();
            this.notifyCallbacks();
            
            console.log('✅ Flags refreshed successfully!');
            return true;
            
        } catch (error) {
            console.error('❌ Error refreshing flags:', error);
            return false;
        }
    }

    // Debug LaunchDarkly step by step
    debugLaunchDarkly() {
        console.log('🔍 === LAUNCHDARKLY DEBUG ===');
        console.log('1. Basic State Check:');
        console.log('   - Client exists:', !!this.client);
        console.log('   - Is initialized:', this.isInitialized);
        console.log('   - Demo mode:', this.demoMode);
        console.log('   - Current flags:', this.featureFlags);
        
        console.log('2. Configuration Check:');
        console.log('   - Client-side ID:', this.clientSideId);
        console.log('   - Project name:', this.projectName);
        console.log('   - Flag keys:', this.flagKeys);
        
        console.log('3. LaunchDarkly SDK Check:');
        console.log('   - LDClient available:', typeof window.LDClient);
        console.log('   - LDClient.initialize available:', !!(window.LDClient && window.LDClient.initialize));
        
        if (this.client) {
            console.log('4. Client State Check:');
            try {
                console.log('   - Client initialized:', !!this.client.isInitialized);
                console.log('   - Client allFlags():', this.client.allFlags());
                
                console.log('5. Manual Flag Retrieval Test:');
                const colorTest = this.client.variation(this.flagKeys.dinoColor, 'test-green');
                const difficultyTest = this.client.variation(this.flagKeys.difficulty, 'test-medium');
                const weatherTest = this.client.variation(this.flagKeys.weather, 'test-spring');
                
                console.log(`   - Color flag (${this.flagKeys.dinoColor}):`, colorTest);
                console.log(`   - Difficulty flag (${this.flagKeys.difficulty}):`, difficultyTest);
                console.log(`   - Weather flag (${this.flagKeys.weather}):`, weatherTest);
                
                // Try to update flags manually
                console.log('6. Manual Flag Update:');
                this.featureFlags.dinoColor = colorTest;
                this.featureFlags.difficulty = difficultyTest;
                this.featureFlags.weather = weatherTest;
                
                console.log('   - Updated featureFlags:', this.featureFlags);
                
                // Update display
                this.updateFlagDisplay();
                this.notifyCallbacks();
                
                console.log('✅ Manual flag update completed');
                
            } catch (error) {
                console.error('❌ Error during manual flag test:', error);
            }
        } else {
            console.log('❌ No LaunchDarkly client available for testing');
        }
        
        console.log('🔍 === DEBUG COMPLETE ===');
    }
}

// Create global instance
window.ldManager = new LaunchDarklyManager(); 