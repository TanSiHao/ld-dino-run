// Main application initialization script - ES6 Module Entry Point
// Initializes the Dino Run app when DOM is ready

console.log('🚀 main.js loading...');

// Global variables to store imports
let DinoRunApp, ldManager, userDetection;

// Async function to handle dynamic imports with better error handling
async function loadModules() {
    try {
        console.log('📦 Importing DinoRunApp...');
        const appModule = await import('./app.js');
        DinoRunApp = appModule.DinoRunApp;
        console.log('✅ DinoRunApp imported successfully');
        
        console.log('📦 Importing ldManager...');
        const ldModule = await import('./launchDarklyConfig.js');
        ldManager = ldModule.ldManager;
        console.log('✅ ldManager imported successfully');
        
        console.log('📦 Importing userDetection...');
        const userModule = await import('./userDetection.js');
        userDetection = userModule.userDetection;
        console.log('✅ userDetection imported successfully');
        
        console.log('🎯 All imports successful, making them global...');
        window.DinoRunApp = DinoRunApp;
        window.ldManager = ldManager;
        window.userDetection = userDetection;
        
        return true;
        
    } catch (importError) {
        console.error('❌ Critical import error:', importError);
        console.error('Import error name:', importError.name);
        console.error('Import error message:', importError.message);
        console.error('Import error stack:', importError.stack);
        return false;
    }
}

