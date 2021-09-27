import { List, SimpleListItem } from "@rmwc/list";
import Link from "next/link";

// list imports
import "@material/list/dist/mdc.list.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

import routingObj from "Utility/routing";

export const Navigation: React.FC = () => (
    <List>
        {routingObj.map((generator) => {
            const { label, href, icon } = generator();

            return (
                // prefetching is disabled because it would load literally every page
                <Link href={href} passHref prefetch={false} key={label}>
                    <SimpleListItem graphic={icon} text={label} />
                </Link>
            );
        })}
    </List>
);
