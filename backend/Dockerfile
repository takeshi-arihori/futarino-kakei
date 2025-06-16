# --- Build Stage ---
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Copy Go modules and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server ./cmd/server

# --- Final Stage ---
FROM alpine:latest

WORKDIR /app

# Copy the built binary from the builder stage
COPY --from=builder /app/server .
COPY --from=builder /app/migrations ./backend/migrations
RUN chmod +x ./server
RUN ls -l /app

# Expose port 8080 to the outside world
EXPOSE 8080

# Command to run the executable
CMD ["./server"]
