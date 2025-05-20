# Use the official Node.js 20 image as the base image
FROM node:20-alpine AS base

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Use the official Node.js 20 image for the production environment
FROM node:20-alpine AS production

# Set the working directory
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev --legacy-peer-deps

# Expose the port Next.js listens on
EXPOSE 3000

# Set the environment variable for production
ENV NODE_ENV production

# Command to start the Next.js server
CMD ["npm", "start"]
