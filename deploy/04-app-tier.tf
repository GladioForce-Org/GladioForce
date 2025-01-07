################# Application tier #########################


#Retrieve data source labrole (Needed for the task definition creation) !!!! Must be changed when going to production !!!

data "aws_iam_role" "labrole" {
  name = "labrole"
}

output "labrole_id" {
  value = data.aws_iam_role.labrole.arn

}


#retrieve ECR repository url --> !!!Needs to be created upfront using AWS WebInterface!!!


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


###############################
# VPC Endpoint secrets manager
###############################


resource "aws_vpc_endpoint" "secrets_manager" {
  vpc_id            = aws_vpc.vpc.id
  service_name      = "com.amazonaws.${var.region}.secretsmanager" # Use the correct region in the service name
  vpc_endpoint_type = "Interface"

  # Enable Private DNS to use the standard Secrets Manager endpoint name
  private_dns_enabled = true
  security_group_ids  = [aws_security_group.vpc_endpoints.id]
  subnet_ids          = [aws_subnet.private_subnets[0].id]


  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-vpc-endpoint-secretsmanager" })
  )
}




##############################
# VPC Endpoint Cloudwatch logs
##############################

resource "aws_vpc_endpoint" "cloudwatch_logs" {
  vpc_id             = aws_vpc.vpc.id
  service_name       = "com.amazonaws.${var.region}.logs"
  security_group_ids = [aws_security_group.vpc_endpoints.id]
  subnet_ids         = [aws_subnet.private_subnets[0].id]
  vpc_endpoint_type  = "Interface"

  private_dns_enabled = true

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-vpc-endpoint-cloudwatch" })
  )
}

# setup cloudwatch log group

