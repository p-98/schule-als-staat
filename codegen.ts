import type { CodegenConfig } from "@graphql-codegen/cli";

const sharedConfig = {
    skipTypename: true,
    enumsAsTypes: true,
    useTypeImports: true,
    strictScalars: true,
    scalars: {
        DateTimeISO: "string",
        Void: "void",
        File: "@whatwg-node/fetch#File",
    },
};

const sharedClientPresetConfig = {
    ...sharedConfig,
    emitLegacyCommonJSImports: true,
    arrayInputCoercion: false,
};

const config: CodegenConfig = {
    overwrite: true,
    schema: "schema.graphql",
    generates: {
        "./server/__test__/graphql/": {
            documents: ["server/__test__/*.test.ts", "server/src/util/test.ts"],
            preset: "client-preset",
            presetConfig: {
                fragmentMasking: false,
            },
            config: sharedClientPresetConfig,
        },
        "./server/src/types/schema.ts": {
            plugins: ["typescript", "typescript-resolvers"],
            config: {
                ...sharedConfig,
                contextType: "../server#IContext",
                typesPrefix: "T",
                useIndexSignature: true,
                extractAllFieldsToTypes: true,
                mappers: {
                    Author: "./models#IAuthorModel",
                    Book: "./models#IBookModel",
                    Session: "./models#ISessionModel",
                    GuestUser: "./models#IGuestUserModel",
                    CitizenUser: "./models#ICitizenUserModel",
                    CompanyUser: "./models#ICompanyUserModel",
                    CompanyStatsFragment: "./models#ICompanyStatsFragmentModel",
                    Worktime: "./models#IWorktimeModel",
                    Employment: "./models#IEmploymentModel",
                    EmploymentOffer: "./models#IEmploymentOfferModel",
                    TransferTransaction: "./models#ITransferTransactionModel",
                    ChangeTransaction: "./models#IChangeTransactionModel",
                    ChangeDraft: "./models#IChangeDraftModel",
                    PurchaseTransaction: "./models#IPurchaseTransactionModel",
                    PurchaseDraft: "./models#IPurchaseDraftModel",
                    PurchaseItem: "./models#IPurchaseItemModel",
                    CustomsTransaction: "./models#ICustomsTransactionModel",
                    SalaryTransaction: "./models#ISalaryTransactionModel",
                    BorderCrossing: "./models#IBorderCrossingModel",
                    Product: "./models#IProductModel",
                    ProductStatsFragment: "./models#IProductStatsFragmentModel",
                    Vote: "./models#IVoteModel",
                    Card: "./models#ICardModel",
                },
            },
        },
    },
};

export default config;
