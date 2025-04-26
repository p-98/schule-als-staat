import { command, flag, number, option, boolean, run, string } from "cmd-ts";
import crypto from "crypto";
import { createKnex, type Knex } from "../server/src/database/database";
import { times } from "lodash/fp";
import config from "../config";
import { writeFile } from "fs/promises";

const description = `Create a number of guest cards in the database and print their
 QR codes to console as a JSON array. Guest cards are scanned by border control when a guest enters the state. 
 Then there can be a name selected for the guest. When the guest leaves the state the card is scanned again and can be put back
 in the storage.`;

const cmd = command({
    name: "create-guest-cards",
    description,
    args: {
        quantity: option({
            type: number,
            short: "q",
            long: "quantity",
            description: "Number of guest accounts to create",
            defaultValue: () => 10,
        }),
        dryRun: flag({
            type: boolean,
            long: "dry-run",
            short: "d",
            description: "Check the data but do not import to the database.",
            defaultValue: () => false,
            defaultValueIsSerializable: true,
        }),
        output: option({
            type: string,
            short: "o",
            long: "output",
            description: "Output file path for the JSON data",
            defaultValue: () => "",
        }),
    },
    handler: (_) => _,
});

const { quantity, dryRun, output } = await run(cmd, process.argv.slice(2));

type Card = {
    id: string; //The QR code printed on the card
    blocked: boolean; //Whether the card is blocked (Newly created cards are not)
};

const alphanum =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const randomChar = (alphabet: string): string =>
    alphabet[crypto.randomInt(alphabet.length)]!;
const randomString = (length: number, alphabet: string) =>
    times(() => randomChar(alphabet), length).join("");

async function createQr(knex: Knex, card: Card) {
    await knex("cards").insert({
        id: card.id,
        // @ts-expect-error userSignature must be set initially
        userSignature: "",
        blocked: false,
    });
}

async function createGuestCards(quantity: number, outputPath: string) {
    let knex: Knex | undefined;
    try {
        [, knex] = await createKnex(config.database.file, {
            client: "sqlite3",
        });

        const cards: Card[] = times(() => {
            const id = randomString(8, alphanum);
            const blocked = false;
            return { id, blocked };
        }, quantity);

        if (!dryRun) {
            await Promise.all(cards.map((card) => createQr(knex!, card)));
        }

        const jsonOutput = JSON.stringify(
            cards.map((card) => card.id),
            null,
            2
        );
        console.log(jsonOutput);

        if (outputPath) {
            await writeFile(outputPath, jsonOutput);
            console.log(`Output written to ${outputPath}`);
        }
    } catch (error) {
        console.error("Error creating guest cards:", error);
        throw error;
    } finally {
        if (knex) {
            await knex.destroy();
        }
    }
}

console.log("Creating guests...");
await createGuestCards(quantity, output);
