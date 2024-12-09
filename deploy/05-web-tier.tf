## Static file hosting in S3 buckets

## Admin dashboard 

# Create the S3 bucket
resource "aws_s3_bucket" "admin_dashboard" {
  bucket = "admin-dashboard"

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-s3-admin-dashboard" })
  )
}

# Attach bucket policy for public access
resource "aws_s3_bucket_policy" "admin_dashboard" {
  bucket = aws_s3_bucket.admin_dashboard.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect    = "Allow",
        Principal = "*",
        Action    = "s3:GetObject",
        Resource  = "${aws_s3_bucket.admin_dashboard.arn}/*",
      }
    ]
  })
}

# Enable website hosting configuration using aws_s3_bucket_website_configuration
resource "aws_s3_bucket_website_configuration" "admin_dashboard" {
  bucket = aws_s3_bucket.admin_dashboard.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# Output the bucket website endpoint
output "admin_dashboard_bucket_website_url" {
  value = aws_s3_bucket_website_configuration.admin_dashboard.website_endpoint
}

# Sync Angular build files to S3
resource "null_resource" "admin_dashboard_upload" {
  provisioner "local-exec" {
    command = <<EOT
    aws s3 sync ./dist/my-angular-app s3://${aws_s3_bucket.admin_dashboard.bucket} --delete
    EOT
  }

  depends_on = [aws_s3_bucket_policy.admin_dashboard]
}

# # Output the bucket URL
# output "admin_dashboard_bucket_website_url" {
#   value = aws_s3_bucket.admin_dashboard.website_endpoint
# }




## Datacollectie

# Create the S3 bucket
resource "aws_s3_bucket" "datacollectie" {
  bucket = "datacollectie"

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-s3-datacollectie" })
  )
}

# Attach bucket policy for public access
resource "aws_s3_bucket_policy" "datacollectie" {
  bucket = aws_s3_bucket.datacollectie.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect    = "Allow",
        Principal = "*",
        Action    = "s3:GetObject",
        Resource  = "${aws_s3_bucket.datacollectie.arn}/*",
      }
    ]
  })
}

# Enable website hosting configuration using aws_s3_bucket_website_configuration
resource "aws_s3_bucket_website_configuration" "datacollectie" {
  bucket = aws_s3_bucket.datacollectie.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# Output the bucket website endpoint
output "datacollectie_bucket_website_url" {
  value = aws_s3_bucket_website_configuration.datacollectie.website_endpoint
}

# Sync Angular build files to S3
resource "null_resource" "datacollectie_upload" {
  provisioner "local-exec" {
    command = <<EOT
    aws s3 sync ./dist/my-angular-app s3://${aws_s3_bucket.datacollectie.bucket} --delete
    EOT
  }

  depends_on = [aws_s3_bucket_policy.datacollectie]
}

# # Output the bucket URL
# output "datacollectie_website_url" {
#   value = aws_s3_bucket.datacollectie.website_endpoint
# }







# EC2 Instance for NGINX with user_data to set up the config
resource "aws_instance" "nginx" {
  ami             = "ami-0e2c8caa4b6378d8c"
  instance_type   = "t2.micro"
  subnet_id       = aws_subnet.public_subnets[0].id
  security_groups = [aws_security_group.internet_nginx_sg.id]

  user_data = <<-EOF
#!/bin/bash
# Update and install necessary packages
apt-get update
apt-get install -y nginx python3-certbot-nginx

# Enable nginx service
systemctl start nginx
systemctl enable nginx

# Obtain SSL certificates using Certbot
# Replace with your domain name
DOMAIN_NAME="${var.cloudflare_domain}"
EMAIL="${var.cloudflare_email}"
echo 'dns_cloudflare_api_token = ${var.cloudflare_api_token}' > cloudflare-credentials

# Certbot command to obtain and install certificates
certbot certonly --non-interactive --dns-cloudflare --dns-cloudflare-credentials cloudflare-credentials --agree-tos -d $DOMAIN_NAME --server https://acme-v02.api.letsencrypt.org/directory --email $EMAIL

# Optional: Set up NGINX server block
cat <<EOT > /etc/nginx/sites-available/default
server {
    listen 80;
    server_name $DOMAIN_NAME;

    # Redirect HTTP to HTTPS
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name $DOMAIN_NAME;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/$DOMAIN_NAME/chain.pem;

    # Your static file and API configuration
    location /static/ {
        proxy_pass https://s3.amazonaws.com/your-angular-bucket-name/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location /api/ {
        proxy_pass http://django-backend.local:8000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOT

# Reload NGINX to apply changes
systemctl reload nginx

# Set up a cron job to renew certificates automatically
echo "0 0,12 * * * certbot renew --non-interactive --no-self-upgrade --dns-cloudflare --dns-cloudflare-credentials cloudflare-credentials --agree-tos --server https://acme-v02.api.letsencrypt.org/directory  --email $EMAIL && systemctl reload nginx" > /etc/cron.d/certbot-renew
EOF

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-nginx" })
  )
}




# Create a CNAME record on cloudflare pointing to the DNS name of the internet facing loadbalancer

data "cloudflare_zone" "gladioforce" {
  name = var.cloudflare_domain
}

resource "cloudflare_record" "cname" {
  zone_id = data.cloudflare_zone.gladioforce.id
  name    = "www"
  content = aws_instance.nginx.public_dns
  type    = "CNAME"
  proxied = false

}


output "url_application" {
  value = "${cloudflare_record.cname.name}.${var.cloudflare_domain}"
}
