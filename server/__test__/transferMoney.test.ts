import { test, beforeEach, afterEach } from "@jest/globals";
import { assert } from "chai";
import {
    assertNoErrors,
    assertSingleValue,
    buildHTTPUserExecutor,
    assertInvalid,
    type TUserExecutor,
    createTestServer,
} from "Util/test";

import { omit, set } from "lodash/fp";
import { type ResultOf } from "@graphql-typed-document-node/core";
import { type TYogaServerInstance } from "Server";
import { type Knex } from "Database";
import { type TNullable } from "Types";
import { graphql } from "./graphql";

const transferTransactionFragment = graphql(/* GraphQL */ `
    fragment All_TransferTransactionFragment on TransferTransaction {
        id
        date
        sender {
            type
            id
        }
        receiver {
            type
            id
        }
        value
        purpose
    }
`);

const balanceAndTransactionsQuery = graphql(/* GraphQL */ `
    query BalanceAndTransferTransactions {
        meCitizen {
            balance
            transactions {
                ... on TransferTransaction {
                    ...All_TransferTransactionFragment
                }
            }
        }
    }
`);
const transferMoneyMutation = graphql(/* GraphQL */ `
    mutation TransferMoeny(
        $receiver: UserSignatureInput!
        $value: Float!
        $purpose: String
    ) {
        transferMoney(
            transfer: { receiver: $receiver, value: $value, purpose: $purpose }
        ) {
            ...All_TransferTransactionFragment
        }
    }
`);

type ITransferTransaction = ResultOf<typeof transferTransactionFragment>;
type ITransferState = ResultOf<typeof balanceAndTransactionsQuery>["meCitizen"];

let knex: Knex;
let yoga: TYogaServerInstance;
let sender: TUserExecutor;
let receiver: TUserExecutor;
let company: TUserExecutor;
let guest: TUserExecutor;
beforeEach(async () => {
    [knex, yoga] = await createTestServer();
    sender = await buildHTTPUserExecutor(knex, yoga, { type: "CITIZEN" });
    receiver = await buildHTTPUserExecutor(knex, yoga, { type: "CITIZEN" });
    company = await buildHTTPUserExecutor(knex, yoga, { type: "COMPANY" });
    guest = await buildHTTPUserExecutor(knex, yoga, { type: "GUEST" });
});
afterEach(async () => {
    await knex.destroy();
});

const assertTransferStates = (
    senderExpected: ITransferState,
    senderMessage: string,
    receiverExpected: ITransferState,
    receiverMessage: string
) => {
    const checks = [
        [sender, senderExpected, senderMessage],
        [receiver, receiverExpected, receiverMessage],
    ] as const;
    return Promise.all(
        checks.map(async ([user, expected, message]) => {
            const result = await user({
                document: balanceAndTransactionsQuery,
            });
            assertSingleValue(result);
            assertNoErrors(result);
            assert.deepStrictEqual(result.data.meCitizen, expected, message);
        })
    );
};

async function testTransferMoney(
    purpose: TNullable<string> = null
): Promise<ITransferTransaction> {
    const input = {
        receiver: receiver.signature,
        value: 5.0,
        purpose,
    };

    await assertTransferStates(
        { balance: 10.0, transactions: [] },
        "Values should be initial before transfer.",
        //
        { balance: 10.0, transactions: [] },
        "Values should be initial before transfer."
    );

    // invalid requests
    const guestReceiverType = await sender({
        document: transferMoneyMutation,
        variables: set("receiver.type", "GUEST", input),
    });
    assertInvalid(guestReceiverType, "TRANSFER_RECEIVER_RESTRICTED");
    const companyReceiverType = await sender({
        document: transferMoneyMutation,
        variables: set("receiver.type", "COMPANY", input),
    });
    assertInvalid(companyReceiverType, "TRANSFER_RECEIVER_RESTRICTED");
    const invalidReceiverId = await sender({
        document: transferMoneyMutation,
        variables: set("receiver.id", "invalidCitizenId", input),
    });
    assertInvalid(invalidReceiverId, "USER_NOT_FOUND");
    const companySenderType = await company({
        document: transferMoneyMutation,
        variables: input,
    });
    assertInvalid(companySenderType, "TRANSFER_SENDER_RESTRICTED");
    const guestSenderType = await guest({
        document: transferMoneyMutation,
        variables: input,
    });
    assertInvalid(guestSenderType, "TRANSFER_SENDER_RESTRICTED");
    const negativeValue = await sender({
        document: transferMoneyMutation,
        variables: set("value", -1.0, input),
    });
    assertInvalid(negativeValue, "BAD_USER_INPUT");
    const zeroValue = await sender({
        document: transferMoneyMutation,
        variables: set("value", 0, input),
    });
    assertInvalid(zeroValue, "BAD_USER_INPUT");
    const tooHighValue = await sender({
        document: transferMoneyMutation,
        variables: set("value", 11, input),
    });
    assertInvalid(tooHighValue, "BALANCE_TOO_LOW");

    // valid request
    const before = new Date();
    const transferMoney = await sender({
        document: transferMoneyMutation,
        variables: input,
    });
    const after = new Date();
    assertSingleValue(transferMoney);
    assertNoErrors(transferMoney);
    const transaction = transferMoney.data.transferMoney;
    assert.deepStrictEqual(omit(["id", "date"], transaction), {
        sender: sender.signature,
        receiver: receiver.signature,
        value: input.value,
        purpose: input.purpose,
    });
    assert.isAtLeast(new Date(transaction.date).getTime(), before.getTime());
    assert.isAtMost(new Date(transaction.date).getTime(), after.getTime());

    await assertTransferStates(
        { balance: 5.0, transactions: [transaction] },
        "Balance should be decreased and transaction present.",
        //
        { balance: 15.0, transactions: [transaction] },
        "Balance should be increased and transaction present."
    );

    // no invalid requests after transfer

    return transaction;
}

test("transferMoney with purpose", () => testTransferMoney("Here we go"));
test("transferMoney without purpose", () => testTransferMoney());
