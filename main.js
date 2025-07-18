// Main application initialization script
// Initializes the Dino Run app when DOM is ready

// Initialize and start the application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎮 Initializing Dino Run App...');
    
    try {
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
        
        // Show user-friendly error message
        const errorOverlay = document.createElement('div');
        errorOverlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); color: white; padding: 20px; z-index: 9999; display: flex; align-items: center; justify-content: center; text-align: center;';
        errorOverlay.innerHTML = `
            <div>
                <h2>🎮 Dino Run - Initialization Failed</h2>
                <p>Something went wrong during app startup.</p>
                <p>Please check the console for details and try refreshing the page.</p>
                <button onclick="location.reload()" style="padding: 10px 20px; font-size: 16px; margin-top: 20px;">🔄 Refresh Page</button>
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