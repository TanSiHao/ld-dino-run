// LaunchDarkly JavaScript SDK Configuration with Observability & Session Replay
// Implementation following official documentation: https://docs.launchdarkly.com/sdk/client-side/javascript/

// ES6 imports with observability support  
import { initialize } from "launchdarkly-js-client-sdk";
import { LDObserve } from "@launchdarkly/observability";
import { LDRecord } from "@launchdarkly/session-replay";
import DinoRunConfig from './config.js';

/**
 * LaunchDarkly Manager with Observability & Session Replay - ES6 Module Implementation
 */
class LaunchDarklyManager {
    constructor() {
        console.log('🔧 LaunchDarklyManager constructor starting...');
        
        try {
            // Load configuration from imported module
            console.log('📋 Loading configuration...');
            const config = DinoRunConfig || {};
            console.log('✅ Configuration loaded:', !!config);
        
        this.clientSideId = config.launchDarkly?.clientSideId || 'YOUR_CLIENT_SIDE_ID_HERE';
        this.projectName = config.launchDarkly?.projectName || 'dino-run-game';
        
        // SDK client instance
        this.client = null;
        this.isInitialized = false;
        this.initializationPromise = null; // Track ongoing initialization to prevent multiple connections
        
        // Feature flag mappings
        this.flagKeys = {
            dinoColor: config.launchDarkly?.flags?.dinoColor || 'dino-color',
            difficulty: config.launchDarkly?.flags?.difficulty || 'game-difficulty',
            weather: config.launchDarkly?.flags?.weather || 'weather-background',
            obstacleType: config.launchDarkly?.flags?.obstacleType || 'obstacle-type'
        };
        
        // Current flag values with safe defaults
        this.flags = {
            dinoColor: 'green',
            difficulty: 'medium',
            weather: 'spring',
            obstacleType: 'logos'
        };
        
        // Event callbacks for flag changes
        this.changeCallbacks = [];
        
        // Connection monitoring
        this.connectionCount = 0;
        this.lastConnectionTime = null;
        
        console.log('🚀 LaunchDarkly Manager created');
        console.log('📋 Configuration:', {
            clientSideId: this.clientSideId.substring(0, 8) + '...',
            project: this.projectName,
            flagKeys: this.flagKeys
        });
        
        // Debug: Check ES6 module imports (simplified for debugging)
        console.log('🔍 Checking ES6 module imports:');
        console.log('- initialize function:', typeof initialize);
                    // Observability imports enabled
        console.log('- LDObserve:', typeof LDObserve);
        console.log('- LDRecord:', typeof LDRecord);
        
        console.log('🔧 LaunchDarklyManager constructor completed successfully');
        
        } catch (constructorError) {
            console.error('❌ Error in LaunchDarklyManager constructor:', constructorError);
            console.error('Constructor error stack:', constructorError.stack);
            throw constructorError; // Re-throw to prevent broken object
        }
    }
    
    /**
     * Initialize LaunchDarkly client
     * @param {string} playerName - Optional player name for context
     * @returns {Promise<boolean>} - True if successful, false if failed
     */
    async initialize(playerName = null) {
        console.log('🔧 Initializing LaunchDarkly client...');
        
        // SINGLETON PROTECTION: Only initialize once
        if (this.isInitialized && this.client) {
            console.log('✅ LaunchDarkly already initialized (singleton protection)');
            console.log('🔍 Current client state:', {
                isInitialized: this.isInitialized,
                clientReady: this.client.isInitialized,
                connectionCount: 'existing'
            });
            return true;
        }
        
        // If initialization is in progress, wait for it
        if (this.initializationPromise) {
            console.log('⏳ Initialization already in progress, waiting...');
            return this.initializationPromise;
        }
        
        // Start new initialization
        console.log('🚀 Starting fresh LaunchDarkly initialization...');
        this.initializationPromise = this._performInitialization(playerName);
        
        try {
            const result = await this.initializationPromise;
            this.initializationPromise = null; // Clear promise on completion
            return result;
        } catch (error) {
            this.initializationPromise = null; // Clear promise on error
            throw error;
        }
    }
    
