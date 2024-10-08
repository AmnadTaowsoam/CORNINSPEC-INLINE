# Stage 1: Build environment
FROM python:3.10-slim as builder

# Set the working directory in the builder stage
WORKDIR /app

# Set environment variables to ensure Python outputs are sent straight to terminal without buffering
ENV PYTHONUNBUFFERED=1

# Copy the requirements file into the builder stage
COPY requirements.txt .

# Create a virtual environment and install dependencies from the requirements file
RUN python -m venv /venv && \
    /venv/bin/pip install --upgrade pip && \
    /venv/bin/pip install --no-cache-dir --default-timeout=1000 -r requirements.txt

# Stage 2: Final application image
FROM python:3.10-slim

# Set the working directory to /app
WORKDIR /app

# Install system dependencies required for general operations and OpenCV
# Note: Additional libraries for OpenCV
RUN apt-get update && \
    apt-get install -y libpq5 libgl1-mesa-glx libglib2.0-0 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copy the virtual environment from the builder stage
COPY --from=builder /venv /venv

# Copy the application files into the container
COPY . .

# Make sure scripts in the virtual environment are executable
ENV PATH="/venv/bin:$PATH"

# Define the command to run the app using Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "9001", "--workers", "4"]
