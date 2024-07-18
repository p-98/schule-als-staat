import { ResultOf } from "@graphql-typed-document-node/core";
import { createContext, type FC, memo, type ReactNode } from "react";
import { FragmentType, graphql, useFragment } from "Utility/graphql";

const Session_SessionFragment = graphql(/* GraphQL */ `
    fragment Session_SessionFragment on Session {
        user {
            type
            id
        }
    }
`);
type SessionUser = ResultOf<typeof Session_SessionFragment>["user"];
/** The current session user
 *
 * Can be used for example to display ui conditionally depending on user type.
 */
export const sessionUserCtx = createContext<SessionUser | null>(null);
const SessionUserCtx = sessionUserCtx;

interface SessionUserProviderProps {
    children: ReactNode;
    value: FragmentType<typeof Session_SessionFragment>;
}
export const SessionUserProvider: FC<SessionUserProviderProps> = memo(
    ({ children, value: _value }) => {
        const value = useFragment(Session_SessionFragment, _value).user;
        return (
            <SessionUserCtx.Provider value={value}>
                {children}
            </SessionUserCtx.Provider>
        );
    }
);
