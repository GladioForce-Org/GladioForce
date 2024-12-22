# ## Static file hosting in S3 buckets

# ## Admin dashboard 

# # Create the S3 bucket
# resource "aws_s3_bucket" "admin_dashboard" {
#   bucket        = "admin-dashboard-gladioforce"
#   force_destroy = true

#   tags = merge(
#     local.common_tags,
#     tomap({ "Name" = "${local.prefix}-s3-admin-dashboard" })
#   )
# }

# # Attach bucket policy for public access
# resource "aws_s3_bucket_policy" "admin_dashboard" {
#   bucket = aws_s3_bucket.admin_dashboard.id

#   policy = jsonencode({
#     Version = "2012-10-17",
#     Statement = [
#       {
#         Effect    = "Allow",
#         Principal = "*",
#         Action    = ["s3:GetObject", "s3:GetObjectVersion"],
#         Resource  = "${aws_s3_bucket.admin_dashboard.arn}/*",
#         Sid       = "PublicRead",
#       }
#     ]
#   })

#   depends_on = [aws_s3_bucket_public_access_block.admin_dashboard]
# }

# resource "aws_s3_bucket_public_access_block" "admin_dashboard" {
#   bucket = aws_s3_bucket.admin_dashboard.id

#   block_public_acls       = false # Allow public ACLs
#   block_public_policy     = false # Allow public bucket policies
#   ignore_public_acls      = false # Do not ignore public ACLs
#   restrict_public_buckets = false # Allow public access at the bucket level
# }

# # Enable website hosting configuration using aws_s3_bucket_website_configuration
# resource "aws_s3_bucket_website_configuration" "admin_dashboard" {
#   bucket = aws_s3_bucket.admin_dashboard.id

#   index_document {
#     suffix = "index.html"
#   }



# }

# # Output the bucket website endpoint
# output "admin_dashboard_bucket_website_url" {
#   value = aws_s3_bucket_website_configuration.admin_dashboard.website_endpoint
# }

# # Sync Angular build files to S3
# resource "null_resource" "admin_dashboard_upload" {
#   provisioner "local-exec" {
#     command = <<EOT
#     aws s3 sync ../frontend/admin_dashboard/dist/admin_dashboard/browser s3://${aws_s3_bucket.admin_dashboard.bucket} --delete
#     EOT
#   }

#   depends_on = [aws_s3_bucket_policy.admin_dashboard]
# }

# # # Output the bucket URL
# # output "admin_dashboard_bucket_website_url" {
# #   value = aws_s3_bucket.admin_dashboard.website_endpoint
# # }




# ## Datacollectie

# # Create the S3 bucket
# resource "aws_s3_bucket" "datacollectie" {
#   bucket        = "datacollectie-gladioforce"
#   force_destroy = true

#   tags = merge(
#     local.common_tags,
#     tomap({ "Name" = "${local.prefix}-s3-datacollectie" })
#   )
# }

# # Attach bucket policy for public access
# resource "aws_s3_bucket_policy" "datacollectie" {
#   bucket = aws_s3_bucket.datacollectie.id

#   policy = jsonencode({
#     Version = "2012-10-17",
#     Statement = [
#       {
#         Effect    = "Allow",
#         Principal = "*",
#         Action    = ["s3:GetObject", "s3:GetObjectVersion"],
#         Resource  = "${aws_s3_bucket.datacollectie.arn}/*",
#         Sid       = "PublicRead",
#       }
#     ]
#   })

#   depends_on = [aws_s3_bucket_public_access_block.datacollectie]
# }


# resource "aws_s3_bucket_public_access_block" "datacollectie" {
#   bucket = aws_s3_bucket.datacollectie.id

#   block_public_acls       = false # Allow public ACLs
#   block_public_policy     = false # Allow public bucket policies
#   ignore_public_acls      = false # Do not ignore public ACLs
#   restrict_public_buckets = false # Allow public access at the bucket level
# }

# # Enable website hosting configuration using aws_s3_bucket_website_configuration
# resource "aws_s3_bucket_website_configuration" "datacollectie" {
#   bucket = aws_s3_bucket.datacollectie.id

#   index_document {
#     suffix = "index.html"
#   }


# }

# # Output the bucket website endpoint
# output "datacollectie_bucket_website_url" {
#   value = aws_s3_bucket_website_configuration.datacollectie.website_endpoint
# }

# # Sync Angular build files to S3
# resource "null_resource" "datacollectie_upload" {
#   provisioner "local-exec" {
#     command = <<EOT
#     aws s3 sync ../frontend/datacollectie/dist/browser s3://${aws_s3_bucket.datacollectie.bucket} --delete
#     EOT
#   }

#   depends_on = [aws_s3_bucket_policy.datacollectie]
# }

# # Output the bucket URL
# output "datacollectie_website_url" {
#   value = aws_s3_bucket.datacollectie.website_endpoint
# }


data "aws_key_pair" "mykeypair" {
  key_name           = "nginx"
  include_public_key = true

}




