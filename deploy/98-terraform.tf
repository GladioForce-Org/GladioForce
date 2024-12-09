terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }

    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}




# Configure the AWS Provider
provider "aws" {
  region = "us-east-1"

}

#The locals will be used to tag the different resources


locals {
  prefix = var.project
  common_tags = {

    Project   = var.project
    Owner     = var.admin_id
    ManagedBy = "Terraform"

  }
}




#Cloudflare API token to create DNS records using the cloudflare provider
provider "cloudflare" {
  api_token = var.cloudflare_api_token

}


############ S3 BACKEND ############

#configure S3 as a backend storage for consistency between deployments and to store the lockfile
# Making it impossible two developpers perform infrastructure changing actions at the same time


terraform {
  backend "s3" {
    bucket         = "gladioforce-tfstate"
    key            = "gladiolen-gladioforce.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "gladiolen-gladioforce-state-lock"
  }
}


