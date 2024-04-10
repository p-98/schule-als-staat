# schule-als-staat

This project's intention is to provide an all-in-one digital system for the project "Schule als Staat" with features such as a digital currency, voting, warehouse management and more.

## Status

Server: Finished and tested. Only tested on node lts/hydrogen.

Client: Code mockup, linking to server in progress. Only tested on Chrome.

## Installation

Prerequisites: [bun](https://bun.sh/), node lts/hydrogen (e.g. via [nvm](https://github.com/nvm-sh/nvm))

```shell
$ git clone https://github.com/p-98/schule-als-staat
$ cd schule-als-staat
$ bun install
```

## Usage

To start the preview:

1. Initialize database with test-data:
    ```shell
    $ bun examples/create-test-db.ts
    ```
2. Start development server:
    ```shell
    $ bun run dev-server
    ```
3. In another terminal, start development client:
    ```shell
    $ bun run dev-client
    ```
4. Open [`127.0.0.1:3000`](127.0.0.1:3000) in your browser. (Opening `localhost:3000` won't work!)
