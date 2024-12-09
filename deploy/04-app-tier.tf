################# Application tier #########################


#Retrieve data source labrole (Needed for the task definition creation) !!!! Must be changed when going to production !!!

data "aws_iam_role" "labrole" {
  name = "labrole"
}

output "labrole_id" {
  value = data.aws_iam_role.labrole.arn

}


#retrieve ECR repository url --> !!!Needs to be created upfront!!!


data "aws_ecr_repository" "gladioforce-repo" {
  name = "gladioforce-backend"
}

#Creation of the ECS cluster

resource "aws_ecs_cluster" "gladioforce_backend" {
  name = "${local.prefix}-ecs-cluster"
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-db-instance" })
  )

}


##############################
# VPC Endpoint (ecr.dkr)
##############################
resource "aws_vpc_endpoint" "ecr_dkr" {
  vpc_id              = aws_vpc.vpc.id
  service_name        = "com.amazonaws.${var.region}.ecr.dkr"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true

  security_group_ids = [aws_security_group.vpc_endpoints.id]
  subnet_ids         = [aws_subnet.private_subnets[0].id]

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-vpc-endpoint-ecr-dkr" })
  )
}

##############################
# VPC Endpoint (ecr.api)
##############################
resource "aws_vpc_endpoint" "ecr_api" {
  vpc_id              = aws_vpc.vpc.id
  service_name        = "com.amazonaws.${var.region}.ecr.api"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true

  security_group_ids = [aws_security_group.vpc_endpoints.id]
  subnet_ids         = [aws_subnet.private_subnets[0].id]

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-vpc-endpoint-ecr-api" })
  )
}

##############################
# VPC Endpoint (s3)
##############################
resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.vpc.id
  service_name      = "com.amazonaws.${var.region}.s3"
  vpc_endpoint_type = "Gateway"

  route_table_ids = [aws_route_table.private_route_table.id]

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-vpc-endpoint-ecr-s3" })
  )
}

#Fargate capacity provider

resource "aws_ecs_cluster_capacity_providers" "ecs_web_tier_fargate" {
  cluster_name = aws_ecs_cluster.gladioforce_backend.name

  capacity_providers = ["FARGATE"]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = "FARGATE"
  }
}

# Task definition that will deploy the container.
# The container definitions json encoded file will configure the environment variables needed for the database connection to the RDS database
# We will be using the secrets module of AWS, otherwise the secrets are stored in clear.

resource "aws_ecs_task_definition" "gladioforce_backend" {
  family                = "${local.prefix}-gladioforce-backend"
  container_definitions = <<TASK_DEFINITION
  [
  {
    "portMappings": [
      {
        "hostPort": 8000,
        "protocol": "tcp",
        "containerPort": 8000
      }
    ],
    "cpu": ${var.container_cpu},
    "environment": [
		{
          "name": "DB_HOST",
          "value": "${aws_db_instance.db_app.address}"
        },
        {
          "name": "DB_NAME",
          "value": "gladio"
        }],
    "secrets": [
        {
          "name" : "DB_USERNAME",
          "valueFrom": "${aws_secretsmanager_secret.database_username_secret.arn}:DB_USERNAME::"
        },
        {
          "name": "DB_PASSWORD",
          "valueFrom": "${aws_secretsmanager_secret.database_password_secret.arn}:DB_PASSWORD::"
        }
    ],
    "memory": ${var.container_memory},
    "image": "${var.ecr_image}",
    "essential": true,
    "name": "gladioforce-backend"
  }
]
TASK_DEFINITION

  network_mode = "awsvpc"
  requires_compatibilities = [
  "FARGATE"]
  memory             = var.container_memory
  cpu                = var.container_cpu
  execution_role_arn = data.aws_iam_role.labrole.arn #needs to be changed when going into production
  task_role_arn      = data.aws_iam_role.labrole.arn #needs to be changed when going into production

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-db-instance" })
  )
}

#ECS service that will run the task definition, FARGATE version 1.4 is needed to support secrets injection in the container as env variables

resource "aws_ecs_service" "gladioforce_backend" {
  name             = "gladioforce-backend"
  cluster          = aws_ecs_cluster.gladioforce_backend.id
  task_definition  = aws_ecs_task_definition.gladioforce_backend.arn
  desired_count    = 1
  launch_type      = "FARGATE"
  platform_version = "1.4.0"


  service_registries {
    registry_arn = aws_service_discovery_service.gladioforce_backend.arn
  }

  lifecycle {
    ignore_changes = [
    desired_count]
  }

  network_configuration {
    subnets = [
      aws_subnet.private_subnets[0].id,
    ]
    security_groups = [
    aws_security_group.app_tier_sg.id]
    assign_public_ip = false
  }


  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-ecs-service" })
  )

  depends_on = [aws_db_instance.db_app]
}

#Autoscaling group for the ecs service;  the target tracking scaling type

resource "aws_appautoscaling_target" "asg_target" {
  max_capacity       = var.maximum_instances
  min_capacity       = var.minimum_instances
  resource_id        = "service/${aws_ecs_cluster.gladioforce_backend.name}/${aws_ecs_service.gladioforce_backend.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"


  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-asg-target" })
  )
}

# The autoscaling policy will define when other instances of the container are launched
# In this case --> Memory 80% or CPU 60%

resource "aws_appautoscaling_policy" "asg_memory" {
  name               = "${local.prefix}-asg-policy-memory"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.asg_target.resource_id
  scalable_dimension = aws_appautoscaling_target.asg_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.asg_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }

    target_value = 80
  }

}

resource "aws_appautoscaling_policy" "asg_cpu" {
  name               = "${local.prefix}-asg-policy-cpu"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.asg_target.resource_id
  scalable_dimension = aws_appautoscaling_target.asg_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.asg_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    target_value = 60
  }
}


resource "aws_service_discovery_private_dns_namespace" "ecs_namespace" {
  name        = "my-ecs-namespace"
  vpc         = aws_vpc.vpc.id
  description = "Private DNS namespace for ECS services"
}

resource "aws_service_discovery_service" "gladioforce_backend" {
  name         = "gladioforce-backend"
  namespace_id = aws_service_discovery_private_dns_namespace.ecs_namespace.id
  dns_config {
    namespace_id   = aws_service_discovery_private_dns_namespace.ecs_namespace.id
    routing_policy = "MULTIVALUE"
    dns_records {
      ttl  = 60
      type = "A"
    }
  }
}

