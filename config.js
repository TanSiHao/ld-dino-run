// Configuration file for LaunchDarkly Dino Run
// Update these values based on your .env file

window.DinoRunConfig = {
    // LaunchDarkly Configuration
    // Replace with your actual client-side ID from .env file
    launchDarkly: {
        clientSideId: 'YOUR_CLIENT_SIDE_ID_HERE', // Copy from LAUNCHDARKLY_CLIENT_SIDE_ID in .env
        projectName: 'sihaotan-dino-run', // Copy from LAUNCHDARKLY_PROJECT_NAME in .env
        
        // Feature flag keys - should match your Terraform configuration
        flags: {
            dinoColor: 'dino-color',      // Copy from LAUNCHDARKLY_DINO_COLOR_FLAG in .env
            difficulty: 'game-difficulty', // Copy from LAUNCHDARKLY_DIFFICULTY_FLAG in .env  
            weather: 'weather-background'  // Copy from LAUNCHDARKLY_WEATHER_FLAG in .env
        }
    },
    
    // Default fallback values when LaunchDarkly is not available
    defaults: {
        dinoColor: 'green',
        difficulty: 'medium',
        weather: 'spring'
    },
    
    // Game configuration
    game: {
        canvasWidth: 800,
        canvasHeight: 200,
        serverPort: 3000
    }
};

// Validation helper
window.DinoRunConfig.validate = function() {
    const config = this.launchDarkly;
    
    if (config.clientSideId === 'YOUR_CLIENT_SIDE_ID_HERE') {
        console.warn('⚠️  LaunchDarkly client ID not configured. Update config.js with your client-side ID from .env file.');
        console.warn('📖 See README.md for setup instructions.');
        return false;
    }
    
    return true;
};

// Helper to get environment-specific instructions
window.DinoRunConfig.getSetupInstructions = function() {
    return `
🔧 Setup Instructions:

1. Copy environment.example to .env:
   cp environment.example .env

2. Update .env with your LaunchDarkly credentials:
   - LAUNCHDARKLY_CLIENT_SIDE_ID (from LaunchDarkly Dashboard)
   - LAUNCHDARKLY_ACCESS_TOKEN (for Terraform)

3. Update config.js with values from .env:
   - Copy LAUNCHDARKLY_CLIENT_SIDE_ID to launchDarkly.clientSideId
   - Update projectName if different

4. Optionally use Terraform to create flags:
   cd terraform && terraform init && terraform apply

5. Start the game:
   npm start
`;
}; 