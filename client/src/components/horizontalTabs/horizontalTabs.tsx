import React, { useEffect, useRef, useState } from "react";
import { TabBar, Tab } from "Components/material/tabs";
import cn from "classnames";

import styles from "./horizontalTabs.module.css";

export interface IHorizontalTabsProps
    extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactElement<IHorizontalTabsElementProps>[];
}
export const HorizontalTabs: React.FC<IHorizontalTabsProps> = ({
    children,
    className,
    ...restProps
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState(0);
    const [observe, setObserve] = useState(true);

    useEffect(() => {
        if (!observe) return;
        if (!containerRef.current) return;

        const observerOptions: IntersectionObserverInit = {
            threshold: 0.5,
            root: containerRef.current,
        };
        const observerCallback: IntersectionObserverCallback = (entries) => {
            entries.forEach((tabEntry) => {
                if (tabEntry.intersectionRatio < 0.5) return;

                const tabCollection = tabEntry.target.parentNode?.children;
                if (!tabCollection) return;

                const tabIndex = Array.from(tabCollection).indexOf(
                    tabEntry.target
                );
                setActiveTab(tabIndex);
            });
        };
        const observer = new IntersectionObserver(
            observerCallback,
            observerOptions
        );
        // register all child elements
        Array.from(containerRef.current.children).forEach((tabBody) =>
            observer.observe(tabBody)
        );

        return () => {
            observer.disconnect();
        };
    }, [observe]);

    const scrollToTab = (newActiveTab: number): void => {
        if (!containerRef.current) return;

        const newActiveTabBody = containerRef.current.children[newActiveTab];
        if (!newActiveTabBody) return;

        // disable main observer until tab is scrolled into view (prevents bugs with TabBar changing activeTabIndex during scroll)
        setObserve(false);
        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries[0]) return;
                if (entries[0]?.intersectionRatio < 0.5) return;

                observer.disconnect();
                setObserve(true);
            },
            {
                root: containerRef.current,
                threshold: 0.5,
            }
        );
        observer.observe(newActiveTabBody);

        // scroll new tab into view
        setActiveTab(newActiveTab);
        newActiveTabBody.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
        });
    };

    return (
        <div
            {...restProps}
            className={cn(className, styles["horizontal-tabs"])}
        >
            <TabBar activeTabIndex={activeTab}>
                {children.map((tab, index) => (
                    <Tab
                        onClick={() => scrollToTab(index)}
                        key={tab.props.title}
                    >
                        {tab.props.title}
                    </Tab>
                ))}
            </TabBar>
            <div
                className={styles["horizontal-tabs__tab-container"]}
                ref={containerRef}
            >
                {children}
            </div>
        </div>
    );
};

export interface IHorizontalTabsElementProps {
    title: string;
    children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}
export const HorizontalTabsElement: React.FC<IHorizontalTabsElementProps> = ({
    children,
}: IHorizontalTabsElementProps) =>
    React.cloneElement(children, {
        className: cn(
            children.props.className,
            styles["horizontal-tabs__tab-body"]
        ),
    });