    /**
     * Internal initialization method
     * @private
     */
    async _performInitialization(playerName) {
        try {
            // Validate LaunchDarkly SDK is imported via ES6 modules
            if (typeof initialize === 'undefined') {
                throw new Error('LaunchDarkly SDK not imported properly. Check import maps and ES6 modules.');
            }
            
            // Create user context
            const context = this._createContext(playerName);
            console.log('👤 User context created:', {
                kind: context.kind,
                key: context.key,
                name: context.name
            });
            
            // Configure client options with observability plugins
            const options = {
                streaming: true,
                sendEvents: true,        // Enable sending events/context to LaunchDarkly platform
                useReport: false,
                bootstrap: 'localStorage',
                // Observability plugins enabled
                plugins: [
                    ...(typeof LDObserve !== 'undefined' ? [
                        LDObserve({
                            tracingOrigins: [window.location.origin],
                            webVitals: { enabled: true },
                            eventCapture: { 
                                captureClicks: true,
                                captureFormSubmits: true,
                                capturePageViews: true
                            }
                        })
                    ] : []),
                    ...(typeof LDRecord !== 'undefined' ? [
                        LDRecord({
                            privacySetting: 'default',
                            sampleRate: 100, // Record 100% of sessions
                            maxSessionLength: 30, // Maximum 30 minutes
                            blockSelectors: [
                                'input[type="password"]',
                                '[data-private]'
                            ],
                            maskTextSelector: '[data-mask]'
                        })
                    ] : [])
                ]
            };
            
            // Log plugin availability for debugging
            console.log('🔌 Plugin status:');
            console.log('- Observability (LDObserve):', typeof LDObserve !== 'undefined' ? '✅ enabled' : '❌ not available');
            console.log('- Session Replay (LDRecord):', typeof LDRecord !== 'undefined' ? '✅ enabled' : '❌ not available'); 
            console.log('- Total plugins configured:', options.plugins.length);
            
            console.log('🔌 Initializing LaunchDarkly client...');
            
            // Track connection attempt
            this.connectionCount++;
            this.lastConnectionTime = new Date().toISOString();
            console.log(`📊 Connection attempt #${this.connectionCount} at ${this.lastConnectionTime}`);
            
            // Warn about multiple connections
            if (this.connectionCount > 1) {
                console.warn('⚠️ WARNING: Multiple LaunchDarkly connections detected!');
                console.warn('🔍 This may indicate:');
                console.warn('  - initialize() called multiple times');
                console.warn('  - identifyUser() called before initialization complete');
                console.warn('  - Application initialization race conditions');
                console.warn('💡 Use window.debugDinoRun.checkConnections() to monitor');
            }
            
            // Initialize client using ES6 imported initialize function
            this.client = initialize(this.clientSideId, context, options);
            
            // Wait for initialization with timeout
            console.log('⏳ Waiting for client initialization...');
            await this.client.waitForInitialization(5);
            
            console.log('✅ LaunchDarkly client initialized successfully');
            
            // Load initial flag values
            this._loadInitialFlags();
            
            // Set up change listener
            this._setupChangeListener();
            
            this.isInitialized = true;
            console.log('🎉 LaunchDarkly initialization complete');
            
            // Send initialization event to LaunchDarkly platform
            this.trackEvent('user_initialized', {
                initTime: new Date().toISOString(),
                playerName: playerName || 'anonymous',
                flagsLoaded: Object.keys(this.flags).length
            });
            
            // Notify callbacks
            this._notifyCallbacks();
            
            return true;
            
        } catch (error) {
            console.error('❌ LaunchDarkly initialization failed:', error);
            
            // Use fallback values
            console.log('🔄 Using fallback flag values');
            this._notifyCallbacks();
            
            return false;
        }
    }
    
    /**
     * Create user context for LaunchDarkly
     * @private
     */
    _createContext(playerName) {
        let contextKey;
        let displayName;
        
        if (playerName && playerName.trim()) {
            // Use player name as basis for key - normalize for consistency
            const normalizedName = playerName.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
            contextKey = `player-${normalizedName}`;
            displayName = playerName.trim();
        } else {
            // Anonymous user - use session-based key
            if (!this.anonymousUserKey) {
                this.anonymousUserKey = 'anonymous-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
            }
            contextKey = this.anonymousUserKey;
            displayName = 'Anonymous Player';
        }
        
        return {
            kind: 'user',
            key: contextKey,
            name: displayName,
            email: playerName ? `${playerName.toLowerCase().replace(/\s+/g, '.')}@dino-game.local` : 'anonymous@dino-game.local',
            custom: {
                gameVersion: '1.0.0',
                project: this.projectName,
                platform: 'web',
                browser: navigator.userAgent.split(' ')[0] || 'unknown',
                lastUpdated: new Date().toISOString(),
                sessionStarted: new Date().toISOString(),
                isAnonymous: !playerName || !playerName.trim()
            }
        };
    }
    
