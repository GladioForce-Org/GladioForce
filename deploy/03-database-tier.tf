################# Database #########################



#Creation of KMS key for the encryption of the replica database

resource "aws_kms_key" "db_replica_key" {
  description = "${local.prefix}-kms-key-db"
  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-kms-key-db" })
  )
}

#check if the snapshot exists and if it is the most recent one
# Optional data block to fetch the most recent snapshot
data "external" "rds_final_snapshot_exists" {
  program = [
    "./check-rds-snapshot.sh",
    "${local.prefix}-db"
  ]
}


data "aws_db_snapshot" "latest_snapshot" {
  count                  = data.external.rds_final_snapshot_exists.result.db_exists ? 1 : 0
  db_instance_identifier = "db-instance-id"
  most_recent            = true
}


#Creation of a RDS instance, in a multi-AZ environment the credentials are stored in the .env file and loaded as environment variables before deployment

resource "aws_db_instance" "db_app" {
  allocated_storage = var.db_allocated_storage
  storage_type      = var.db_storage_type
  engine            = var.db_engine
  instance_class    = var.db_instance_class
  identifier        = "${local.prefix}-db"
  username          = var.db_username
  password          = var.db_password
  db_name           = "gladio"


  vpc_security_group_ids = [aws_security_group.db_tier_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.db_subnet.name

  backup_retention_period   = 14
  backup_window             = "03:00-04:00"
  maintenance_window        = "mon:04:00-mon:04:30"
  skip_final_snapshot       = false
  final_snapshot_identifier = "db-${local.prefix}-snapshot-${formatdate("DD-MM-HH-mm-ss", timestamp())}"
  storage_encrypted         = true
  kms_key_id                = aws_kms_key.db_replica_key.arn
  multi_az                  = false
  snapshot_identifier       = try(data.aws_db_snapshot.latest_snapshot.0.id, null)


  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-db-instance" })
  )


  depends_on = [aws_db_subnet_group.db_subnet]
}


