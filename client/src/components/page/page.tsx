import cn from "classnames";
import React, { cloneElement, HTMLAttributes } from "react";

// local
import styles from "./page.module.css";

export interface IPageProps extends React.HTMLAttributes<HTMLDivElement> {
    topAppBar: React.ReactElement<HTMLAttributes<HTMLElement>>;
}
const Page: React.FC<IPageProps> = ({ topAppBar, children, ...restProps }) => (
    <div {...restProps} className={cn(styles["page"], restProps.className)}>
        {/* TopAppBarProp defaults to an empty div */}
        {cloneElement(topAppBar, {
            className: cn(styles["page__header"], topAppBar.props.className),
        })}
        <div className={styles["page__inner"]}>{children}</div>
    </div>
);
export default Page;
