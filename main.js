// Main Entry Point for LaunchDarkly Dino Run (ES6 Modules)
// This file imports all dependencies and initializes the application

// LaunchDarkly dependencies will be loaded via script tags
// The CDN scripts make these available globally as window.LDClient, window.LDObserve, window.LDRecord

// Local Module Imports
import { DinoRunConfig } from './config.js';
import { UserDetection } from './userDetection.js';
import { LaunchDarklyManager } from './launchDarklyConfig.js';
import { DinoGame } from './gameEngine.js';
import { DinoRunApp } from './app.js';

console.log('🚀 Loading LaunchDarkly Dino Run with ES6 Modules...');

// Wait for LaunchDarkly scripts to load, then make them available globally
function waitForLaunchDarkly() {
    return new Promise((resolve) => {
        const checkForLD = () => {
            if (window.LDClient) {
                console.log('✅ LaunchDarkly SDK loaded');
                console.log('🔍 Checking observability plugins...');
                console.log('- window.LDObserve:', typeof window.LDObserve);
                console.log('- window.LDRecord:', typeof window.LDRecord);
                resolve();
            } else {
                console.log('⏳ Waiting for LaunchDarkly SDK...');
                setTimeout(checkForLD, 100);
            }
        };
        checkForLD();
    });
}

// Debug: Log what was imported
console.log('📦 Imported ES6 modules:');
console.log('  - DinoRunConfig:', typeof DinoRunConfig);
console.log('  - UserDetection:', typeof UserDetection);
console.log('  - LaunchDarklyManager:', typeof LaunchDarklyManager);
console.log('  - DinoGame:', typeof DinoGame);
console.log('  - DinoRunApp:', typeof DinoRunApp);

// LaunchDarkly classes are loaded via CDN and available globally
// No need to reassign them as they're already on window

// Make configuration globally available
window.DinoRunConfig = DinoRunConfig;

// Initialize User Detection
console.log('👤 Initializing User Detection...');
window.userDetection = new UserDetection();
console.log('✅ UserDetection initialized:', !!window.userDetection);

// Initialize LaunchDarkly Manager
console.log('🔧 Initializing LaunchDarkly Manager...');
window.ldManager = new LaunchDarklyManager();
console.log('✅ LaunchDarklyManager initialized:', !!window.ldManager);

// Initialize and start the application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🎮 Initializing Dino Run App...');
        
        // Wait for LaunchDarkly SDK to load first
        await waitForLaunchDarkly();
        
        const app = new DinoRunApp();
        await app.init();
        
        // Make app globally available for debugging
        window.dinoApp = app;
        
        // Mark app as fully ready
        window.appReady = true;
        
        console.log('✅ LaunchDarkly Dino Run initialized successfully!');
        console.log('🎯 Features enabled:');
        console.log('  - ES6 Modules');
        console.log('  - LaunchDarkly Observability');
        console.log('  - Session Replay');
        console.log('  - Feature Flags');
        console.log('');
        console.log('🎮 Press SPACE to start the game!');
        
        // Add some helpful console commands
        console.log('💡 Debug commands available:');
        console.log('  - window.dinoApp - Access game instance');
        console.log('  - window.ldManager - Access LaunchDarkly manager');
        console.log('  - window.ldManager.debugObservability() - Debug observability status');
        
    } catch (error) {
        console.error('❌ Failed to initialize Dino Run App:', error);
        console.error('Stack trace:', error.stack);
        
        // Provide debugging information
        console.log('🔍 Debugging information:');
        console.log('  - window.LDClient:', typeof window.LDClient);
        console.log('  - window.LDObserve:', typeof window.LDObserve);
        console.log('  - window.LDRecord:', typeof window.LDRecord);
        console.log('  - window.DinoRunConfig:', typeof window.DinoRunConfig);
        console.log('  - window.userDetection:', typeof window.userDetection);
        console.log('  - window.ldManager:', typeof window.ldManager);
        
        // Try to initialize without LaunchDarkly for basic functionality
        console.log('🔄 Attempting basic initialization...');
        try {
            // Still wait for LaunchDarkly SDK even in fallback mode
            await waitForLaunchDarkly();
            
            const basicApp = new DinoRunApp();
            await basicApp.init(); // Make sure to initialize properly
            window.dinoApp = basicApp;
            window.appReady = true;
            console.log('✅ Basic app initialized - LaunchDarkly features may not be available');
        } catch (basicError) {
            console.error('❌ Even basic initialization failed:', basicError);
            console.error('Stack trace:', basicError.stack);
            
            // Last resort: create minimal game instance
            console.log('🔄 Creating minimal game instance as last resort...');
            try {
                await waitForLaunchDarkly(); // Even minimal needs LaunchDarkly for dependencies
                const game = new DinoGame('gameCanvas');
                window.dinoApp = { game: game, isInitialized: true };
                window.appReady = true;
                console.log('✅ Minimal game instance created successfully');
            } catch (minimalError) {
                console.error('❌ Failed to create even minimal game instance:', minimalError);
            }
        }
    }
});

// Export for potential external usage
export { DinoRunConfig, UserDetection, LaunchDarklyManager, DinoGame, DinoRunApp }; 