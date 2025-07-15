# Contributing to LaunchDarkly Dino Run

Thanks for your interest in contributing to this project! 🦕

## How to Contribute

### 🐛 Bug Reports
- Check existing issues first
- Provide clear steps to reproduce
- Include browser/OS information
- Mention which feature flags were active

### 💡 Feature Requests
- Describe the feature and its use case
- Consider how it could work with LaunchDarkly feature flags
- Provide mockups or examples if helpful

### 🔧 Code Contributions

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Set up the development environment**:
   ```bash
   npm install
   cp environment.example .env
   # Edit .env with your LaunchDarkly credentials
   ```
4. **Make your changes**
5. **Test your changes**:
   ```bash
   npm start
   # Verify the game works with and without LaunchDarkly
   ```
6. **Commit with descriptive messages**
7. **Push and create a pull request**

### 🎨 Game Enhancement Ideas

- **New Dinosaur Animations**: Ducking, different running styles
- **Additional Obstacles**: Flying pterodactyls, moving platforms
- **Power-ups**: Speed boost, invincibility, double jump
- **Sound Effects**: Jump sounds, collision effects, background music
- **New Feature Flags**: Game modes, power-up availability, sound toggle
- **Weather Effects**: Rain particles, snow, wind effects

### 🏗️ Infrastructure Improvements

- **Terraform Enhancements**: Multiple environments, advanced targeting
- **CI/CD Pipeline**: Automated testing, deployment
- **Docker Support**: Containerized development environment
- **Performance**: Optimize game rendering, reduce bundle size

### 📝 Documentation

- Improve setup instructions
- Add video demonstrations
- Create LaunchDarkly best practices guide
- Translate README to other languages

## Development Guidelines

### 🎯 Feature Flag Integration
- All new features should be controllable via LaunchDarkly flags when possible
- Use meaningful flag names and descriptions
- Update Terraform configuration for new flags
- Test both enabled and disabled states

### 💻 Code Style
- Use meaningful variable names
- Comment complex game logic
- Keep functions focused and small
- Follow existing code patterns

### 🧪 Testing
- Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- Verify mobile responsiveness
- Test with LaunchDarkly enabled and disabled
- Ensure game performance remains smooth

## Getting Help

- Create an issue for questions
- Check the README.md for setup instructions
- Review terraform/README.md for infrastructure help

## Recognition

Contributors will be acknowledged in the README.md file. Thank you for helping make this project better! 🙏 