    /**
     * Load initial flag values from LaunchDarkly
     * @private
     */
    _loadInitialFlags() {
        try {
            console.log('📊 Loading initial flag values...');
            
            // Get all flags to verify connection
            const allFlags = this.client.allFlags();
            console.log('🎯 All flags from LaunchDarkly:', allFlags);
            
            // Evaluate specific flags
            this.flags = {
                dinoColor: this.client.variation(this.flagKeys.dinoColor, 'green'),
                difficulty: this.client.variation(this.flagKeys.difficulty, 'medium'),
                weather: this.client.variation(this.flagKeys.weather, 'spring'),
                obstacleType: this.client.variation(this.flagKeys.obstacleType, 'logos')
            };
            
            console.log('🎯 Final flag values:', this.flags);
            
        } catch (error) {
            console.error('❌ Error loading initial flags:', error);
        }
    }
    
    /**
     * Set up real-time change listener for flag updates
     * @private
     */
    _setupChangeListener() {
        console.log('👂 Setting up real-time change listener...');
        
        // Listen for all flag changes
        this.client.on('change', (changes) => {
            console.log('🚨 === REAL-TIME FLAG CHANGE RECEIVED ===');
            console.log('📊 Raw changes from LaunchDarkly:', changes);
            console.log('⏰ Change received at:', new Date().toISOString());
            
            // Update flag values
            console.log('🔄 Updating internal flag values...');
            this._updateFlagValues();
            
            console.log('📢 Notifying ' + this.changeCallbacks.length + ' registered callbacks...');
            // Notify game of changes
            this._notifyCallbacks();
            
            console.log('✅ Real-time flag change processing complete');
        });
        
        // Listen for specific flag changes for debugging
        Object.values(this.flagKeys).forEach(flagKey => {
            this.client.on(`change:${flagKey}`, (newValue, oldValue) => {
                console.log(`🎯 Specific flag change: ${flagKey} = ${oldValue} → ${newValue}`);
            });
        });
        
        // Listen for connection events
        this.client.on('ready', () => {
            console.log('✅ LaunchDarkly client ready for streaming');
        });
        
        this.client.on('failed', (error) => {
            console.error('❌ LaunchDarkly client failed:', error);
        });
        
        // Check if streaming is actually active
        setTimeout(() => {
            console.log('🔍 Streaming status check:');
            console.log('  - Client initialized:', this.client.isInitialized);
            console.log('  - Callbacks registered:', this.changeCallbacks.length);
            console.log('  - Streaming should be active when callbacks > 0');
        }, 1000);
        
        console.log('✅ Real-time change listener configured');
        
        // Force streaming connection by explicitly setting streaming mode
        // This ensures streaming is active even if there are connectivity issues
        try {
            this.client.setStreaming(true);
            console.log('🔄 Explicitly enabled streaming mode');
        } catch (error) {
            console.warn('⚠️ Could not explicitly set streaming mode:', error);
        }
    }
    
    /**
     * Update flag values from current client state
     * @private
     */
    _updateFlagValues() {
        if (!this.client || !this.isInitialized) {
            console.warn('⚠️ Cannot update flags: client not initialized');
            return;
        }
        
        const oldFlags = { ...this.flags };
        
        // Get fresh values
        this.flags = {
            dinoColor: this.client.variation(this.flagKeys.dinoColor, this.flags.dinoColor),
            difficulty: this.client.variation(this.flagKeys.difficulty, this.flags.difficulty),
            weather: this.client.variation(this.flagKeys.weather, this.flags.weather),
            obstacleType: this.client.variation(this.flagKeys.obstacleType, this.flags.obstacleType)
        };
        
        // Log changes and track events
        Object.keys(this.flags).forEach(key => {
            if (oldFlags[key] !== this.flags[key]) {
                console.log(`🔄 Flag changed: ${key} = ${oldFlags[key]} → ${this.flags[key]}`);
                this.trackFlagChange(key, oldFlags[key], this.flags[key]);
            }
        });
    }
    
