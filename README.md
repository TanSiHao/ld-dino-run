# 🦕 LaunchDarkly Dino Run

A browser-based Dino Run game (similar to Chrome's offline game) with LaunchDarkly feature flags integration. Control game features dynamically without code deployments!

## Features

- **Classic Dino Run Gameplay**: Jump over obstacles, avoid collisions, and score points
- **LaunchDarkly Integration**: Three feature flags to control game behavior:
  - 🎨 **Dino Color**: Change the dinosaur's color (green, blue, red, purple, orange, pink)
  - 🎯 **Difficulty Levels**: Three difficulty settings (easy, medium, hard)
  - 🌤️ **Weather Backgrounds**: Four seasonal backgrounds (spring, summer, autumn, winter)
- **Responsive Design**: Works on desktop and mobile devices
- **Local Storage**: Saves high scores locally

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Application

```bash
npm start
```

This will start a local development server at `http://localhost:3000` and automatically open the game in your browser.

### 3. Play the Game

- Press **SPACE** to start the game and jump
- Avoid the brown obstacles
- Try to achieve the highest score possible!

## LaunchDarkly Setup

### Option 1: Automated Setup with Terraform (Recommended)

The fastest way to set up LaunchDarkly is using the included Terraform configuration:

1. **Install Terraform** (if not already installed):
   ```bash
   # macOS
   brew install terraform
   ```

2. **Set up LaunchDarkly credentials**:
   ```bash
   # Copy environment template
   cp environment.example .env
   
   # Edit .env and add your LaunchDarkly access token
   # Get it from: LaunchDarkly Dashboard → Account Settings → Authorization
   ```

3. **Configure and run Terraform**:
   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   
   # Edit terraform.tfvars and add your access token
   # Then run:
   terraform init
   terraform plan   # Review what will be created
   terraform apply  # Create the resources (type 'yes' when prompted)
   ```

4. **Get your Client-side ID**:
   - After Terraform completes, go to the LaunchDarkly dashboard URL shown in the output
   - Copy the Client-side ID from the Development environment
   - Add it to your `.env` file: `LAUNCHDARKLY_CLIENT_SIDE_ID=your-client-side-id`

5. **Update game configuration**:
   ```bash
   # Edit config.js and replace YOUR_CLIENT_SIDE_ID_HERE with your actual client-side ID
   ```

### Option 2: Manual Setup

If you prefer to set up LaunchDarkly manually:

1. **Create LaunchDarkly Account**: Sign up at [LaunchDarkly](https://launchdarkly.com)

2. **Create Environment Configuration**:
   ```bash
   cp environment.example .env
   # Edit .env and add your client-side ID
   ```

3. **Update Application Configuration**:
   - Edit `config.js`
   - Replace `YOUR_CLIENT_SIDE_ID_HERE` with your actual client-side ID from `.env`
   - Update project name if desired

4. **Create Feature Flags** in your LaunchDarkly dashboard:

   #### Flag 1: Dino Color (`dino-color`)
   - **Type**: String
   - **Default Value**: `green`
   - **Possible Values**: `green`, `blue`, `red`, `purple`, `orange`, `pink`

   #### Flag 2: Game Difficulty (`game-difficulty`)
   - **Type**: String  
   - **Default Value**: `medium`
   - **Possible Values**: 
     - `easy` - Slower obstacles, more time to react
     - `medium` - Balanced gameplay
     - `hard` - Faster obstacles, higher challenge

   #### Flag 3: Weather Background (`weather-background`)
   - **Type**: String
   - **Default Value**: `spring`
   - **Possible Values**: 
     - `spring` - Light blue sky
     - `summer` - Bright yellow/blue sky
     - `autumn` - Orange/brown tones
     - `winter` - Light blue/white tones

### Customizing Project Settings

To use a different project name or flag keys:

1. **For Terraform setup**: Edit `terraform/terraform.tfvars`
2. **For manual setup**: Edit `config.js` to match your LaunchDarkly configuration

## Project Structure

```
ld-dino-run/
├── index.html                    # Main HTML file
├── styles.css                    # Game styling
├── config.js                     # Configuration management
├── launchDarklyConfig.js         # LaunchDarkly setup and flag management
├── gameEngine.js                 # Core game mechanics
├── app.js                        # Main application logic
├── package.json                  # Dependencies and scripts
├── environment.example           # Example environment configuration
├── .gitignore                    # Git ignore rules
├── terraform/                    # Infrastructure as code
│   ├── main.tf                   # Terraform main configuration
│   ├── variables.tf              # Terraform variables
│   ├── outputs.tf                # Terraform outputs
│   ├── terraform.tfvars.example  # Example Terraform variables
│   └── README.md                 # Terraform documentation
└── README.md                     # This file
```

## How It Works

### Game Mechanics

- **Player**: The green dinosaur that jumps to avoid obstacles
- **Obstacles**: Brown rectangular blocks that move from right to left
- **Scoring**: Points increase automatically as the game progresses
- **Speed**: Game speed increases gradually based on score

### Feature Flag Integration

1. **Dino Color Flag**: Changes the visual appearance of the dinosaur in real-time
2. **Difficulty Flag**: Adjusts game parameters:
   - Obstacle speed
   - Obstacle generation frequency
   - Jump height
3. **Weather Flag**: Changes the background color and visual theme

### Real-time Updates

The game listens for LaunchDarkly flag changes and applies them immediately without requiring a page refresh. This demonstrates the power of feature flags for real-time configuration changes.

## Development

### Testing Feature Flags

If you haven't set up LaunchDarkly yet, the game will run with default values:
- Dino Color: Green
- Difficulty: Medium  
- Weather: Spring

### Environment Variables

The application uses environment variables for configuration:

```bash
# Copy the example file
cp environment.example .env

# Edit .env with your values:
LAUNCHDARKLY_CLIENT_SIDE_ID=your-client-side-id-here
LAUNCHDARKLY_PROJECT_NAME=your-project-name
LAUNCHDARKLY_ACCESS_TOKEN=your-access-token-here  # For Terraform only
```

**Important**: Never commit `.env` files to version control. They contain sensitive credentials.

### Browser Console Commands

Open the browser console and try these commands for testing:

```javascript
// Check current flag values
window.ldManager.getDinoColor()
window.ldManager.getDifficulty()
window.ldManager.getWeather()

// Access game instance
window.dinoApp.game

// Validate configuration
window.DinoRunConfig.validate()

// Get setup instructions
console.log(window.DinoRunConfig.getSetupInstructions())
```

### Keyboard Shortcuts (Development)

- **Alt + 1**: Log dino color cycling (for testing)
- **Alt + 2**: Log difficulty cycling (for testing)  
- **Alt + 3**: Log weather cycling (for testing)

## Customization

### Adding New Colors

1. Add new color to `getDinoColorHex()` method in `launchDarklyConfig.js`
2. Update the LaunchDarkly flag to include the new color option

### Adding New Difficulty Levels

1. Update `getDifficultySettings()` method in `launchDarklyConfig.js`
2. Add the new difficulty to your LaunchDarkly flag

### Adding New Weather Effects

1. Update `getWeatherBackground()` method in `launchDarklyConfig.js`
2. Add corresponding CSS classes in `styles.css`
3. Update the LaunchDarkly flag with new weather options

## Security

### Environment Variables
- **Never commit `.env` files** to version control
- Store sensitive data (access tokens, client IDs) in `.env` only
- The `.gitignore` file excludes `.env` files automatically
- Use `environment.example` as a template for others

### Production Deployment
- Use environment-specific configurations
- Consider using CI/CD environment variables instead of `.env` files
- Rotate access tokens regularly
- Use LaunchDarkly's environment-specific client-side IDs

## Troubleshooting

### Game Not Loading
- Check browser console for JavaScript errors
- Ensure all files are in the correct locations
- Verify the local server is running on port 3000
- Check if `config.js` is loaded before other game scripts

### Feature Flags Not Working
- Run `window.DinoRunConfig.validate()` in browser console to check configuration
- Verify your LaunchDarkly client-side ID is correct in `config.js`
- Check that flag keys match between `config.js` and LaunchDarkly dashboard
- Ensure flags are turned ON in LaunchDarkly
- Check browser console for LaunchDarkly connection errors
- Verify you're using the client-side ID (not server-side SDK key)

### Terraform Issues
- Ensure you have the correct LaunchDarkly access token
- Check that your access token has sufficient permissions (writer role)
- If project already exists, consider importing it or using a different project key
- See `terraform/README.md` for detailed Terraform troubleshooting

### Environment Variables
- Ensure `.env` file exists and has correct format
- Check that `config.js` is updated with values from `.env`
- Verify no typos in environment variable names

### Performance Issues
- The game uses `requestAnimationFrame` for smooth animation
- If experiencing lag, check if other browser tabs are consuming resources

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License - feel free to modify and distribute as needed.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with LaunchDarkly
5. Submit a pull request

---

**Have fun playing and experimenting with feature flags! 🦕🚀** 