# Keypair for SSH access to the EC2 instance

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
sleep 20

# Enable nginx service
sudo systemctl start nginx
sudo systemctl enable nginx


# Obtain SSL certificates using Certbot
# Replace with your domain name
ADMIN_DOMAIN_NAME="admin.${var.cloudflare_domain}"
DATA_DOMAIN_NAME="data.${var.cloudflare_domain}"
DUMPSTER_DOMAIN_NAME="dumpster.${var.cloudflare_domain}"
WILDCARD_DOMAIN_NAME="*.${var.cloudflare_domain}"
DOMAIN_NAME="${var.cloudflare_domain}"
EMAIL="${var.cloudflare_email}"
sudo touch ~/cloudflare-credentials
echo 'dns_cloudflare_api_token = ${var.cloudflare_api_token}' | sudo tee ~/cloudflare-credentials > /dev/null

# Certbot command to obtain and install certificates
# Staging
#sudo certbot certonly --non-interactive --dns-cloudflare --dns-cloudflare-credentials ~/cloudflare-credentials --agree-tos -d $WILDCARD_DOMAIN_NAME -d $DOMAIN_NAME --server https://acme-staging-v02.api.letsencrypt.org/directory --email $EMAIL
# production
sudo certbot certonly --non-interactive --dns-cloudflare --dns-cloudflare-credentials ~/cloudflare-credentials --agree-tos -d $WILDCARD_DOMAIN_NAME -d $DOMAIN_NAME --server https://acme-v02.api.letsencrypt.org/directory --email $EMAIL 
sleep 80


#Set up NGINX server block
cat <<EOT > /etc/nginx/sites-available/gladiolen
server {
    listen 80;
    server_name $ADMIN_DOMAIN_NAME;

    # Redirect HTTP to HTTPS
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $ADMIN_DOMAIN_NAME;

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

    location /api/ {
        # Use the container's private IP address dynamically
        proxy_pass http://${data.local_file.private_ip.content}:8000/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;

    }


}

server {
    listen 80;
    server_name $DATA_DOMAIN_NAME;

    # Redirect HTTP to HTTPS
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DATA_DOMAIN_NAME;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/$DOMAIN_NAME/chain.pem;

    # Your static file and API configuration
    location / {
        root /var/www/data;
        index index.html;
        try_files \$uri /index.html;
    }

    location /api/ {
        # Use the container's private IP address dynamically
        proxy_pass http://${data.local_file.private_ip.content}:8000/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;

    }


}

# server {
#     listen 80;
#     server_name $DUMPSTER_DOMAIN_NAME;

#     # Redirect HTTP to HTTPS
#     return 301 https://\$host\$request_uri;
# }

# server {
#     listen 443 ssl http2;
#     server_name $DUMPSTER_DOMAIN_NAME;

#     # SSL configuration
#     ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;
#     ssl_trusted_certificate /etc/letsencrypt/live/$DOMAIN_NAME/chain.pem;

#     # Your static file and API configuration
#     location / {
#         root /var/www/dumpster;
#         index index.html;
#         try_files \$uri /index.html;
#     }

#     location /api/ {
#         # Use the container's private IP address dynamically
#         proxy_pass http://${data.local_file.private_ip.content}:8000/api/;
#         proxy_set_header Host \$host;
#         proxy_set_header X-Real-IP \$remote_addr;
#         proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;

#     }


# }
EOT

# Reload NGINX to apply changes
sudo ln -s /etc/nginx/sites-available/gladiolen /etc/nginx/sites-enabled/
sudo nginx -t | sudo tee ~/nginx-config-test > /dev/null
sudo systemctl reload nginx

# Set up a cron job to renew certificates automatically
# staging
#echo "0 0 1 * * certbot renew --non-interactive --no-self-upgrade --dns-cloudflare --dns-cloudflare-credentials ~/cloudflare-credentials --agree-tos --server https://acme-staging-v02.api.letsencrypt.org/directory  --email $EMAIL && systemctl reload nginx" | sudo tee /etc/cron.d/certbot-renew > /dev/null
# production
echo "0 0 1 * * certbot renew --non-interactive --no-self-upgrade --dns-cloudflare --dns-cloudflare-credentials ~/cloudflare-credentials --agree-tos --server https://acme-v02.api.letsencrypt.org/directory  --email $EMAIL && systemctl reload nginx" | sudo tee /etc/cron.d/certbot-renew > /dev/null


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
    source      = "../frontend/admin_dashboard/admin.zip"
    destination = "/home/ubuntu/admin.zip"

    connection {
      type        = "ssh"
      user        = "ubuntu"
      private_key = file(var.private_key_path)
      host        = aws_eip.nginx.public_ip
    }
  }

  provisioner "file" {
    source      = "../frontend/data_collectie/data.zip"
    destination = "/home/ubuntu/data.zip"

    connection {
      type        = "ssh"
      user        = "ubuntu"
      private_key = file(var.private_key_path)
      host        = aws_eip.nginx.public_ip
    }
  }




  provisioner "remote-exec" {

    inline = [
      "sudo mkdir -p /var/www/admin",
      "sudo mkdir -p /var/www/data",
      "sudo apt install unzip -y",
      "sudo unzip /home/ubuntu/admin.zip -d /var/www/admin",
      "sudo unzip /home/ubuntu/data.zip -d /var/www/data",
      # "sudo unzip /home/ec2-user/app3.zip -d /var/www/app3",
      "sudo chown -R www-data:www-data /var/www",
      "sudo chmod -R 755 /var/www",
      "sudo systemctl restart nginx.service || true" #suppress error, reload happens but terraform fails
    ]

    connection {
      type        = "ssh"
      user        = "ubuntu"
      private_key = file(var.private_key_path)
      host        = aws_eip.nginx.public_ip
    }
  }
  triggers = {
    always_run = "${timestamp()}" # This ensures the resource triggers every time
  }
}


# Create a CNAME record on cloudflare pointing to the DNS name of the internet facing loadbalancer

data "cloudflare_zone" "gladioforce" {
  name = var.cloudflare_domain
}

resource "cloudflare_record" "admin" {
  zone_id = data.cloudflare_zone.gladioforce.id
  name    = "admin"
  content = aws_eip.nginx.public_ip
  type    = "A"
  proxied = false



}

resource "cloudflare_record" "data" {
  zone_id = data.cloudflare_zone.gladioforce.id
  name    = "data"
  content = aws_eip.nginx.public_ip
  type    = "A"
  proxied = false

}

resource "cloudflare_record" "dumpster" {
  zone_id = data.cloudflare_zone.gladioforce.id
  name    = "dumpster"
  content = aws_eip.nginx.public_ip
  type    = "A"
  proxied = false

}


output "url_admin" {
  value = "${cloudflare_record.admin.name}.${var.cloudflare_domain}"
}

output "url_data" {
  value = "${cloudflare_record.data.name}.${var.cloudflare_domain}"
}

output "url_dumpster" {
  value = "${cloudflare_record.dumpster.name}.${var.cloudflare_domain}"
}







