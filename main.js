// Main Entry Point for LaunchDarkly Dino Run (Simple Script Approach)
// All dependencies loaded via script tags for maximum browser compatibility

console.log('🚀 Loading LaunchDarkly Dino Run...');

console.log('✅ Core modules loaded successfully');
console.log('📦 Loaded modules:');
console.log('- DinoRunConfig:', !!window.DinoRunConfig);
console.log('- UserDetection:', !!window.userDetection);
console.log('- LaunchDarklyManager:', !!window.ldManager);
console.log('- DinoGame:', typeof DinoGame);
console.log('- DinoRunApp:', typeof DinoRunApp);

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
        
        const app = new DinoRunApp();
        
        // Initialize app with error handling for LaunchDarkly
        try {
            await app.init();
            console.log('✅ App initialization completed successfully');
        } catch (initError) {
            console.warn('⚠️ App initialization had issues but continuing:', initError);
            // Continue anyway - the game can work without LaunchDarkly
        }
        
        // Make app globally available for debugging
        window.dinoApp = app;
        
        console.log('✅ LaunchDarkly Dino Run initialized!');
        console.log('🎯 Features enabled:');
        console.log('  - Game Engine');
        console.log('  - Player Management');
        console.log('  - LaunchDarkly Integration (if configured)');
        console.log('');
        console.log('🎮 Press SPACE to start the game!');
        
        // Add some helpful console commands
        console.log('💡 Debug commands available:');
        console.log('  - window.dinoApp - Access game instance');
        console.log('  - window.ldManager - Access LaunchDarkly manager');
        console.log('  - window.ldManager.cleanReset() - Reset LaunchDarkly');
        
    } catch (error) {
        console.error('❌ Critical failure in app initialization:', error);
        
        // Try to create a minimal working game
        try {
            console.log('🔄 Creating minimal game instance...');
            const game = new DinoGame('gameCanvas');
            window.dinoApp = { game: game, isInitialized: true };
            console.log('✅ Minimal game instance created');
        } catch (minimalError) {
            console.error('❌ Even minimal game creation failed:', minimalError);
        }
    }
    
    // ALWAYS mark as ready so the game can start
    window.appReady = true;
    console.log('🎮 App ready! You can now start the game.');
});

// Add error handling for module loading issues
window.addEventListener('error', (event) => {
    if (event.message.includes('Failed to resolve module specifier')) {
        console.error('❌ Module loading error:', event.message);
        console.log('💡 This might be a browser compatibility issue with ES6 modules');
        
        // Mark as ready to allow basic functionality
        window.appReady = true;
    }
});

console.log('📋 Main.js setup complete - waiting for DOM ready...'); 