// Initialize and start the application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎮 Initializing Dino Run App with ES6 modules...');
    
    try {
        // First load all modules
        console.log('🔄 Loading ES6 modules...');
        const modulesLoaded = await loadModules();
        
        if (!modulesLoaded) {
            throw new Error('Failed to load ES6 modules');
        }
        
        // Verify ES6 imports loaded correctly
        console.log('📦 Checking ES6 module imports...');
        console.log('- DinoRunApp:', typeof DinoRunApp);
        console.log('- ldManager:', typeof ldManager);
        console.log('- userDetection:', typeof userDetection);
        
        // Check import maps support
        console.log('🗺️ Import maps support:', 'importmap' in HTMLScriptElement.prototype ? 'supported' : 'not supported');
        
        if (typeof DinoRunApp === 'undefined') {
            throw new Error('DinoRunApp class not imported properly');
        }
        // Check if required dependencies are loaded
        console.log('📋 Checking dependencies...');
        console.log('- window.ldManager:', !!window.ldManager);
        console.log('- window.userDetection:', !!window.userDetection);
        console.log('- DinoGame class:', typeof DinoGame);
        console.log('- Canvas element:', !!document.getElementById('gameCanvas'));
        
        // Create the app instance
        const app = new DinoRunApp();
        
        // Initialize app (LaunchDarkly initialization happens inside)
        try {
            await app.init();
            console.log('✅ App initialization completed successfully');
        } catch (initError) {
            console.warn('⚠️ App initialization had issues but continuing:', initError);
            // Continue anyway - the game can work with fallback values
        }
        
        // Make app globally available for debugging
        window.dinoApp = app;
        
        // Set app ready flag for UI
        window.appReady = true;
        
        console.log('✅ LaunchDarkly Dino Run initialized!');
        console.log('🎯 Features enabled:');
        console.log('  - Game Engine');
        console.log('  - Player Management');
        console.log('  - LaunchDarkly Integration (simplified implementation)');
        console.log('');
        console.log('🎮 Press SPACE to start the game!');
        
        // Add helpful console commands and debugging info
        console.log('💡 Debug commands available:');
        console.log('  - window.dinoApp - Access game instance');
        console.log('  - window.ldManager - Access LaunchDarkly manager');
        console.log('  - window.ldManager.test() - Test LaunchDarkly connection');
        console.log('  - window.ldManager.getStatus() - Get detailed status');
        console.log('  - window.ldManager.refresh() - Refresh flag values');
        
        // Immediate flag status check (with safe method calls)
        console.log('');
        console.log('🎯 CURRENT FLAG STATUS:');
        if (window.ldManager) {
            console.log('- window.ldManager type:', typeof window.ldManager);
            console.log('- window.ldManager constructor:', window.ldManager.constructor?.name);
            console.log('- Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.ldManager)));
            
            // Safe method calls with try-catch
            try {
                console.log('- Dino Color:', window.ldManager.getDinoColor?.() || 'method not available');
            } catch (e) { console.log('- Dino Color error:', e.message); }
            
            try {
                console.log('- Difficulty:', window.ldManager.getDifficulty?.() || 'method not available');
            } catch (e) { console.log('- Difficulty error:', e.message); }
            
            try {
                console.log('- Weather:', window.ldManager.getWeather?.() || 'method not available');
            } catch (e) { console.log('- Weather error:', e.message); }
            
            try {
                console.log('- LaunchDarkly Ready:', window.ldManager.isReady?.() || 'method not available');
            } catch (e) { console.log('- isReady error:', e.message); }
            
            try {
                console.log('- LaunchDarkly Initialized:', window.ldManager.isInitialized);
            } catch (e) { console.log('- isInitialized error:', e.message); }
        } else {
            console.error('❌ window.ldManager not available!');
        }
        
        // Mark app as ready
        window.appReady = true;
        
        // Add keyboard shortcuts for debugging
        document.addEventListener('keydown', (event) => {
            if (event.altKey) {
                switch (event.key.toLowerCase()) {
                    case 'r':
                        console.log('🔄 Refreshing LaunchDarkly flags...');
                        window.ldManager.refresh();
                        break;
                    case 'd':
                        console.log('📊 LaunchDarkly status:', window.ldManager.getStatus());
                        break;
                    case 't':
                        console.log('🧪 Testing LaunchDarkly...');
                        window.ldManager.test();
                        break;
                    case 'u':
                        console.log('👤 Current user context:', window.ldManager.getCurrentContext());
                        break;
                    case 's':
                        console.log('🔄 Testing streaming connection...');
                        window.ldManager.testStreaming();
                        break;
                    case 'c':
                        console.log('🔍 Checking connection count...');
                        window.debugDinoRun.checkConnections();
                        break;
                    case 'v':
                        console.log('🎥 Starting session replay...');
                        if (ldManager && ldManager.startSessionReplay()) {
                            console.log('✅ Session replay started');
                        }
                        break;
                    case 'x':
                        console.log('⏹️ Stopping session replay...');
                        if (ldManager && ldManager.stopSessionReplay()) {
                            console.log('✅ Session replay stopped');
                        }
                        break;
                    case 'z':
                        console.log('📹 Session replay status:');
                        if (ldManager) {
                            const status = ldManager.getSessionReplayStatus();
                            console.log(status);
                        }
                        break;
                }
            }
        });
        
        // Show LaunchDarkly status
        if (window.ldManager.isInitialized) {
            console.log('');
            console.log('✅ LAUNCHDARKLY INITIALIZED SUCCESSFULLY');
            console.log('🎯 Current flag values:', window.ldManager.flags);
            console.log('');
            console.log('💡 Try changing flags in your LaunchDarkly dashboard to see real-time updates!');
        } else {
            console.log('');
            console.log('⚠️ LAUNCHDARKLY NOT INITIALIZED');
            console.log('🔧 Common issues and solutions:');
            console.log('  1. Check client-side ID in config.js');
            console.log('  2. Verify flags exist in LaunchDarkly dashboard');
            console.log('  3. Ensure flags have "SDKs using Client-side ID" enabled');
            console.log('  4. Check network connectivity');
            console.log('');
            console.log('🧪 Run: window.ldManager.test() to diagnose issues');
            console.log('📊 Run: window.ldManager.getStatus() for detailed info');
            console.log('');
            console.log('🎮 Game will work with default values until LaunchDarkly is configured');
        }
        
    } catch (error) {
        console.error('❌ Failed to initialize Dino Run app:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Stack trace:', error.stack);
        
        // Detailed debugging information
        console.error('🔍 Debugging information:');
        console.error('- Error type:', typeof error);
        console.error('- Error constructor:', error.constructor.name);
        console.error('- Window location:', window.location.href);
        console.error('- User agent:', navigator.userAgent);
        
        // Check what's available in the scope
        console.error('📦 Module availability check:');
        try {
            console.error('- DinoRunApp type:', typeof DinoRunApp);
        } catch (e) {
            console.error('- DinoRunApp error:', e.message);
        }
        try {
            console.error('- ldManager type:', typeof ldManager);
        } catch (e) {
            console.error('- ldManager error:', e.message);
        }
        try {
            console.error('- userDetection type:', typeof userDetection);
        } catch (e) {
            console.error('- userDetection error:', e.message);
        }
        
        // Check if this is an ES6 module loading issue
        if (error.message.includes('import') || error.message.includes('module') || error.name === 'SyntaxError') {
            console.error('📦 ES6 module loading failed - this may be a browser compatibility issue');
            console.error('💡 Try refreshing the page or check if your browser supports ES6 modules');
            console.error('🌐 ES6 modules require a modern browser (Chrome 61+, Firefox 60+, Safari 10.1+)');
        }
        
        // Set appReady to true anyway so user can try to play with fallback functionality
        window.appReady = true;
        console.warn('⚠️ Setting appReady=true despite errors - some game features may work with fallback values');
        
        // Show user-friendly error message with more details
        const errorOverlay = document.createElement('div');
        errorOverlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); color: white; padding: 20px; z-index: 9999; display: flex; align-items: center; justify-content: center; text-align: center; font-family: monospace;';
        
        let errorDetails = 'Unknown error';
        if (error.message.includes('import') || error.message.includes('module')) {
            errorDetails = 'ES6 Module Import Error';
        } else if (error.message.includes('LaunchDarkly')) {
            errorDetails = 'LaunchDarkly SDK Error';
        } else if (error.name === 'SyntaxError') {
            errorDetails = 'JavaScript Syntax Error';
        } else if (error.name === 'TypeError') {
            errorDetails = 'Type Error (possibly missing imports)';
        }
        
        errorOverlay.innerHTML = `
            <div>
                <h2>🎮 Dino Run - Initialization Failed</h2>
                <p><strong>Error Type:</strong> ${errorDetails}</p>
                <p><strong>Error Message:</strong> ${error.message}</p>
                <p>Please check the browser console (F12) for detailed technical information.</p>
                <div style="margin: 20px 0;">
                    <button onclick="location.reload()" style="padding: 10px 20px; font-size: 16px; margin: 5px;">🔄 Refresh Page</button>
                    <button onclick="console.log('🔍 Error Details:', {name: '${error.name}', message: '${error.message}', userAgent: '${navigator.userAgent}', location: '${window.location.href}'})" style="padding: 10px 20px; font-size: 16px; margin: 5px;">📋 Log Debug Info</button>
                </div>
                <p style="font-size: 12px; color: #ccc; margin-top: 20px;">
                    Browser: ${navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : navigator.userAgent.includes('Safari') ? 'Safari' : 'Other'}<br>
                    Import Maps Support: ${'importmap' in HTMLScriptElement.prototype ? '✅ Supported' : '❌ Not Supported'}
                </p>
            </div>
        `;
        document.body.appendChild(errorOverlay);
    }
});

