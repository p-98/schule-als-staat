import { ReactNode } from "react";

import styles from "../../vote.module.css";

export interface IChartWrapperProps {
    children: ReactNode;
}
export const ChartWrapper: React.FC<IChartWrapperProps> = ({ children }) => (
    <div className={styles["vote__chart-wrapper"]}>
        <div className={styles["vote__chart-wrapper-inner"]}>{children}</div>
    </div>
);
