# Step 1: Build the Vite app
FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Pass the backend API URL as a build argument
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Step 2: Serve the app using a lightweight server
FROM node:20-slim

WORKDIR /app

RUN npm install -g serve

# Copy built files from the build stage
COPY --from=build /app/dist ./dist

EXPOSE 80

# Serve on port 80
CMD ["serve", "-s", "dist", "-l", "80"]
