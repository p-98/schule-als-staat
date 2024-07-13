import { memo } from "react";
import { Card, CardHeader, CardContent } from "Components/material/card";

import { DisplayInfo } from "Components/displayInfo/displayInfo";
import { name, tyqe } from "Utility/data";
import { FragmentType, graphql, useFragment } from "Utility/graphql";

export const UserInfo_UserFragment = graphql(/* GraphQL */ `
    fragment UserInfo_UserFragment on User {
        type
        id
        ...Name_UserFragment
    }
`);

const userTypeIcons = {
    CITIZEN: "person",
    GUEST: "person_outline",
    COMPANY: "domain",
};
interface UserInfoProps {
    user: FragmentType<typeof UserInfo_UserFragment>;
}
export const UserInfo: React.FC<UserInfoProps> = memo(({ user: _user }) => {
    const user = useFragment(UserInfo_UserFragment, _user);
    return (
        <Card>
            <CardHeader>Benutzerinformationen</CardHeader>
            <CardContent>
                <DisplayInfo
                    icon="group"
                    label="Benutzerklasse"
                    value={tyqe(user.type)}
                />
                <DisplayInfo
                    icon={userTypeIcons[user.type]}
                    label="Benutzername"
                    value={user.id}
                />
                <DisplayInfo icon="badge" label="Name" value={name(user)} />
            </CardContent>
        </Card>
    );
});