resource "aws_cloudwatch_log_group" "gladioforce_backend" {
  name              = "/ecs/${local.prefix}-gladioforce-backend"
  retention_in_days = 30
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
  family = "${local.prefix}-gladioforce-backend"
  container_definitions = jsonencode([
    {
      "portMappings" : [
        {
          "hostPort" : 8000,
          "protocol" : "tcp",
          "containerPort" : 8000
        }
      ],
      "cpu" : "${var.container_cpu}",
      "environment" : [
        {
          "name" : "DB_HOST",
          "value" : "${aws_db_instance.db_app.address}"
        },
        {
          "name" : "ALB_DNS",
          "value" : "10.0.1.100"
        },
        {
          "name" : "DOMAIN_URL",
          "value" : "https://admin.gladioforce.org,https://data.gladioforce.org,https://dumpster.gladioforce.org"
        },
        {
          "name" : "DB_NAME",
          "value" : "gladio"
        }
      ],
      "secrets" : [
        {
          "name" : "DB_USERNAME",
          "valueFrom" : "${aws_secretsmanager_secret.database_username_secret.arn}:DB_USERNAME::"
        },
        {
          "name" : "DB_PASSWORD",
          "valueFrom" : "${aws_secretsmanager_secret.database_password_secret.arn}:DB_PASSWORD::"
        },
        {
          "name" : "SECRET_KEY",
          "valueFrom" : "${aws_secretsmanager_secret.app_secret_key.arn}:SECRET_KEY::"
        }
      ],
      "memory" : var.container_memory,
      "image" : "${var.ecr_image}:latest",
      "essential" : true,
      "name" : "gladioforce-backend",
      "logConfiguration" : {
        "logDriver" : "awslogs",
        "options" : {
          "awslogs-group" : "/ecs/${local.prefix}-gladioforce-backend",
          "awslogs-region" : var.region,
          "awslogs-stream-prefix" : "ecs"
        }
      }
    }
  ])

  network_mode = "awsvpc"
  requires_compatibilities = [
    "FARGATE"
  ]
  memory             = var.container_memory
  cpu                = var.container_cpu
  execution_role_arn = data.aws_iam_role.labrole.arn # needs to be changed when going into production
  task_role_arn      = data.aws_iam_role.labrole.arn # needs to be changed when going into production

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-backend-container" })
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

  #### Service registry not used in lab ######## Service registry not used in lab ######## Service registry not used in lab ######## Service registry not used in lab ######## Service registry not used in lab ####
  # service_registries {
  #   registry_arn = aws_service_discovery_service.gladioforce_backend.arn
  # }
  #### Service registry not used in lab ######## Service registry not used in lab ######## Service registry not used in lab ######## Service registry not used in lab ######## Service registry not used in lab ####
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



# How to get the containers private ip address to add it to the nginx configuration.


resource "null_resource" "fetch_private_ip" {
  provisioner "local-exec" {
    command = <<EOT
      #!/bin/bash
      MAX_RETRIES=24
      RETRIES=0
      TASK_ARN=""

      echo "Waiting for a task to start in the ECS cluster..."

      while [ -z "$TASK_ARN" ] || [ "$TASK_ARN" = "None" ]; do
        TASK_ARN=$(aws ecs list-tasks --cluster gladiolen-ecs-cluster --query 'taskArns[0]' --output text 2>/dev/null)

        if [ -n "$TASK_ARN" ] && [ "$TASK_ARN" != "None" ]; then
          echo "Found TASK_ARN: $TASK_ARN"
          break
        fi

        RETRIES=$((RETRIES + 1))
        if [ $RETRIES -ge $MAX_RETRIES ]; then
          echo "No tasks started in the ECS cluster within the timeout period. Exiting."
          exit 1
        fi

        echo "No tasks found yet. Retrying in 60 seconds... ($RETRIES/$MAX_RETRIES)"
        sleep 60
      done


      echo "Checking the status of the task..."

      MAX_STATUS_RETRIES=24
      STATUS_RETRIES=0

      while true; do
        TASK_STATUS=$(aws ecs describe-tasks --cluster gladiolen-ecs-cluster --tasks "$TASK_ARN" --query 'tasks[0].lastStatus' --output text 2>/dev/null)

        if [ "$TASK_STATUS" = "RUNNING" ]; then
          echo "Task has reached RUNNING state."
          break
        fi

        STATUS_RETRIES=$((STATUS_RETRIES + 1))
        if [ $STATUS_RETRIES -ge $MAX_STATUS_RETRIES ]; then
          echo "Task did not reach RUNNING state within the timeout period. Exiting."
          exit 1
        fi

        echo "Task is not running yet. Retrying in 20 seconds... ($STATUS_RETRIES/$MAX_STATUS_RETRIES)"
        sleep 20
      done

      ENI_ID=$(aws ecs describe-tasks --cluster gladiolen-ecs-cluster --tasks "$TASK_ARN" --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text 2>/dev/null)

      if [ -z "$ENI_ID" ]; then
        echo "Failed to retrieve ENI_ID. Exiting."
        exit 1
      fi

      PRIVATE_IP=$(aws ec2 describe-network-interfaces --network-interface-ids "$ENI_ID" --query 'NetworkInterfaces[0].PrivateIpAddress' --output text 2>/dev/null)

      if [ -z "$PRIVATE_IP" ]; then
        echo "Failed to retrieve PRIVATE_IP. Exiting."
        exit 1
      fi

      # Trim trailing newlines from PRIVATE_IP
      PRIVATE_IP=$(echo "$PRIVATE_IP" | sed ':a;N;$!ba;s/\n*$//')

      echo "Private IP: $PRIVATE_IP"
      echo -n "$PRIVATE_IP" > private_ip.txt
    EOT
  }

  triggers = {
    always_run = "${timestamp()}" # This ensures the resource triggers every time
  }

  depends_on = [aws_ecs_service.gladioforce_backend]

}

# Read the Private IP from the generated file
data "local_file" "private_ip" {
  filename = "private_ip.txt"

  depends_on = [null_resource.fetch_private_ip]


}

# Output the Private IP for use in other resources
output "container_private_ip" {
  value = data.local_file.private_ip.content
}