# EC2 Instance for NGINX with user_data to set up the config
resource "aws_instance" "nginx" {
  ami             = "ami-0e2c8caa4b6378d8c"
  instance_type   = "t2.micro"
  subnet_id       = aws_subnet.public_subnets[0].id
  security_groups = [aws_security_group.internet_nginx_sg.id]
  key_name        = data.aws_key_pair.mykeypair.key_name
  private_ip      = "10.0.1.100" # Static private IP address

  user_data = <<-EOF
#!/bin/bash
# Update and install necessary packages
sudo apt-get update
sudo apt-get install -y nginx python3-certbot-dns-cloudflare

# Enable nginx service
sudo systemctl start nginx
sudo systemctl enable nginx


# Obtain SSL certificates using Certbot
# Replace with your domain name
DOMAIN_NAME="www.${var.cloudflare_domain}"
EMAIL="${var.cloudflare_email}"
sudo touch ~/cloudflare-credentials
echo 'dns_cloudflare_api_token = ${var.cloudflare_api_token}' | sudo tee ~/cloudflare-credentials > /dev/null

# Certbot command to obtain and install certificates
# Staging
sudo certbot certonly --non-interactive --dns-cloudflare --dns-cloudflare-credentials ~/cloudflare-credentials --agree-tos -d $DOMAIN_NAME --server https://acme-staging-v02.api.letsencrypt.org/directory --email $EMAIL
# production
#sudo certbot certonly --non-interactive --dns-cloudflare --dns-cloudflare-credentials ~/cloudflare-credentials --agree-tos -d $DOMAIN_NAME --server https://acme-v02.api.letsencrypt.org/directory --email $EMAIL 
sleep 180


#Set up NGINX server block
cat <<EOT > /etc/nginx/sites-available/gladiolen
server {
    listen 80;
    server_name $DOMAIN_NAME;

    # Redirect HTTP to HTTPS
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN_NAME;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/$DOMAIN_NAME/chain.pem;

    # Your static file and API configuration
    location / {
        root /var/www/admin;
        index index.html;
        try_files \$uri /index.html;
    }

    # location /app2/ {
    #     root /var/www/app2;
    #     index index.html;
    #     try_files \$uri /index.html;
    # }

    # location /app3/ {
    #     root /var/www/app3;
    #     index index.html;
    #     try_files \$uri /index.html;
    # }

    location /api/ {
        # Use the container's private IP address dynamically
        proxy_pass http://${data.local_file.private_ip.content}:8000/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;

    }


}
EOT

# Reload NGINX to apply changes
sudo ln -s /etc/nginx/sites-available/gladiolen /etc/nginx/sites-enabled/
sudo nginx -t | sudo tee ~/nginx-config-test > /dev/null
sudo systemctl reload nginx

# Set up a cron job to renew certificates automatically
# staging
echo "0 0 1 * * certbot renew --non-interactive --no-self-upgrade --dns-cloudflare --dns-cloudflare-credentials ~/cloudflare-credentials --agree-tos --server https://acme-staging-v02.api.letsencrypt.org/directory  --email $EMAIL && systemctl reload nginx" | sudo tee /etc/cron.d/certbot-renew > /dev/null
# production
#echo "0 0 1 * * certbot renew --non-interactive --no-self-upgrade --dns-cloudflare --dns-cloudflare-credentials ~/cloudflare-credentials --agree-tos --server https://acme-v02.api.letsencrypt.org/directory  --email $EMAIL && systemctl reload nginx" | sudo tee /etc/cron.d/certbot-renew > /dev/null


EOF


  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-nginx" })
  )

  depends_on = [data.local_file.private_ip]
}



resource "null_resource" "upload_app_files" {
  depends_on = [aws_instance.nginx]

  provisioner "file" {
    source      = "../frontend/admin_dashboard/dist/admin_dashboard/browser/admin.zip"
    destination = "/home/ubuntu/admin.zip"

    connection {
      type        = "ssh"
      user        = "ubuntu"
      private_key = file(var.private_key_path)
      host        = aws_eip.nginx.public_ip
    }
  }

  # provisioner "file" {
  #   source      = "../frontend/another_app/dist/another_app/browser"
  #   destination = "/home/ec2-user/another.zip"

  #   connection {
  #     type        = "ssh"
  #     user        = "ec2-user"
  #     private_key = file(var.private_key_path)
  #     host        = aws_instance.nginx.public_ip
  #   }
  # }

  provisioner "remote-exec" {
    inline = [
      "sudo apt update -y",
      "sudo mkdir -p /var/www/admin",
      "sudo mkdir -p /var/www/data",
      "sudo apt install unzip -y",
      "sudo unzip /home/ubuntu/admin.zip -d /var/www/admin",
      # "sudo unzip /home/ec2-user/app2.zip -d /var/www/app2",
      # "sudo unzip /home/ec2-user/app3.zip -d /var/www/app3",
      "sudo chown -R www-data:www-data /var/www",
      "sudo chmod -R 755 /var/www",
      "service restart nginx || true" #suppress error, reload happens but terraform fails
    ]

    connection {
      type        = "ssh"
      user        = "ubuntu"
      private_key = file(var.private_key_path)
      host        = aws_eip.nginx.public_ip
    }
  }
}


# Create a CNAME record on cloudflare pointing to the DNS name of the internet facing loadbalancer

data "cloudflare_zone" "gladioforce" {
  name = var.cloudflare_domain
}

resource "cloudflare_record" "a" {
  zone_id = data.cloudflare_zone.gladioforce.id
  name    = "www"
  content = aws_eip.nginx.public_ip
  type    = "A"
  proxied = false

}


output "url_application" {
  value = "${cloudflare_record.a.name}.${var.cloudflare_domain}"
}







