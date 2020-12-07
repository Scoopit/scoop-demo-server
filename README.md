# Demonstration server that use scoopit-api crate.



## Building 

### Development

You need the Rust toolchain to build the backend, `yarn` and `nodejs` 12+ to build the frontend.

Build and run the backend:
```shell
cargo run
```

The backend needs environments variables in order to find your API credentials ; you may want to create a `.env` file
at the root of the project containing:
```
APP_CLIENT_ID=ABCDEF_MY_KEY
APP_CLIENT_SECRET=GHIYJ_MY_SECRET
APP_BIND_ADDRESS="[::]:5001"
RUST_LOG=info
```

Then, build and run the frontend
```shell
cd front
yarn start
```


### Build for production

```shell
# build
cargo build --release
cd front
yarn build
```

When running the produced backend binary you need to set the `APP_STATIC_HTML` environment variable to tell the backend
to server frontend files.


Alternatively you can use the provided Dockerfile:
```shell
# build the image
docker build -t scoop-demo-server .

# run the image with correct args
docker run -p 5001:5001 \
  -e RUST_LOG=info \
  -e APP_BIND_ADDRESS=0.0.0.0:5501 \
  -e APP_CLIENT_ID=my_client_id \
  -e APP_CLIENT_SECRET=my_secret \
  scoop-demo-server
```


## Prebuilt Docker image

A docker image is provided containing the latest build for this demo server: `zenria/scoop-demo-server`.

```
docker run -p 5001:5001 \
  -e RUST_LOG=info \
  -e APP_BIND_ADDRESS=0.0.0.0:5501 \
  -e APP_CLIENT_ID=my_client_id \
  -e APP_CLIENT_SECRET=my_secret \
  zenria/scoop-demo-server
```


## Configuration parameters

Configuration are read from environment variables.
- `APP_BIND_ADDRESS` bind address
- `APP_CLIENT_ID` oauth client id
- `APP_CLIENT_SECRET` oauth secret id
- `RUST_LOG` logging configuration see [`env_logger`](https://docs.rs/env_logger/0.8.2/env_logger/)

If a `.env` file is present in the current directory or its parents environments variables declared in
it will expand the current environment.

## License

Licensed under either of

 * Apache License, Version 2.0
   ([LICENSE-APACHE](LICENSE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)
 * MIT license
   ([LICENSE-MIT](LICENSE-MIT) or http://opensource.org/licenses/MIT)

at your option.

## Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall be
dual licensed as above, without any additional terms or conditions.
