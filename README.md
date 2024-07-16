# schule-als-staat

-   **🔋 batteries included**: All in one system for a digital currency, attendance tracking, etc.
-   **🎛️ open & configurable**: Easy configuration and new ideas welcome
-   **🚀 reliable**: Successfully used by SaS 2024 @ MPG Karlsruhe

## Features

-   **💳 id card**: combine id and credit card via QR code
-   **🛃 border control**: charge customs & track attendance
-   **🏦 bank**: exchange currencies
-   **🛒 point of sale**: sell products digitally
-   **💸 online banking**: transfer money and pay employees
-   **⚙ admin panel**: reset passwords, backup database, etc.

## Status

**Server**: Finished. Unit-grade testing on node lts/hydrogen.

**Client**: Features above finished. Mockups for further features like voting,
emplyoee tracking, financial statistics for companies and warehouse management exist.
No automated testing, tested on Chrome.

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

To start a production environment:

1. Remove the existing database (if present), create an empty database and import data:

    ```shell
    $ rm -f database.sqlite3* && bun scripts/create-empty-db.ts
    $ bun scripts/import-users.ts ...
    ```

    Run `bun scripts/import-users.ts --help` to get more information on imports.

2. Start the production server:

    ```shell
    $ bun run build-server
    $ bun run start-server
    ```

3. In another terminal, start production client:
    ```shell
    $ bun run build-client
    $ bun run start-client
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

### BGE

```shell
$ bun scripts/get-citizens | jq -f scripts/bge-prepare.jq | bun batch-transaction.ts
```
