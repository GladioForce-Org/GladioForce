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


# Set the default command to run the Django server --> only when deploying to ECR (without Docker compose)
# CMD ["bash", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]