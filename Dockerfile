FROM eclipse-temurin:25-jdk

WORKDIR /app

COPY backend/mvnw .
COPY backend/.mvn .mvn
COPY backend/pom.xml .

RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

COPY backend/src src

RUN ./mvnw clean package -DskipTests

EXPOSE 10000

CMD ["sh", "-c", "java -jar target/lifeos-0.0.1-SNAPSHOT.jar --server.port=${PORT:-10000}"]