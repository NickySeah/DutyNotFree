# Stage 1: Build the application
FROM maven:3.9-eclipse-temurin-21 AS build

# Set working directory
WORKDIR /app

# Copy the pom.xml and download dependencies (this layer is cached)
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
COPY mvnw.cmd .

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy the source code
COPY src ./src

# Build the application (skip tests for faster builds)
RUN ./mvnw clean package -DskipTests

# Stage 2: Create the runtime image
FROM eclipse-temurin:21-jre-alpine

# Set working directory
WORKDIR /app

# Copy the JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port your Spring Boot app runs on
EXPOSE 3001

# Set environment variables (these can be overridden by docker-compose)
# ENV SPRING_PROFILES_ACTIVE=prod
# ENV DB_HOST=productdb
# ENV DB_PORT=3306
# ENV DB_NAME=productdb

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]