import { Typography } from "Components/material/typography";

// local
import styles from "../login.module.css";

export interface HeaderProps {
    header: string;
}
export const Header: React.FC<HeaderProps> = ({ header }) => (
    <Typography use="headline6" className={styles["login__card-header"]}>
        {header}
    </Typography>
);
