import styles from "../../vote.module.css";

export const ChartWrapper: React.FC = ({ children }) => (
    <div className={styles["vote__chart-wrapper"]}>
        <div className={styles["vote__chart-wrapper-inner"]}>{children}</div>
    </div>
);