    /**
     * Change user context
     * @param {string} playerName - New player name
     */
    async identifyUser(playerName) {
        // If not initialized at all, initialize with the player name
        if (!this.client || !this.isInitialized) {
            console.log('🔄 Client not ready, initializing with user context...');
            return this.initialize(playerName);
        }
        
        // If already initialized but client not ready, wait and then identify
        if (!this.client.isInitialized) {
            console.log('⏳ Client exists but not ready, waiting for initialization...');
            try {
                await this.client.waitForInitialization(5);
            } catch (error) {
                console.warn('⚠️ Client initialization timeout, proceeding with identify anyway');
            }
        }
        
        try {
            console.log('👤 Identifying user with name:', playerName);
            
            const newContext = this._createContext(playerName);
            console.log('📝 New context created:', {
                key: newContext.key,
                name: newContext.name,
                email: newContext.email,
                isAnonymous: newContext.custom.isAnonymous
            });
            
            await this.client.identify(newContext);
            
            // Track user identification event
            this.trackEvent('user_identified', {
                playerName: playerName,
                newUserKey: newContext.key,
                previousContext: 'anonymous',
                newContext: 'named-player',
                timestamp: new Date().toISOString()
            });
            
            console.log('✅ User context updated successfully to:', newContext.name);
            console.log('🎯 LaunchDarkly should now show user as:', playerName);
            
        } catch (error) {
            console.error('❌ Failed to identify user:', error);
            throw error;
        }
    }
    
    /**
     * Register callback for flag changes
     * @param {Function} callback - Function to call when flags change
     */
    onChange(callback) {
        if (typeof callback === 'function') {
            this.changeCallbacks.push(callback);
        }
    }
    
    /**
     * Track custom events to LaunchDarkly platform
     * @param {string} eventName - Name of the event
     * @param {Object} data - Additional event data
     */
    trackEvent(eventName, data = {}) {
        if (!this.client || !this.isInitialized) {
            console.warn('⚠️ Cannot track event: client not initialized');
            return;
        }
        
        try {
            this.client.track(eventName, data);
            console.log(`📊 Event tracked: ${eventName}`, data);
        } catch (error) {
            console.error('❌ Error tracking event:', error);
        }
    }
    
    /**
     * Track game-specific events
     */
    trackGameStart(playerName) {
        this.trackEvent('game_started', {
            playerName: playerName || 'anonymous',
            timestamp: new Date().toISOString(),
            flags: this.flags
        });
    }
    
    trackGameEnd(score, duration) {
        this.trackEvent('game_ended', {
            score: score || 0,
            duration: duration || 0,
            timestamp: new Date().toISOString(),
            flags: this.flags
        });
    }

    /**
     * Track game score event as requested - sends to LaunchDarkly with user context
     * @param {number} score - Final game score
     * @param {string} playerName - Name of the player
     * @param {number} duration - Game duration in milliseconds
     * @param {boolean} isNewHighScore - Whether this is a new high score
     */
    trackGameScore(score, playerName, duration, isNewHighScore = false) {
        if (!this.client || !this.isInitialized) {
            console.warn('⚠️ Cannot track game score: LaunchDarkly client not ready');
            return;
        }

        try {
            // Get current user context
            const currentContext = this.getCurrentContext();
            
            // Prepare comprehensive event data
            const eventData = {
                // Core required data
                score: score || 0,
                playerName: playerName || 'Anonymous',
                timestamp: new Date().toISOString(),
                
                // User context information  
                userContext: {
                    key: currentContext?.key || 'unknown',
                    name: currentContext?.name || 'Anonymous',
                    email: currentContext?.email || 'anonymous@dino-game.local',
                    isAnonymous: currentContext?.custom?.isAnonymous || true
                },
                
                // Game session details
                gameDuration: duration || 0,
                isNewHighScore: isNewHighScore,
                
                // Feature flag context (what settings were active during this game)
                activeFlags: {
                    dinoColor: this.getDinoColor(),
                    difficulty: this.getDifficulty(), 
                    weather: this.getWeather()
                },
                
                // Additional metadata
                gameVersion: '1.0.0',
                platform: 'web',
                sessionId: currentContext?.key || 'unknown',
                browser: navigator.userAgent.split(' ')[0] || 'unknown'
            };

            // Send the "game-score" event to LaunchDarkly
            console.log('📊 Tracking game score event:', eventData);
            this.client.track('game-score', eventData);
            
            console.log(`✅ Game score event sent to LaunchDarkly: ${playerName} scored ${score} points`);
            
        } catch (error) {
            console.error('❌ Failed to track game score event:', error);
        }
    }
    
