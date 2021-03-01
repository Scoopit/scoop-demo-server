# Stable
FROM rust:latest as scoop-demo-server-builder

RUN cargo --version

# Build Dependencies
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

# Build frontend
FROM node:12 as scoop-demo-server-front-builder
WORKDIR /build
COPY front front
WORKDIR /build/front
RUN yarn
RUN yarn build
RUN echo Front build size: $(du -hs build)

# Build Run
FROM debian:stable-slim AS run
COPY --from=scoop-demo-server-builder /build/app/target/release/scoop-demo-server scoop-demo-server
COPY --from=scoop-demo-server-front-builder /build/front/build /www
ENV APP_STATIC_HTML=/www
ENTRYPOINT ["./scoop-demo-server"]
