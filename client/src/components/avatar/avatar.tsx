import { minidenticon } from "minidenticons";
import { pick } from "lodash/fp";
import { memo, useMemo } from "react";
import { IconSizeT } from "@rmwc/types";
// import { Avatar as RmwcAvatar } from "Components/material/avatar";

import { graphql, useFragment, type FragmentType } from "Utility/graphql";
// import { name } from "Utility/data";

const Avatar_UserFragment = graphql(/* GraphQL */ `
    fragment Avatar_UserFragment on User {
        type
        id
        ...Name_UserFragment
    }
`);

interface IAvatarProps {
    user: FragmentType<typeof Avatar_UserFragment>;
    size?: IconSizeT;
    square?: boolean;
    className?: string;
}
export const Avatar = memo<IAvatarProps>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ user: _user, size = "large", square, className }) => {
        const user = useFragment(Avatar_UserFragment, _user);

        const url = useMemo(() => {
            const userSignature = JSON.stringify(pick(["type", "id"], user));
            const icon = minidenticon(userSignature);
            const uri = `data:image/svg+xml;utf8,${encodeURIComponent(icon)}`;
            // const svg = `<svg viewBox="-1.5 -1.5 8 8" xmlns="http://www.w3.org/2000/svg" fill="purple"><rect x="0" y="1" width="1" height="1"/><rect x="0" y="2" width="1" height="1"/><rect x="0" y="3" width="1" height="1"/><rect x="0" y="4" width="1" height="1"/><rect x="1" y="3" width="1" height="1"/><rect x="2" y="1" width="1" height="1"/><rect x="4" y="1" width="1" height="1"/><rect x="4" y="2" width="1" height="1"/><rect x="4" y="3" width="1" height="1"/><rect x="4" y="4" width="1" height="1"/><rect x="3" y="3" width="1" height="1"/></svg>`;
            // const svg = `<svg xmlns="http://www.w3.org/2000/svg"/>`;
            // const uri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
            return uri;
        }, [user]);

        return (
            <div
                className={className}
                style={{
                    backgroundSize: "cover",
                    background: `url('${url}'), #fff`,
                }}
            />
        );
        // TODO: make rmwc avatars work
        // Setting the image as background-image fails when setting fill="hsl(...)" on the root svg element
        // return (
        //     <RmwcAvatar
        //         src={src}
        //         size={size}
        //         square={square}
        //         name={name(user)}
        //     />
        // );
    }
);
