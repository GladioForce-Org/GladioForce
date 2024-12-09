

######################## Deployment specific ######################

variable "admin_id" {
  description = "The number of the admin who created the resources"
  type        = string

}

variable "region" {

  description = "Region the resource will be launched"
  type        = string
}


variable "project" {

  type        = string
  description = "Name of the project, will be used in tagging the resources"

}









###################### VPC  #############################

variable "vpc_cidr" {
  type        = string
  description = "Cidr Block of the VPC"

}

variable "public_subnet_cidrs" {
  type        = list(string)
  description = "Public Subnet CIDR values"

}

variable "private_subnet_cidrs" {
  type        = list(string)
  description = "Private Subnet CIDR values"

}

variable "database_subnet_cidrs" {
  type        = list(string)
  description = "Database Subnet CIDR values"

}

variable "azs" {
  type        = list(string)
  description = "Availability Zones"
}

###################### RDS instance #############################

variable "db_allocated_storage" {

  type        = number
  description = " this argument represents the initial storage allocation in GB"

}


variable "db_storage_type" {

  type        = string
  description = " One of 'standard' (magnetic), 'gp2' (general purpose SSD), 'gp3' (general purpose SSD that needs iops independently) or 'io1' (provisioned IOPS SSD). The default is 'io1' if iops is specified, 'gp2' if not."

}


variable "db_engine" {

  type        = string
  description = "The database engine to use"

}


variable "db_engine_version" {

  type        = string
  description = "The database engine version to use"

}

variable "db_instance_class" {

  type        = string
  description = "The RDS instance class"

}

variable "db_identifier" {

  type        = string
  description = "The name of the RDS instance, if omitted, Terraform will assign a random, unique identifier. "

}

variable "db_username" {


  description = "Username to access the database"

}

variable "db_password" {

  description = "Password to access the database, stored in env variables"

}


variable "db_name" {

  type        = string
  description = "Name of the database that will be deployed for the applicationS"

}




###################### App Tier #############################

#ECR

variable "untagged_images" {

  type        = number
  description = "Numer of untagged images kept in ECR repo"

}

variable "minimum_instances" {

  type        = number
  description = "Number minimum instances that should be running (autoscaling)"

}

variable "maximum_instances" {

  type        = number
  description = "Number maximum instances that should be running (autoscaling)"

}


variable "container_cpu" {

  type        = number
  description = "Amount of CPU resources for the container in the task definition (ex: 512 = 0.5 Ghz)"

}

variable "container_memory" {

  type        = number
  description = "Amount of memory resources for te container in the taks definition (ex: 1024 = 1Gb)"

}


variable "ecr_image" {

  type        = string
  description = "Name of image that will be used in the task definition"

}

# ########################## Web Tier ###############################



variable "cloudflare_api_token" {
  description = "Access key for authentication to cloudflare provider (.env)"
}

variable "cloudflare_domain" {
  description = "The cloudflare domain the DNS settings need to be changed"
}

variable "cloudflare_email" {
  description = "The cloudflare domain the DNS settings need to be changed"
}
# ###################### Bastion - host #############################







