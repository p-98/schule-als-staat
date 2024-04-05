import { graphql } from "Utility/graphql";

export {
    InputPassword_UserFragment as AuthUser_UserFragment,
    type IInputPasswordProps as IAuthUserProps,
    InputPassword as AuthUser,
} from "./components/inputPassword";

export const defaultMutation = graphql(/* GraphQL */ `
    mutation AuthUserMutation($type: UserType!, $id: ID!, $password: String) {
        login(credentials: { type: $type, id: $id, password: $password }) {
            __typename
        }
    }
`);
