# Stage 1: Build the project
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies separately to take advantage of Docker's caching mechanism
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest of the application code and the .env file
COPY . .
COPY .env .env

# Build the project
RUN yarn build

# Stage 2: Setup the serve environment
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY --from=builder /app/dist .

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy .env file to the final image if needed by the frontend
COPY --from=builder /app/.env .

# Expose the port that nginx will listen on
EXPOSE 9005

# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]
