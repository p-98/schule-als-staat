import React, {
    HTMLAttributes,
    useCallback,
    useEffect,
    useRef,
    useState,
    TransitionEvent,
} from "react";
import cn from "classnames";
import { GridCell } from "@rmwc/grid";
import { ListDivider, SimpleListItem } from "@rmwc/list";
import { Avatar } from "@rmwc/avatar";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// list imports
import "@material/list/dist/mdc.list.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// avatar imports
import "@rmwc/avatar/avatar.css";
// import "@rmwc/icon/icon.css";
// import "@material/ripple/dist/mdc.ripple.css";

// local
import { GridPage } from "Components/page/page";
import { Card, CardHeader, CardListContent } from "Components/card/card";
import { parseCurrency } from "Utility/parseCurrency";
import { AddOfferFab } from "./addOfferFab";

import styles from "../employees.module.scss";

const users = ["Max Mustermann", "Ute Keipl", "Jens van Diesel"];

interface IDiscardListItemProps extends HTMLAttributes<HTMLLIElement> {
    name: string;
    onDiscard: (event: { preventAnimation: () => void }) => void;
    /** only called if animation was not prevented */
    onDiscarded: () => void;
}
const DiscardListItem: React.FC<IDiscardListItemProps> = ({
    name,
    onDiscard,
    onDiscarded,
    className,
    onTransitionEnd,
    ...restProps
}) => {
    const [discard, setDiscard] = useState(false);

    return (
        <SimpleListItem
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            className={cn(
                className,
                styles["offers__discard-list-item"],
                discard && styles["offers__discard-list-item--discard"]
            )}
            graphic={<Avatar src="profile.jpg" name={name} />}
            text={name}
            key={name}
            secondaryText={`5h\u00A0\u00A0\u2022\u00A0\u00A0${parseCurrency(
                13.543
            )}/h`}
            metaIcon={{
                icon: "close",
                onClick: () => {
                    let animate = true;
                    onDiscard({
                        preventAnimation: () => {
                            animate = false;
                        },
                    });
                    if (animate) setDiscard(true);
                },
            }}
            onTransitionEnd={(e) => {
                onTransitionEnd?.(e as TransitionEvent<HTMLLIElement>);

                if (e.propertyName !== "height") return;
                onDiscarded();
            }}
        />
    );
};

export const Offers: React.FC<HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...restProps
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    const [rejected, setRejected] = useState(users);
    const [showFab, setShowFab] = useState(false);

    // fade out part 1
    const fadeOutRejected = useCallback(() => {
        const cardDOM = cardRef.current as HTMLDivElement;
        const dividerDOM = cardDOM.children[2] as HTMLLIElement;
        const rejectedListDOM = cardDOM.children[3] as HTMLDivElement;

        const targetHeight = dividerDOM.offsetTop;

        cardDOM.style.height = `${cardDOM.getBoundingClientRect().height}px`;
        requestAnimationFrame(() => {
            cardDOM.style.height = `${targetHeight}px`;
            // doesn't need cleanup, because node is unmounted afterwards
            rejectedListDOM.style.opacity = "0";
        });
        // use ontransitionend so the callback is overwritten if called twice
        cardDOM.ontransitionend = (e) => {
            if (e.propertyName !== "height") return;
            setRejected([]);
        };
    }, []);

    // fade out part 2, executed on next render
    useEffect(() => {
        if (rejected.length > 0) return;

        const cardDOM = cardRef.current as HTMLDivElement;
        cardDOM.style.height = "";
    }, [rejected]);

    // handle fab visibility
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries[0]) return;
                setShowFab(entries[0].intersectionRatio > 0.5);
            },
            {
                threshold: 0.5,
            }
        );

        observer.observe(ref.current as HTMLElement);
        return () => observer.disconnect();
    }, []);

    return (
        <GridPage
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            className={cn(styles["employees__page"], className)}
            ref={ref}
        >
            <GridCell desktop={3} tablet={1} phone={0} key="ph1" />
            <GridCell span={6} key="content">
                <Card
                    ref={cardRef}
                    className={cn(
                        styles["offers__card"],
                        rejected.length === 1 &&
                            styles["offers__card--expect-collapse"]
                    )}
                >
                    <CardHeader>Vertragsangebote</CardHeader>
                    <CardListContent caption="Ausstehend" twoLine>
                        {users.map((name) => (
                            <SimpleListItem
                                graphic={
                                    <Avatar src="profile.jpg" name={name} />
                                }
                                text={name}
                                key={name}
                                secondaryText={`5h\u00A0\u00A0\u2022\u00A0\u00A0${parseCurrency(
                                    13.543
                                )}/h`}
                            />
                        ))}
                    </CardListContent>
                    {rejected.length > 0 && (
                        <>
                            <ListDivider />
                            <CardListContent
                                caption="Abgelehnt"
                                twoLine
                                className={styles["offers__rejected-list"]}
                            >
                                {rejected.map((name) => (
                                    <DiscardListItem
                                        name={name}
                                        onDiscard={(e) => {
                                            if (rejected.length !== 1) return;
                                            e.preventAnimation();
                                            fadeOutRejected();
                                        }}
                                        onDiscarded={() =>
                                            setRejected(
                                                rejected.filter(
                                                    (_name) => _name !== name
                                                )
                                            )
                                        }
                                        key={name}
                                    />
                                ))}
                            </CardListContent>
                        </>
                    )}
                </Card>
            </GridCell>
            <GridCell desktop={3} tablet={1} phone={0} key="ph2" />
            <AddOfferFab exited={!showFab} />
        </GridPage>
    );
};
