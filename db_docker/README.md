# Custom MySQL Setup with Docker Compose

This project demonstrates how to build a custom MySQL image using Docker Compose and launch the containerized database server.

## Prerequisites

Before you start, ensure you have the following installed on your machine:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Project Structure

The repository includes the following files:

```plaintext
.
├── Dockerfile                # Builds the custom MySQL image
├── docker-compose.yml        # Defines the MySQL service
├── my.cnf                    # Custom MySQL configuration file
└── README.md                 # Instructions
```

## For login information --> check docker-compose.yml

## Commands:

### Build the Docker Image (detached mode)

sudo docker-compose up --build -d

### Connect to Mysql Container (password = "root")

sudo docker exec -it custom-mysql mysql -u root -p

### Shut Down container

sudo docker-compose stop

### Remove container

sudo docker-compose down

### Restart container (detached mode)

sudo docker-compose up -d
