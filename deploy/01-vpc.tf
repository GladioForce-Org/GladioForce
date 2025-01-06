###### VPC Resource Creation #########

#VPC 

resource "aws_vpc" "vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true


  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-vpc" })
  )

}

### Subnets
## For the creation of the subnets we use the count and element function to determine the number of subnets thay need to be created and in which AZ

#Public Subnets for the web-tier 

resource "aws_subnet" "public_subnets" {
  count             = length(var.public_subnet_cidrs)
  vpc_id            = aws_vpc.vpc.id
  cidr_block        = element(var.public_subnet_cidrs, count.index)
  availability_zone = element(var.azs, count.index)

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-Public-Subnet-${count.index + 1}" })
  )
}


#Private subnets for the app-tier

resource "aws_subnet" "private_subnets" {
  count             = length(var.private_subnet_cidrs)
  vpc_id            = aws_vpc.vpc.id
  cidr_block        = element(var.private_subnet_cidrs, count.index)
  availability_zone = element(var.azs, count.index)

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-Private-Subnet-${count.index + 1}" })
  )
}


#Private subnets for the database tier

resource "aws_subnet" "database_subnets" {
  count             = length(var.database_subnet_cidrs)
  vpc_id            = aws_vpc.vpc.id
  cidr_block        = element(var.database_subnet_cidrs, count.index)
  availability_zone = element(var.azs, count.index)

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-Database-Subnet-${count.index + 1}" })
  )
}

# Internet gateway for allowing outbound connections from out public subnets

resource "aws_internet_gateway" "gateway" {
  vpc_id = aws_vpc.vpc.id

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-internet-gw" })
  )
}



#Create a Second Route Table for the internet gateway 

resource "aws_route_table" "second_rt" {
  vpc_id = aws_vpc.vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gateway.id
  }

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-rt-igw" })
  )
}


#Associate Public Subnets with the Second Route Table to direct all trafic not destined for the local VPC CIDR to tthe IGW

resource "aws_route_table_association" "public_subnet_asso" {
  count          = length(var.public_subnet_cidrs)
  subnet_id      = element(aws_subnet.public_subnets[*].id, count.index)
  route_table_id = aws_route_table.second_rt.id
}



# Define DB subnet group for the RDS database, this is required when we create the Multi-AZ environment (replication)
resource "aws_db_subnet_group" "db_subnet" {
  name       = "${local.prefix}-db-subnet-group"
  subnet_ids = [aws_subnet.database_subnets[0].id, aws_subnet.database_subnets[1].id]

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-db-subnet-group" })
  )
}


# Create an Elastic IP for the NAT Gateway
resource "aws_eip" "elastic_ip_nat" {
  depends_on = [aws_internet_gateway.gateway]
  domain     = "vpc"

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-elastic-ip-nat" })
  )
}


# Create a NAT Gateway in one of the public subnets
resource "aws_nat_gateway" "nat_gateway" {
  allocation_id = aws_eip.elastic_ip_nat.id
  subnet_id     = aws_subnet.public_subnets[0].id


  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-nat-gw" })
  )
}


# Update the route table of private subnets to route traffic through ECR-S3 gateway that is not destined for the local VPC CIDR

resource "aws_route_table" "private_route_table" {
  vpc_id = aws_vpc.vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_nat_gateway.nat_gateway.id
  }

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-private-rt-app-tier" })
  )
}

#Associate private Subnets with the second Route Table pointing to the NAT gateway. required to launch the containers in the App-Tier (pip install requirements)

resource "aws_route_table_association" "private_route_association_2" {
  count          = length(var.private_subnet_cidrs)
  subnet_id      = element(aws_subnet.private_subnets[*].id, count.index)
  route_table_id = aws_route_table.private_route_table.id
}



#Elastic ip for nginx

resource "aws_eip" "nginx" {
  instance = aws_instance.nginx.id

}
