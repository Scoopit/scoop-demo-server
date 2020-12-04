# Demonstration server that use scoopit-api crate.



## Building 

If you have the rust toolchain installed and you want to run it locally, run it with:
```shell
# build
cargo build --release
# run the executable
target/release/scoop-demo-server
```

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

## Prebuilt binaries

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
