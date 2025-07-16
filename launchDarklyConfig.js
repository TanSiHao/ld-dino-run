// LaunchDarkly Configuration with Observability Support (ES6 Module)
// 
// OBSERVABILITY SETUP:
// ===================
// 
// ✅ ES6 Module Architecture with Official LaunchDarkly Imports
// ✅ LaunchDarkly SDK v3.8.1 with Observability & Session Replay
// ✅ Official import statements for better tree shaking and module management
//
// 📖 Full Documentation: README.md section "LaunchDarkly Observability & Session Replay"

export class LaunchDarklyManager {
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
            weather: config.defaults?.weather || 'spring'
        };
        
        // Feature flag keys from configuration
        this.flagKeys = {
            dinoColor: config.launchDarkly?.flags?.dinoColor || 'dino-color',
            difficulty: config.launchDarkly?.flags?.difficulty || 'game-difficulty', 
            weather: config.launchDarkly?.flags?.weather || 'weather-background'
        };
        
        this.callbacks = [];
    }
    
    async initialize(playerName = null) {
        try {
            // Validate configuration
            const isConfigValid = window.DinoRunConfig?.validate() !== false;
            
            if (!isConfigValid) {
                console.log('🎮 Game will run with default values.');
                console.log('💡 To enable LaunchDarkly features:');
                console.log(window.DinoRunConfig?.getSetupInstructions());
                this.isInitialized = true;
                this.notifyCallbacks();
                return;
            }
            
            // Generate comprehensive user context
            let userContext;
            if (window.userDetection) {
                console.log('🔍 Detecting user environment...');
                userContext = await window.userDetection.generateUserContext(playerName);
                
                // Save player data for future sessions
                if (playerName) {
                    window.userDetection.savePlayerData(userContext);
                }
                
                console.log('👤 User Context:', {
                    name: userContext.name,
                    device: userContext.custom.deviceType,
                    browser: `${userContext.custom.browserName} ${userContext.custom.browserVersion}`,
                    os: userContext.custom.operatingSystem,
                    country: userContext.custom.country,
                    firstSession: userContext.custom.firstSession
                });
            } else {
                // Fallback user context if userDetection is not available
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
            console.log('👤 User Context:', userContext);
            
            // Store the current user context before client creation
            this.currentUser = userContext;
            console.log('💾 User context stored for reference');
            
            // Initialize LaunchDarkly client with observability plugins (ES6 modules)
            console.log('🔍 Checking observability plugin availability...');
            console.log('- window.LDClient:', typeof window.LDClient);
            console.log('- window.LDObserve:', typeof window.LDObserve);
            console.log('- window.LDRecord:', typeof window.LDRecord);
            
            // Check if observability plugins are available
            const hasObservabilityPlugins = window.LDObserve && window.LDRecord;
            
            if (hasObservabilityPlugins) {
                console.log('✅ Observability plugins found, initializing with full features...');
                try {
                    this.client = window.LDClient.initialize(this.clientSideId, userContext, {
                        plugins: [
                            // Observability Plugin Configuration
                            new window.LDObserve({
                                tracingOrigins: true, // Track frontend-to-backend requests
                                networkRecording: {
                                    enabled: true,
                                    recordHeadersAndBody: true // Capture network traffic details
                                },
                                // Custom event configuration
                                eventCapture: {
                                    captureClicks: true,
                                    captureFormSubmissions: true,
                                    capturePageViews: true
                                }
                            }),
                            
                            // Session Replay Plugin Configuration
                            new window.LDRecord({
                                privacySetting: 'default', // Options: 'none', 'default', 'strict'
                                manualStart: false, // Set to true for manual control
                                
                                // Privacy settings for sensitive data
                                blockSelectors: [
                                    'input[type="password"]',
                                    '.sensitive-data',
                                    '[data-private]'
                                ],
                                
                                // Sample rate (1 = 100% of sessions recorded)
                                sampleRate: 1,
                                
                                // Maximum session length in minutes
                                maxSessionLength: 30
                            })
                        ],
                        
                        // Enhanced configuration for better observability
                        sendEvents: true,
                        useReport: true,
                        
                        // Optional: Custom event processor for additional analytics
                        eventProcessor: {
                            // Process events before sending to LaunchDarkly
                            processEvent: (event) => {
                                // Add custom metadata to events
                                if (event.kind === 'feature') {
                                    event.custom = {
                                        gameSessionId: this.gameSessionId,
                                        timestamp: Date.now(),
                                        gameMode: 'dino-run'
                                    };
                                }
                                return event;
                            }
                        }
                    });
                    console.log('🎥 LaunchDarkly initialized with observability plugins');
                } catch (pluginError) {
                    console.warn('⚠️ Failed to initialize with observability plugins:', pluginError);
                    console.log('🔄 Falling back to standard initialization...');
                    // Fallback to standard initialization
                    this.client = window.LDClient.initialize(this.clientSideId, userContext);
                }
            } else {
                console.log('ℹ️ Observability plugins not available, using standard initialization');
                console.log('💡 Ensure main.js has loaded and set window.LDObserve and window.LDRecord');
                // Standard initialization without plugins
                this.client = window.LDClient.initialize(this.clientSideId, userContext);
            }
            
            // Wait for initialization with timeout
            const initTimeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('LaunchDarkly initialization timeout (10s)')), 10000)
            );
            
            await Promise.race([
                this.client.waitForInitialization(),
                initTimeout
            ]);
            
            this.isInitialized = true;
            
            // Get initial flag values
            await this.updateAllFlags();
            
            // Listen for flag changes
            this.client.on('change', () => {
                this.updateAllFlags();
            });
            
            console.log('✅ LaunchDarkly initialized successfully');
            console.log(`📋 Project: ${this.projectName}`);
            console.log('🎯 Feature flags:', Object.keys(this.flagKeys));
            console.log('📊 User attributes tracked:', Object.keys(userContext.custom || {}));
            this.notifyCallbacks();
            
        } catch (error) {
            console.error('❌ LaunchDarkly initialization failed:', error);
            console.log('🔧 Troubleshooting tips:');
            console.log('  1. Check your client-side ID in config.js:', this.clientSideId);
            console.log('  2. Verify the flags exist in your LaunchDarkly project');
            console.log('  3. Ensure your LaunchDarkly project allows client-side access');
            console.log('  4. Check browser console for CORS or network errors');
            console.log('  5. Verify flag keys match:', this.flagKeys);
            console.log('🎮 Using default values - game will still work!');
            this.isInitialized = true;
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
                sdkVersion: 'v3.4.0'
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
    
    /**
     * Generate a unique session ID for tracking user sessions
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
                currentUrl: window.location.href
            });
        }
        return this.gameSessionId;
    }
    
    /**
     * Start enhanced observability session (without requiring SDK upgrade)
     * Sets up tracking for this session and logs initial context
     */
    startObservabilitySession() {
        const sessionId = this.generateGameSessionId();
        
        console.log('🔍 Enhanced observability session started');
        console.log('📋 Session ID:', sessionId);
        console.log('🎯 Flag states:', this.featureFlags);
        console.log('💡 Tip: View events in LaunchDarkly Dashboard > Insights > Events');
        
        // Track initial page load
        this.trackPerformanceMetric('page_load_time', performance.now(), 'ms');
        
        return sessionId;
    }
}

// Create global instance
window.ldManager = new LaunchDarklyManager(); 