    trackFlagChange(flagKey, oldValue, newValue) {
        this.trackEvent('flag_changed', {
            flagKey,
            oldValue,
            newValue,
            timestamp: new Date().toISOString()
        });
    }
    
    /**
     * Notify all registered callbacks
     * @private
     */
    _notifyCallbacks() {
        this.changeCallbacks.forEach(callback => {
            try {
                callback(this.flags);
            } catch (error) {
                console.error('❌ Error in flag change callback:', error);
            }
        });
    }
    
    // =============================================================================
    // PUBLIC API - Simple getter methods for game integration
    // =============================================================================
    
    /**
     * Get current dino color
     * @returns {string} Color name
     */
    getDinoColor() {
        return this.flags.dinoColor;
    }
    
    /**
     * Get current difficulty
     * @returns {string} Difficulty level
     */
    getDifficulty() {
        return this.flags.difficulty;
    }
    
    /**
     * Get current weather
     * @returns {string} Weather type
     */
    getWeather() {
        return this.flags.weather;
    }
    
    /**
     * Get current obstacle type
     * @returns {string} Obstacle type
     */
    getObstacleType() {
        return this.flags.obstacleType;
    }
    
    /**
     * Get hex color code for dino color
     * @param {string} colorName - Color name
     * @returns {string} Hex color code
     */
    getDinoColorHex(colorName) {
        const colors = {
            'green': '#2d7d32',
            'blue': '#1976d2', 
            'red': '#d32f2f',
            'purple': '#7b1fa2',
            'orange': '#f57c00',
            'pink': '#c2185b'
        };
        return colors[colorName] || colors['green'];
    }
    
    /**
     * Get difficulty settings
     * @returns {Object} Difficulty configuration
     */
    getDifficultySettings() {
        const settings = {
            'easy': { obstacleSpeed: 3, obstacleFrequency: 120, jumpHeight: 100 },
            'medium': { obstacleSpeed: 5, obstacleFrequency: 100, jumpHeight: 90 },
            'hard': { obstacleSpeed: 7, obstacleFrequency: 80, jumpHeight: 80 }
        };
        return settings[this.flags.difficulty] || settings['medium'];
    }
    
    /**
     * Get weather background color
     * @returns {string} CSS color value
     */
    getWeatherBackground() {
        const backgrounds = {
            'spring': '#87ceeb',
            'summer': '#ffeb3b', 
            'autumn': '#ff9800',
            'winter': '#e3f2fd'
        };
        return backgrounds[this.flags.weather] || backgrounds['spring'];
    }
    
    // =============================================================================
    // UTILITY & DEBUG METHODS
    // =============================================================================
    
    /**
     * Get current user context information
     * @returns {Object} Current user context
     */
    getCurrentContext() {
        if (!this.client || !this.isInitialized) {
            return { error: 'Client not initialized' };
        }
        
        try {
            const context = this.client.getContext();
            return {
                key: context.key,
                name: context.name,
                email: context.email,
                isAnonymous: context.custom?.isAnonymous || false,
                keyType: context.key.startsWith('player-') ? 'named-player' : 'anonymous',
                custom: context.custom
            };
        } catch (error) {
            return { error: error.message };
        }
    }
    
    /**
     * Get current status and debug information
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            hasClient: !!this.client,
            clientReady: this.client ? this.client.isInitialized : false,
            currentFlags: this.flags,
            flagKeys: this.flagKeys,
            clientSideId: this.clientSideId.substring(0, 8) + '...',
            userContext: this.getCurrentContext(),
            connectionMonitoring: {
                connectionCount: this.connectionCount,
                lastConnectionTime: this.lastConnectionTime,
                initializationInProgress: !!this.initializationPromise
            }
        };
    }
    
    /**
     * Properly shutdown LaunchDarkly client
     * @returns {Promise<void>}
     */
    async shutdown() {
        console.log('🛑 Shutting down LaunchDarkly client...');
        
        if (this.client) {
            try {
                await this.client.close();
                console.log('✅ LaunchDarkly client closed successfully');
            } catch (error) {
                console.error('❌ Error closing LaunchDarkly client:', error);
            }
        }
        
        // Reset state
        this.client = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        this.changeCallbacks = [];
        
        console.log('🔄 LaunchDarkly manager state reset');
    }
    
