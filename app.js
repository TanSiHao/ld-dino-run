// Main Application Entry Point
class DinoRunApp {
    constructor() {
        this.game = null;
        this.isInitialized = false;
    }
    
    async init() {
        try {
            // Initialize LaunchDarkly first
            await window.ldManager.initialize();
            
            // Create game instance
            this.game = new DinoGame('gameCanvas');
            
            // Connect feature flags to game
            this.connectFeatureFlags();
            
            // Set up flag change listeners
            window.ldManager.onFlagsUpdated(() => {
                this.onFlagsUpdated();
            });
            
            this.isInitialized = true;
            console.log('Dino Run App initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            // Initialize game with default settings even if LaunchDarkly fails
            this.game = new DinoGame('gameCanvas');
            this.isInitialized = true;
        }
    }
    
    connectFeatureFlags() {
        if (!window.ldManager.isInitialized) return;
        
        // Apply initial flag values
        this.applyDinoColorFlag();
        this.applyDifficultyFlag();
        this.applyWeatherFlag();
    }
    
    onFlagsUpdated() {
        console.log('Feature flags updated');
        this.applyDinoColorFlag();
        this.applyDifficultyFlag();
        this.applyWeatherFlag();
    }
    
    applyDinoColorFlag() {
        // The dino color is automatically applied in the Player.update() method
        // through the ldManager.getDinoColorHex() call
        console.log('Dino color flag applied:', window.ldManager.getDinoColor());
    }
    
    applyDifficultyFlag() {
        if (!this.game) return;
        
        const difficultySettings = window.ldManager.getDifficultySettings();
        this.game.updateSettings(difficultySettings);
        
        console.log('Difficulty flag applied:', window.ldManager.getDifficulty(), difficultySettings);
    }
    
    applyWeatherFlag() {
        if (!this.game) return;
        
        const weather = window.ldManager.getWeather();
        const canvas = this.game.canvas;
        
        // Apply weather-specific styling to the canvas or game area
        this.applyWeatherEffects(weather);
        
        console.log('Weather flag applied:', weather);
    }
    
    applyWeatherEffects(weather) {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        // Remove existing weather classes
        canvas.classList.remove('weather-spring', 'weather-summer', 'weather-autumn', 'weather-winter');
        
        // Add new weather class
        canvas.classList.add(`weather-${weather}`);
        
        // You could add more weather effects here like:
        // - Particle effects (rain, snow)
        // - Different cloud colors
        // - Ground color changes
        this.addWeatherParticles(weather);
    }
    
    addWeatherParticles(weather) {
        // This is a placeholder for more advanced weather effects
        // You could implement rain drops, snow flakes, falling leaves, etc.
        switch (weather) {
            case 'winter':
                // Could add snowflakes
                break;
            case 'autumn':
                // Could add falling leaves
                break;
            case 'spring':
                // Could add flower petals
                break;
            case 'summer':
                // Could add heat shimmer effect
                break;
        }
    }
    
    // Method to manually cycle through flag values for testing
    cycleDinoColor() {
        const colors = ['green', 'blue', 'red', 'purple', 'orange', 'pink'];
        const currentColor = window.ldManager.getDinoColor();
        const currentIndex = colors.indexOf(currentColor);
        const nextIndex = (currentIndex + 1) % colors.length;
        
        // This would normally be done through LaunchDarkly dashboard
        console.log(`Would change dino color from ${currentColor} to ${colors[nextIndex]}`);
    }
    
    cycleDifficulty() {
        const difficulties = ['easy', 'medium', 'hard'];
        const currentDifficulty = window.ldManager.getDifficulty();
        const currentIndex = difficulties.indexOf(currentDifficulty);
        const nextIndex = (currentIndex + 1) % difficulties.length;
        
        console.log(`Would change difficulty from ${currentDifficulty} to ${difficulties[nextIndex]}`);
    }
    
    cycleWeather() {
        const weathers = ['spring', 'summer', 'autumn', 'winter'];
        const currentWeather = window.ldManager.getWeather();
        const currentIndex = weathers.indexOf(currentWeather);
        const nextIndex = (currentIndex + 1) % weathers.length;
        
        console.log(`Would change weather from ${currentWeather} to ${weathers[nextIndex]}`);
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing LaunchDarkly Dino Run...');
    
    const app = new DinoRunApp();
    await app.init();
    
    // Make app globally available for debugging
    window.dinoApp = app;
    
    // Add some helpful console messages
    console.log('🦕 Welcome to LaunchDarkly Dino Run!');
    console.log('Press SPACE to start the game');
    console.log('Feature flags are controlling:');
    console.log('- Dino color');
    console.log('- Game difficulty');
    console.log('- Weather background');
    console.log('');
    console.log('To test the app without LaunchDarkly setup:');
    console.log('1. The game will use default values');
    console.log('2. Update launchDarklyConfig.js with your client-side ID');
    console.log('3. Create the feature flags in your LaunchDarkly dashboard');
});

// Add some keyboard shortcuts for development/testing
document.addEventListener('keydown', (e) => {
    if (e.altKey) {
        switch (e.key) {
            case '1':
                e.preventDefault();
                window.dinoApp?.cycleDinoColor();
                break;
            case '2':
                e.preventDefault();
                window.dinoApp?.cycleDifficulty();
                break;
            case '3':
                e.preventDefault();
                window.dinoApp?.cycleWeather();
                break;
        }
    }
}); 