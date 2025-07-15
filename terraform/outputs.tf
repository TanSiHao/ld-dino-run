# Outputs for LaunchDarkly Dino Run Terraform Configuration

output "project_key" {
  description = "The LaunchDarkly project key"
  value       = launchdarkly_project.dino_run.key
}

output "project_name" {
  description = "The LaunchDarkly project name"
  value       = launchdarkly_project.dino_run.name
}

output "development_environment_key" {
  description = "The development environment key"
  value       = "development"
}

output "feature_flags" {
  description = "Created feature flag information"
  value = {
    dino_color = {
      key         = launchdarkly_feature_flag.dino_color.key
      name        = launchdarkly_feature_flag.dino_color.name
      variations  = [for v in launchdarkly_feature_flag.dino_color.variations : v.value]
    }
    game_difficulty = {
      key         = launchdarkly_feature_flag.game_difficulty.key
      name        = launchdarkly_feature_flag.game_difficulty.name
      variations  = [for v in launchdarkly_feature_flag.game_difficulty.variations : v.value]
    }
    weather_background = {
      key         = launchdarkly_feature_flag.weather_background.key
      name        = launchdarkly_feature_flag.weather_background.name
      variations  = [for v in launchdarkly_feature_flag.weather_background.variations : v.value]
    }
  }
}

output "launchdarkly_dashboard_url" {
  description = "URL to access the LaunchDarkly dashboard for this project"
  value       = "https://app.launchdarkly.com/${launchdarkly_project.dino_run.key}/production/features"
}

output "client_side_id_instructions" {
  description = "Instructions for getting the client-side ID"
  value       = "Go to LaunchDarkly Dashboard -> Account Settings -> Projects -> ${launchdarkly_project.dino_run.name} -> Environments -> Development -> Client-side ID"
}

output "setup_summary" {
  description = "Summary of next steps"
  value = <<-EOT
    🎉 LaunchDarkly resources created successfully!
    
    Next steps:
    1. Go to LaunchDarkly Dashboard: https://app.launchdarkly.com/${launchdarkly_project.dino_run.key}/development/features
    2. Copy the Client-side ID from the Development environment
    3. Update your .env file with: LAUNCHDARKLY_CLIENT_SIDE_ID=<your-client-side-id>
    4. Update config.js with the client-side ID from .env
    5. Run: npm start
    
    Feature Flags Created:
    - ${launchdarkly_feature_flag.dino_color.key} (Dino Color)
    - ${launchdarkly_feature_flag.game_difficulty.key} (Game Difficulty)  
    - ${launchdarkly_feature_flag.weather_background.key} (Weather Background)
  EOT
} 