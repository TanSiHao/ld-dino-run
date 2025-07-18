// LaunchDarkly JavaScript SDK Configuration
// Simple implementation following official documentation: https://docs.launchdarkly.com/sdk/client-side/javascript/

/**
 * Simple LaunchDarkly Manager - Clean implementation following official patterns
 */
class LaunchDarklyManager {
    constructor() {
        // Load configuration
        const config = window.DinoRunConfig || {};
        
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
            // Check if SDK is loaded
            if (typeof LDClient === 'undefined') {
                throw new Error('LaunchDarkly SDK not loaded. Check if ldclient.min.js is included.');
            }
            
            // Create user context
            const context = this._createContext(playerName);
            console.log('👤 User context created:', {
                kind: context.kind,
                key: context.key,
                name: context.name
            });
            
            // Configure client options
            const options = {
                streaming: true,
                sendEvents: true,        // Enable sending events/context to LaunchDarkly platform
                useReport: false,
                bootstrap: 'localStorage'
            };
            
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
            
            // Initialize client - THIS IS THE KEY FIX: use LDClient directly, not window.LDClient
            this.client = LDClient.initialize(this.clientSideId, context, options);
            
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
}

// Create and expose global instance (SINGLE INSTANCE ONLY)
window.ldManager = new LaunchDarklyManager();

// Backward compatibility aliases
window.ldManager.onFlagsUpdated = window.ldManager.onChange.bind(window.ldManager);
window.ldManager.reinitializeWithUser = window.ldManager.identifyUser.bind(window.ldManager);

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