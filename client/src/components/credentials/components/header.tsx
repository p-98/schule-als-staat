import { Typography } from "Components/material/typography";

// local
import styles from "../login.module.css";

interface HeaderProps {
    header: string;
}
export const Header: React.FC<HeaderProps> = ({ header }) => (
    <Typography use="headline6" className={styles["header"]}>
        {header}
    </Typography>
);
