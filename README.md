# Demonstration server that use scoopit-api crate.

## Building 

If you have the rust toolchain installed and you want to run it locally, build it with:
```shell
cargo build --release
```

Alternatively a docker build image is provided:
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
