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

```plaintext
sudo docker-compose up --build -d
```

### Connect to Mysql Container (password = "root")

```plaintext
sudo docker exec -it custom-mysql mysql -u root -p
```

### Shut Down container

```plaintext
sudo docker-compose stop
```

### Remove container

```plaintext
sudo docker-compose down
```

### Restart container (detached mode)

```plaintext
sudo docker-compose up -d
```

## Troubleshooting

### Steps to Ensure a New Image is Built

Clear Docker Cache Docker caches images to speed up builds, so you might be encountering a cached image during the build process. To ensure a fresh build, run:

```plaintext
sudo docker builder prune --all
```

This command removes all unused build cache and intermediate images, ensuring that the next build is fresh.

Check for docker-compose.yml Image References Ensure that your docker-compose.yml file is not referencing an image from a registry (like Docker Hub) that may already exist. If you see a line like this:

image: my_image:latest

Docker Compose will try to pull that image from the registry instead of building a new one. Either remove the image: field or ensure that the build: context is correctly defined.

Force Rebuild with --no-cache Docker Compose has a --no-cache option that forces a rebuild of the image without using the cache. You can run:

```plaintext
docker-compose build --no-cache
```

This will rebuild the images from scratch without using any cached layers from previous builds.

Verify with docker images After running the build, you can verify the images by running:

docker images

This will show all the Docker images available on your system. Ensure that the new image is listed and that the timestamp reflects a new build time.

Remove Any Existing Containers or Images (Optional) If any containers or images remain from previous runs, remove them manually:

```plaintext
sudo docker container prune -f
sudo docker image prune -a -f
```

This will remove all stopped containers and unused images.

Rebuild the Image After cleaning the cache and ensuring no old image references are present, try rebuilding again:

```plaintext
sudo docker-compose up --build
```

    This should ensure a completely fresh build.

Summary

    Use docker builder prune --all to remove build cache.
    Ensure docker-compose.yml isn't pulling an existing image.
    Use docker-compose build --no-cache to force a fresh build.
    Optionally clean up old containers and images with prune commands.
