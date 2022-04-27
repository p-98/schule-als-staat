import { Knex } from "knex";

export interface ISession {
    id: string;
    user: string | null;
}

declare module "knex/types/tables" {
    interface Tables {
        sessions: Knex.CompositeTableType<
            ISession,
            Pick<ISession, "id"> & Partial<Pick<ISession, "user">>,
            Partial<Omit<ISession, "id">>
        >;
    }
}
