FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/target/inventory-api-1.0.0.jar /app/inventory-api.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/inventory-api.jar"]