    /**
     * Test LaunchDarkly connection and configuration
     * @returns {Promise<boolean>} Success status
     */
    async test() {
        console.log('🧪 Testing LaunchDarkly connection...');
        
        const status = this.getStatus();
        console.log('📊 Current status:', status);
        
        if (!this.isInitialized) {
            console.log('🔄 Not initialized, attempting initialization...');
            return this.initialize();
        }
        
        if (this.client && this.client.isInitialized) {
            console.log('✅ LaunchDarkly is working correctly');
            console.log('🎯 Current flags:', this.flags);
            return true;
        } else {
            console.error('❌ LaunchDarkly client exists but is not initialized');
            return false;
        }
    }
    
    /**
     * Test streaming connection and real-time updates
     * @returns {Promise<boolean>} Success status
     */
    async testStreaming() {
        console.log('🔄 === TESTING STREAMING CONNECTION ===');
        
        if (!this.client || !this.isInitialized) {
            console.error('❌ Client not initialized');
            return false;
        }
        
        try {
            console.log('📊 Current streaming status:');
            console.log('  - Client initialized:', this.client.isInitialized);
            console.log('  - Callbacks registered:', this.changeCallbacks.length);
            console.log('  - Expected streaming active:', this.changeCallbacks.length > 0);
            
            console.log('🎯 Current flag values:');
            Object.entries(this.flags).forEach(([key, value]) => {
                console.log(`  - ${key}: ${value}`);
            });
            
            console.log('💡 To test real-time updates:');
            console.log('  1. Keep this console open');
            console.log('  2. Go to LaunchDarkly dashboard');
            console.log('  3. Change any flag value');
            console.log('  4. Watch for "🚨 REAL-TIME FLAG CHANGE RECEIVED" messages');
            console.log('  5. If no messages appear, streaming is not working');
            
            // Force a flag refresh to verify current values
            console.log('🔄 Forcing flag refresh to verify current values...');
            const allFlags = this.client.allFlags();
            console.log('📈 All flags from LaunchDarkly:', allFlags);
            
            return true;
            
        } catch (error) {
            console.error('❌ Error testing streaming:', error);
            return false;
        }
    }
    
    /**
     * Force refresh of all flag values
     * @returns {Promise<boolean>} Success status
     */
    async refresh() {
        if (!this.client || !this.isInitialized) {
            console.warn('⚠️ Cannot refresh: client not initialized');
            return false;
        }
        
        try {
            console.log('🔄 Refreshing flag values...');
            
            // Update flag values
            this._updateFlagValues();
            
            // Notify callbacks
            this._notifyCallbacks();
            
            console.log('✅ Flags refreshed successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Error refreshing flags:', error);
            return false;
        }
    }
    
    // ===================
    // SESSION REPLAY METHODS
    // ===================
    
    /**
     * Start session replay manually
     */
    startSessionReplay() {
        if (this.isReady() && typeof LDRecord !== 'undefined') {
            try {
                LDRecord.start();
                this.trackGameEvent('session_replay_started', { 
                    timestamp: new Date().toISOString(),
                    manual: true 
                });
                console.log('🎥 Session replay started manually');
                return true;
            } catch (error) {
                console.error('❌ Error starting session replay:', error);
                return false;
            }
        }
        console.warn('⚠️ Session replay not available - LDRecord ES6 module not imported or client not ready');
        return false;
    }

    /**
     * Stop session replay manually
     */
    stopSessionReplay() {
        if (this.isReady() && typeof LDRecord !== 'undefined') {
            try {
                LDRecord.stop();
                this.trackGameEvent('session_replay_stopped', { 
                    timestamp: new Date().toISOString(),
                    manual: true 
                });
                console.log('⏹️ Session replay stopped manually');
                return true;
            } catch (error) {
                console.error('❌ Error stopping session replay:', error);
                return false;
            }
        }
        console.warn('⚠️ Session replay not available');
        return false;
    }

