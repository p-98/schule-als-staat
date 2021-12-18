import { IconButton } from "@rmwc/icon-button";
import { Typography } from "@rmwc/typography";

// icon-button imports
import "@material/icon-button/dist/mdc.icon-button.css";
import "@rmwc/icon/icon.css";
import "@material/ripple/dist/mdc.ripple.css";

// typography imports
import "@material/typography/dist/mdc.typography.css";

// local
import styles from "../orderSummary.module.scss";

interface IDateControlProps {
    dates: string[];
    date: string;
    onChange: (date: string) => void;
}
export const DateControl: React.FC<IDateControlProps> = ({
    dates,
    date,
    onChange,
}) => {
    const currentIndex = dates.indexOf(date);

    return (
        <div className={styles["date-control"]}>
            <IconButton
                icon="chevron_left"
                disabled={date === dates[dates.length - 1]}
                onClick={() => onChange(dates[currentIndex + 1] as string)}
            />
            <Typography theme="textPrimaryOnBackground" use="body2">
                {date}
            </Typography>
            <IconButton
                icon="chevron_right"
                disabled={date === dates[0]}
                onClick={() => onChange(dates[currentIndex - 1] as string)}
            />
        </div>
    );
};
