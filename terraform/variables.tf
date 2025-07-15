# Variables for LaunchDarkly Dino Run Terraform Configuration

variable "launchdarkly_access_token" {
  description = "LaunchDarkly access token for API authentication"
  type        = string
  sensitive   = true
}

variable "project_key" {
  description = "LaunchDarkly project key (lowercase, no spaces)"
  type        = string
  default     = "sihaotan-dino-run"
}

variable "project_name" {
  description = "LaunchDarkly project display name"
  type        = string
  default     = "Sihao Tan - Dino Run"
}

variable "dino_color_flag_key" {
  description = "Key for the dino color feature flag"
  type        = string
  default     = "dino-color"
}

variable "difficulty_flag_key" {
  description = "Key for the game difficulty feature flag"
  type        = string
  default     = "game-difficulty"
}

variable "weather_flag_key" {
  description = "Key for the weather background feature flag"
  type        = string
  default     = "weather-background"
} 