    /**
     * Check if session replay is active
     */
    isSessionReplayActive() {
        if (this.isReady() && typeof LDRecord !== 'undefined') {
            try {
                return LDRecord.isRecording();
            } catch (error) {
                console.error('❌ Error checking session replay status:', error);
                return false;
            }
        }
        return false;
    }

    /**
     * Get session replay status
     */
    getSessionReplayStatus() {
        if (!this.isReady()) {
            return { available: false, reason: 'LaunchDarkly not initialized' };
        }
        
        if (typeof LDRecord === 'undefined') {
            return { available: false, reason: 'Session replay plugin not loaded' };
        }
        
        try {
            return {
                available: true,
                recording: LDRecord.isRecording(),
                sessionId: LDRecord.getSessionId ? LDRecord.getSessionId() : 'unavailable',
                recordingUrl: LDRecord.getRecordingUrl ? LDRecord.getRecordingUrl() : 'unavailable'
            };
        } catch (error) {
            return { 
                available: true, 
                error: error.message,
                recording: false 
            };
        }
    }

    /**
     * Track custom game events with observability metadata
     */
    trackGameEvent(eventName, properties = {}) {
        if (!this.isReady()) {
            console.warn('⚠️ Cannot track event - LaunchDarkly not initialized');
            return;
        }
        
        // Enhanced event with observability metadata
        const eventData = {
            ...properties,
            game: 'dino-run',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            sessionId: this.getCurrentContext()?.key || 'unknown',
            url: window.location.href,
            userAgent: navigator.userAgent.substring(0, 50),
            // Add observability context
            observability: {
                sessionReplayActive: this.isSessionReplayActive(),
                webVitalsEnabled: true
            }
        };
        
        try {
            // Send to LaunchDarkly
            this.client.track(eventName, eventData);
            
            // Log for debugging
            console.log(`📊 Event tracked: ${eventName}`, eventData);
        } catch (error) {
            console.error('❌ Error tracking event:', error);
        }
    }

    /**
     * Track performance metrics with observability
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
}

// Create and expose global instance (SINGLE INSTANCE ONLY)
console.log('🏗️ Creating LaunchDarklyManager instance...');
try {
    window.ldManager = new LaunchDarklyManager();
    console.log('✅ LaunchDarklyManager instance created successfully');
    console.log('- Instance type:', typeof window.ldManager);
    console.log('- Instance constructor:', window.ldManager.constructor?.name);
    console.log('- Has isReady method:', typeof window.ldManager.isReady);
    console.log('- Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.ldManager)).filter(name => typeof window.ldManager[name] === 'function'));
} catch (error) {
    console.error('❌ Error creating LaunchDarklyManager:', error);
    console.error('Error stack:', error.stack);
}

// Backward compatibility aliases
try {
    if (window.ldManager && typeof window.ldManager.onChange === 'function') {
        window.ldManager.onFlagsUpdated = window.ldManager.onChange.bind(window.ldManager);
        console.log('✅ onFlagsUpdated alias created');
    } else {
        console.error('❌ onChange method not available for alias');
    }
    
    if (window.ldManager && typeof window.ldManager.identifyUser === 'function') {
        window.ldManager.reinitializeWithUser = window.ldManager.identifyUser.bind(window.ldManager);
        console.log('✅ reinitializeWithUser alias created');
    } else {
        console.error('❌ identifyUser method not available for alias');
    }
} catch (aliasError) {
    console.error('❌ Error creating aliases:', aliasError);
}

// ES6 Module exports
console.log('📤 Creating ES6 module exports...');
export { LaunchDarklyManager };
export const ldManager = window.ldManager;
console.log('✅ ES6 exports created, ldManager type:', typeof ldManager);

console.log('✅ LaunchDarkly Manager ready');
console.log('💡 Usage examples:');
console.log('  - window.ldManager.initialize("PlayerName")');
console.log('  - window.ldManager.getDinoColor()');
console.log('  - window.ldManager.test()');
console.log('  - window.ldManager.getStatus()');
console.log('👤 Context Key Examples:');
console.log('  - Named player "John Doe" → key: "player-john-doe"');
console.log('  - Named player "Alex Smith" → key: "player-alex-smith"');
console.log('  - Anonymous player → key: "anonymous-[timestamp]-[random]"');