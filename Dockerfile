# Stable
FROM rust:latest as build

RUN cargo --version

# Build Dependancies
WORKDIR /build
RUN USER=root cargo new --bin app
WORKDIR /build/app
COPY Cargo.toml .
COPY Cargo.lock .
RUN cargo build --release

# Build Application
RUN rm src/*.rs
RUN rm ./target/release/deps/app
COPY src/ src/
RUN cargo build --release

# Build Run
FROM debian:stable-slim AS run
COPY --from=builder /build/app/target/release/app app
ENTRYPOINT ["./app"]
