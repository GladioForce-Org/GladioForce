#Using terraform in AWS

## AWS Credentials

1. Look up your AWS credentials
2. Create a .env file in the deploy folder
3.

```bash
#AWS Credentials
export AWS_ACCESS_KEY_ID=""
export AWS_SECRET_ACCESS_KEY=""
export AWS_SESSION_TOKEN=""
#Secrets
export TF_VAR_db_user_name=""
export TF_VAR_db_password=""
```

4. Load the environment variables when entering the "deploy" folder

```bash
set -o allexport; source /home/pieter/GladioForce/deploy/.env; set +o allexport
```

5. Install AWS CLI in your home folder (unzip, python3 needs to be installed)

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

7. Test AWS connection

```bash
pieter@windows:~/GladioForce/deploy$ aws ec2 describe-instances
{
"Reservations": []
}
```

8. Your connection to AWS is up & running

## Setup environment

### Create a dynamodb table for he state.lock

```bash
aws dynamodb create-table \
  --table-name gladiolen-gladioforce-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

Check if table was created.

```bash
aws dynamodb list-tables
```

### Create an S3 bucket for tfstate file

```bash
   aws s3api create-bucket --bucket gladioforce-tfstate --region us-east-1
```

### Perform terraform init

```bash
terraform init
```

The tfstate file will be preserved in the S3 bucket, allowing multiple developers to work on the same project.

### Adjust the .gitignore file of the project

[gitignore for Terraform](https://github.com/github/gitignore/blob/main/Terraform.gitignore)

Do not forget to include the .deploy/.envr file

## Test code

To test your code you can use the terraform plan command, when using a custom variables file you will have to declare it in the command.

```bash
terraform plan -var-file="00-project.tfvars"
```

### Pretty format of all the terraform files

```bash
terraform fmt
```

### Validating terraform config files

```bash
terraform validate -var-file="00-project.tfvars"
```

### Recreating a resource when it has been changed on AWS

```bash
terraform apply -var-file="00-project.tfvars"
```

### Destroy a certain resource

```bash
terraform destroy -var-file="00-project.tfvars"
```

### saving terraform plan to a file to create a backup

```bash
terraform plan -out backupplan  (is a binary file)
terraform apply backupplan
```

### ouput the output "variables" in the console

```bash
terraform ouput iam_arn
```

!! Outputs have to be declared first !!

## Gladiolen backend container

The container needs to be pushed to the ECR (Elastic container registry).

1. The acquire the ECR instance information:

```bash
aws ecr describe-repositories --region us-east-1
```

You need this information to adjust the <ECR-ID> in following commands

2. Login to the ECR instance and acquire credentials

```bash
aws ecr get-login-password --region us-east-1 | sudo docker login --username AWS --password-stdin 482617122788.dkr.ecr.us-east-1.amazonaws.com
```

3. Build container

```bash
sudo docker build -t gladioforce-backend /home/pieter/GladioForce/backend/gladio_backend
```

!! Make sure you adjust the Dockerfile to include the CMD command that is normally executed when using docker-compose,
just uncomment following line.

```bash
# CMD ["bash", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
```

4. Tag the container

```bash
sudo docker tag gladioforce-backend:latest 482617122788.dkr.ecr.us-east-1.amazonaws.com/gladioforce-backend:latest
```

5. Push the container to the ECR

```bash
sudo docker push 482617122788.dkr.ecr.us-east-1.amazonaws.com/gladioforce-backend:latest
```

6. Check if image has been pushed to ECR

```bash
aws ecr list-images --repository-name gladioforce-backend --region us-east-1
```
