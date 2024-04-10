import { Typography } from "Components/material/typography";

import styles from "./fallback.module.css";

export const AppFallback: React.FC = () => (
    <div className={styles["app-fallback"]}>
        <Typography use="headline4">Schule als Staat</Typography>
        <Typography use="subtitle1">Lädt...</Typography>
    </div>
);
