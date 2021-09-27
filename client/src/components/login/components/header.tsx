import { Typography } from "@rmwc/typography";

// typography imports
import "@material/typography/dist/mdc.typography.css";

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
