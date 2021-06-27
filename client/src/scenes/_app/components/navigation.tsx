import { List, SimpleListItem } from "@rmwc/list";
import { useRef, useEffect } from "react";
import Link from "next/link";

// list imports
import "@material/list/dist/mdc.list.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

import routingObj from "Utility/routing";

const Navigation: React.FC = () => {
    const ref = useRef(null);

    useEffect(() => {
        console.log(ref);
    });

    return (
        <List>
            {routingObj.map((generator) => {
                const { label, href, icon } = generator();

                return (
                    // prefetching is disabled because it would load literally every page
                    <Link href={href} passHref prefetch={false}>
                        <SimpleListItem
                            graphic={icon}
                            text={label}
                            key={label}
                        />
                    </Link>
                );
            })}
        </List>
    );
};
export default Navigation;