// Global keyboard event listeners for debugging (fallback if app fails to load)
document.addEventListener('keydown', (event) => {
    if (event.altKey && event.key.toLowerCase() === 'h') {
        console.log('🔧 === DINO RUN DEBUG HELP ===');
        console.log('Alt+R - Refresh LaunchDarkly flags');
        console.log('Alt+D - Show LaunchDarkly status');
        console.log('Alt+T - Test LaunchDarkly connection');
        console.log('Alt+U - Show current user context');
        console.log('Alt+S - Test streaming connection');
        console.log('Alt+C - Check connection count');
        console.log('Alt+V - Start session replay');
        console.log('Alt+X - Stop session replay');
        console.log('Alt+Z - Show session replay status');
        console.log('Alt+H - Show this help');
        console.log('===============================');
    }
});

// Expose debugging utilities globally
window.debugDinoRun = {
    refreshFlags: () => window.ldManager?.refresh(),
    getStatus: () => window.ldManager?.getStatus(),
    testConnection: () => window.ldManager?.test(),
    getCurrentContext: () => window.ldManager?.getCurrentContext(),
    testStreaming: () => window.ldManager?.testStreaming(),
    quickTest: () => {
        console.log('🔍 === QUICK LAUNCHDARKLY TEST ===');
        console.log('ldManager exists:', !!window.ldManager);
        console.log('ldManager.isInitialized:', window.ldManager?.isInitialized);
        console.log('ldManager.isReady():', window.ldManager?.isReady());
        console.log('Client exists:', !!window.ldManager?.client);
        console.log('Current flags:', {
            dinoColor: window.ldManager?.getDinoColor(),
            difficulty: window.ldManager?.getDifficulty(), 
            weather: window.ldManager?.getWeather()
        });
        console.log('Full status:', window.ldManager?.getStatus());
        console.log('===========================');
    },
    testNameChange: async (newName) => {
        console.log('🧪 === TESTING NAME CHANGE ===');
        console.log('New name:', newName);
        
        try {
            // Test userDetection update
            if (window.userDetection) {
                const userContext = await window.userDetection.generateUserContext(newName);
                console.log('Generated context:', userContext);
                window.userDetection.savePlayerData(userContext);
                console.log('✅ UserDetection updated');
            }
            
            // Test LaunchDarkly update
            if (window.ldManager) {
                await window.ldManager.identifyUser(newName);
                console.log('✅ LaunchDarkly updated');
                
                setTimeout(() => {
                    const context = window.ldManager.getCurrentContext();
                    console.log('Current LD context:', context);
                }, 200);
            }
            
            // Test UI update
            setTimeout(() => {
                if (typeof updatePlayerDisplay === 'function') {
                    updatePlayerDisplay();
                    console.log('✅ UI updated');
                }
            }, 300);
            
        } catch (error) {
            console.error('❌ Name change test failed:', error);
        }
        console.log('===========================');
    },
    checkConnections: () => {
        const status = window.ldManager?.getStatus();
        if (status?.connectionMonitoring) {
            console.log('🔍 === CONNECTION MONITORING ===');
            console.log('Total connections made:', status.connectionMonitoring.connectionCount);
            console.log('Last connection time:', status.connectionMonitoring.lastConnectionTime);
            console.log('Initialization in progress:', status.connectionMonitoring.initializationInProgress);
            console.log('Current state: isInitialized =', status.isInitialized);
            console.log('Client ready:', status.clientReady);
            
            if (status.connectionMonitoring.connectionCount > 1) {
                console.warn('⚠️ MULTIPLE CONNECTIONS DETECTED!');
                console.warn('💡 This may cause performance issues and unexpected behavior');
            } else {
                console.log('✅ Connection count looks healthy');
            }
        }
        return status?.connectionMonitoring;
    },
    shutdown: () => window.ldManager?.shutdown(),
    showHelp: () => {
        console.log('🔧 === DINO RUN DEBUG UTILITIES ===');
        console.log('window.debugDinoRun.quickTest() - Quick LaunchDarkly diagnostic');
        console.log('window.debugDinoRun.testNameChange("NewName") - Test name change process');
        console.log('window.debugDinoRun.refreshFlags() - Refresh flags');
        console.log('window.debugDinoRun.getStatus() - Get LaunchDarkly status');
        console.log('window.debugDinoRun.testConnection() - Test connection');
        console.log('window.debugDinoRun.getCurrentContext() - Get current user context');
        console.log('window.debugDinoRun.testStreaming() - Test streaming connection');
        console.log('window.debugDinoRun.checkConnections() - Monitor connection count');
        console.log('window.debugDinoRun.shutdown() - Shutdown LaunchDarkly client');
        console.log('window.debugDinoRun.showHelp() - Show this help');
        console.log('====================================');
    }
};

console.log('💡 Type: window.debugDinoRun.showHelp() for debugging utilities'); 