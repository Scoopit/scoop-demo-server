# Stable
FROM rust:latest as scoop-demo-server-builder

RUN cargo --version

# Build Dependancies
WORKDIR /build
RUN USER=root cargo new --bin app
WORKDIR /build/app
COPY Cargo.toml .
COPY Cargo.lock .
RUN cargo build --release

# Build Application
RUN rm -rf src/
COPY src src
RUN rm target/release/deps/scoop_demo_server*
RUN cargo build --release

# Build Run
FROM debian:stable-slim AS run
RUN apt-get update && apt-get install -y openssl ca-certificates
COPY --from=scoop-demo-server-builder /build/app/target/release/scoop-demo-server scoop-demo-server
ENTRYPOINT ["./scoop-demo-server"]
