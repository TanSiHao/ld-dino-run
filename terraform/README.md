# LaunchDarkly Terraform Configuration

This directory contains Terraform configuration to automatically provision LaunchDarkly resources for the Dino Run game.

## What This Creates

- **LaunchDarkly Project**: "Sihao Tan - Dino Run" (customizable)
- **Three Environments**: Development, Staging, Production
- **Three Feature Flags**:
  - `dino-color` - Controls dinosaur color (6 variations)
  - `game-difficulty` - Controls game difficulty (3 levels)
  - `weather-background` - Controls seasonal backgrounds (4 seasons)

## Prerequisites

1. **Terraform installed** (>= 1.0)
   ```bash
   # macOS
   brew install terraform
   
   # Or download from: https://www.terraform.io/downloads
   ```

2. **LaunchDarkly Account**
   - Sign up at [LaunchDarkly.com](https://launchdarkly.com)
   - Get your Access Token from Dashboard → Account Settings → Authorization

## Quick Setup

1. **Configure Variables**:
   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   ```
   
   Edit `terraform.tfvars` and add your LaunchDarkly access token:
   ```hcl
   launchdarkly_access_token = "your-actual-access-token"
   ```

2. **Initialize and Apply**:
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```

3. **Get Client-side ID**:
   After successful apply, Terraform will output the dashboard URL. Go there and copy the Client-side ID for the Development environment.

4. **Update Game Configuration**:
   - Copy the Client-side ID to your `.env` file
   - Update `config.js` with the Client-side ID

## Customization

### Change Project Name

Edit `terraform.tfvars`:
```hcl
project_key  = "your-project-key"
project_name = "Your Project Name"
```

### Change Flag Keys

Edit `terraform.tfvars`:
```hcl
dino_color_flag_key = "custom-dino-color"
difficulty_flag_key = "custom-difficulty" 
weather_flag_key    = "custom-weather"
```

**Important**: If you change flag keys, also update them in `../config.js`:
```javascript
flags: {
    dinoColor: 'custom-dino-color',
    difficulty: 'custom-difficulty',
    weather: 'custom-weather'
}
```

## File Structure

```
terraform/
├── main.tf                    # Main Terraform configuration
├── variables.tf               # Variable definitions
├── outputs.tf                 # Output definitions
├── terraform.tfvars.example   # Example variables file
└── README.md                  # This file
```

## Commands

### Initialize
```bash
terraform init
```

### Plan (preview changes)
```bash
terraform plan
```

### Apply (create resources)
```bash
terraform apply
```

### Destroy (remove all resources)
```bash
terraform destroy
```

### Show current state
```bash
terraform show
```

## Outputs

After successful apply, you'll see:
- Project information
- Feature flag details
- LaunchDarkly dashboard URL
- Instructions for next steps

## Troubleshooting

### Access Token Issues
- Ensure your access token has the correct permissions
- Token should have at least `writer` role
- Check token hasn't expired

### Project Already Exists
If you get an error that the project already exists, either:
1. Change the `project_key` in `terraform.tfvars`
2. Import the existing project:
   ```bash
   terraform import launchdarkly_project.dino_run existing-project-key
   ```

### Flag Already Exists
Similar to projects, you can import existing flags:
```bash
terraform import launchdarkly_feature_flag.dino_color project-key/flag-key
```

## Security Notes

- Keep `terraform.tfvars` secure (contains access token)
- Never commit `terraform.tfvars` to version control
- Use environment variables in CI/CD: `TF_VAR_launchdarkly_access_token`
- Consider using Terraform Cloud or similar for production

## Next Steps

After successful Terraform apply:

1. Copy the Client-side ID from LaunchDarkly Dashboard
2. Update your `.env` file
3. Update `config.js` 
4. Test the game: `npm start`
5. Experiment with flag values in LaunchDarkly Dashboard! 