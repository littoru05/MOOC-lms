# Build stage
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy dependency definition and pre-fetch dependencies for better build caching
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and build the executable jar
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run with non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

RUN mkdir -p /app/uploads && chmod -R 777 /app/uploads

# Copy built jar from builder stage
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-Xmx300m", "-Xms150m", "-XX:+ExitOnOutOfMemoryError", "-jar", "app.jar"]