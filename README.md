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
    $ bun scripts/create-test-db.ts
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

### Manual sql queries

With the server running, you can still run sql queries against the database. You should know what you are doing and create a backup before though!
The following pragma should be set:

```sql
PRAGMA journal_mode = WAL;
```

**Caveats**: You can start long-lasting read-transactions in WAL mode, but you cannot do long-lasting write transactions.
I.e., if you open sqlite3 via cli, start a transaction via `BEGIN TRANSACTION`, do a write query and then want to see whether your query had the desired effect before commiting, requests to the server will start getting rejected with internal server errors after 5 seconds. They will recover when the transaction is commited.<br/>
Short transactions for example using scripts are fine though, in this case sqlite just retries until the database is free.
