# LaunchDarkly Terraform Configuration for Dino Run Game

terraform {
  required_providers {
    launchdarkly = {
      source  = "launchdarkly/launchdarkly"
      version = "~> 2.0"
    }
  }
  required_version = ">= 1.0"
}

# Configure the LaunchDarkly Provider
provider "launchdarkly" {
  access_token = var.launchdarkly_access_token
}

# Create the LaunchDarkly project
resource "launchdarkly_project" "dino_run" {
  key  = var.project_key
  name = var.project_name

  environments {
    key   = "development"
    name  = "Development"
    color = "417505"
  }

  environments {
    key   = "staging"
    name  = "Staging"
    color = "f5a623"
  }

  environments {
    key   = "production"
    name  = "Production"
    color = "d0021b"
  }

  tags = ["game", "demo", "launchdarkly", "dino-run"]
}

# Feature Flag 1: Dino Color
resource "launchdarkly_feature_flag" "dino_color" {
  project_key = launchdarkly_project.dino_run.key
  key         = var.dino_color_flag_key
  name        = "Dino Color"
  description = "Controls the color of the dinosaur character in the game"

  variation_type = "string"
  variations {
    value       = "green"
    name        = "Green"
    description = "Default green dinosaur"
  }
  variations {
    value       = "blue"
    name        = "Blue"
    description = "Blue dinosaur"
  }
  variations {
    value       = "red"
    name        = "Red"
    description = "Red dinosaur"
  }
  variations {
    value       = "purple"
    name        = "Purple"
    description = "Purple dinosaur"
  }
  variations {
    value       = "orange"
    name        = "Orange"
    description = "Orange dinosaur"
  }
  variations {
    value       = "pink"
    name        = "Pink"
    description = "Pink dinosaur"
  }

  defaults {
    on_variation  = 0  # Green
    off_variation = 0  # Green
  }

  # Enable client-side SDK access (SDKs using Client-side ID)
  client_side_availability {
    using_environment_id = true
    using_mobile_key     = false
  }

  tags = ["game", "ui", "color"]
}

# Feature Flag 2: Game Difficulty
resource "launchdarkly_feature_flag" "game_difficulty" {
  project_key = launchdarkly_project.dino_run.key
  key         = var.difficulty_flag_key
  name        = "Game Difficulty"
  description = "Controls the difficulty level of the game (obstacle speed, frequency, jump height)"

  variation_type = "string"
  variations {
    value       = "easy"
    name        = "Easy"
    description = "Slower obstacles, more time to react"
  }
  variations {
    value       = "medium"
    name        = "Medium"
    description = "Balanced gameplay - default difficulty"
  }
  variations {
    value       = "hard"
    name        = "Hard"
    description = "Faster obstacles, higher challenge"
  }

  defaults {
    on_variation  = 1  # Medium
    off_variation = 1  # Medium
  }

  # Enable client-side SDK access (SDKs using Client-side ID)
  client_side_availability {
    using_environment_id = true
    using_mobile_key     = false
  }

  tags = ["game", "difficulty", "gameplay"]
}

# Feature Flag 3: Weather Background
resource "launchdarkly_feature_flag" "weather_background" {
  project_key = launchdarkly_project.dino_run.key
  key         = var.weather_flag_key
  name        = "Weather Background"
  description = "Controls the seasonal weather background theme of the game"

  variation_type = "string"
  variations {
    value       = "spring"
    name        = "Spring"
    description = "Light blue sky with green tones"
  }
  variations {
    value       = "summer"
    name        = "Summer"
    description = "Bright yellow/blue sunny sky"
  }
  variations {
    value       = "autumn"
    name        = "Autumn"
    description = "Orange/brown fall colors"
  }
  variations {
    value       = "winter"
    name        = "Winter"
    description = "Light blue/white winter theme"
  }

  defaults {
    on_variation  = 0  # Spring
    off_variation = 0  # Spring
  }

  # Enable client-side SDK access (SDKs using Client-side ID)
  client_side_availability {
    using_environment_id = true
    using_mobile_key     = false
  }

  tags = ["game", "ui", "weather", "theme"]
}

# Environment-specific flag configurations
resource "launchdarkly_feature_flag_environment" "dino_color_dev" {
  flag_id      = launchdarkly_feature_flag.dino_color.id
  env_key      = "development"
  on           = true
  fallthrough {
    variation = 0  # Green
  }
  off_variation = 0  # Green
}

resource "launchdarkly_feature_flag_environment" "game_difficulty_dev" {
  flag_id      = launchdarkly_feature_flag.game_difficulty.id
  env_key      = "development"
  on           = true
  fallthrough {
    variation = 1  # Medium
  }
  off_variation = 1  # Medium
}

resource "launchdarkly_feature_flag_environment" "weather_background_dev" {
  flag_id      = launchdarkly_feature_flag.weather_background.id
  env_key      = "development"
  on           = true
  fallthrough {
    variation = 0  # Spring
  }
  off_variation = 0  # Spring
} 