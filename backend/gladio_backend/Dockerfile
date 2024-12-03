##Django Dockerfile##

# Use Python 3.10 image
FROM python:3.10

WORKDIR /app

# Install dependencies
COPY requirements.txt /app
RUN pip install --no-cache-dir -r requirements.txt


# Copy Django app code
COPY . .

# Start django server

# Expose the application on port 8000
EXPOSE 8000
