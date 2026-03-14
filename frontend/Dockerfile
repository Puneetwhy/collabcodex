# Use official Node.js LTS Alpine image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) first
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the project files
COPY . .

# Expose Vite default port
EXPOSE 5173

# Start development server on all network interfaces
CMD ["npm", "run", "dev", "--", "--host"]