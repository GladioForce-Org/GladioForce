##### Secrets creation for the ECS task definition #########

#We will create AWS secrets to export the RDS credentials to, 
#and use them to parse the secrets as environment variables when we create the task defintion

#Create secret to store the password used to log into the RDS instance

resource "aws_secretsmanager_secret" "database_password_secret" {
  name                    = "${local.prefix}-secret-rds-password"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "database_password_secret_version" {
  secret_id     = aws_secretsmanager_secret.database_password_secret.id
  secret_string = jsonencode({ "DB_PASSWORD" = "${var.db_password}" })
}

#Create secret to store the username used to log into the RDS instance

resource "aws_secretsmanager_secret" "database_username_secret" {
  name                    = "${local.prefix}-secret-rds-username"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "database_username_secret_version" {
  secret_id     = aws_secretsmanager_secret.database_username_secret.id
  secret_string = jsonencode({ "DB_USERNAME" = "${var.db_username}" })
}


#Create secret to store secret key of the backend

resource "aws_secretsmanager_secret" "app_secret_key" {
  name                    = "${local.prefix}-app-secret-key"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "app_secret_key_version" {
  secret_id     = aws_secretsmanager_secret.app_secret_key.id
  secret_string = jsonencode({ "SECRET_KEY" = "${var.app_secret_key}" })
}