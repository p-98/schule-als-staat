import Image from "next/image";
import { useState, useRef } from "react";
import cn from "classnames";
import { Typography } from "Components/material/typography";
import { Icon } from "Components/material/icon";
import { ListDivider } from "Components/material/list";
import { RCTooltip } from "Components/material/rc-tooltip";
import {
    Card,
    CardSubtitle,
    CardHeader,
    CardInner,
    CardActions,
    CardActionButtons,
    CardActionButton,
    CardPrimaryAction,
    CardContent,
} from "Components/material/card";
import { SimpleDialog } from "Components/material/dialog";

// local
import { DisplayInfo } from "Components/displayInfo/displayInfo";
import { currency } from "Utility/data";
import type { TEmployee } from "../employees.data";

import styles from "../employees.module.scss";

const helperText = (
    <>
        Hier wird nur die bereits abgerechnete Arbeitszeit berücksichtigt.
        <br />
        Die Arbeitszeit einer laufenden Schicht ist nicht mit einberechnet.
    </>
);

interface IEmployeeCardProps {
    employee: TEmployee;
}
export const EmployeeCard: React.FC<IEmployeeCardProps> = ({ employee }) => {
    const employeeRef = useRef<HTMLDivElement>(null);

    const [expanded, setExpanded] = useState(false);
    const [showFireDialog, setShowFireDialog] = useState(false);

    return (
        <Card
            className={cn(
                styles["employee"],
                expanded && styles["employee--expanded"]
            )}
            ref={employeeRef}
        >
            <CardInner className={styles["employee__inner"]}>
                <CardPrimaryAction
                    innerProps={{ className: styles["employee__main"] }}
                    onClick={() => setExpanded(!expanded)}
                >
                    <div className={styles["employee__image-container"]}>
                        <Image
                            alt={`employee ${employee.name}`}
                            src={employee.image}
                            fill
                            sizes="100vw"
                            style={{
                                objectFit: "cover",
                            }}
                        />
                    </div>
                    <CardInner>
                        <CardHeader>
                            {employee.name}
                            <CardSubtitle
                                theme={
                                    employee.job.currentlyWorking
                                        ? "primary"
                                        : undefined
                                }
                                className={styles["employee__subtitle"]}
                            >
                                <Icon icon="apartment" />
                                <Typography use="body1">
                                    {employee.job.currentlyWorking
                                        ? "Aktiv seit 13:52 Uhr"
                                        : "Nicht aktiv"}
                                </Typography>
                            </CardSubtitle>
                        </CardHeader>
                    </CardInner>
                    <Icon
                        icon="arrow_drop_down"
                        className={styles["employee__dropdown-arrow"]}
                    />
                </CardPrimaryAction>
                <ListDivider className={styles["employee__divider"]} />
                <CardInner>
                    <CardContent className={styles["employee__extension"]}>
                        <DisplayInfo
                            label="Gearbeitet heute"
                            trailingIcon={
                                <RCTooltip
                                    showArrow
                                    content={
                                        <Typography use="body2">
                                            {helperText}
                                        </Typography>
                                    }
                                >
                                    <Icon icon="help" />
                                </RCTooltip>
                            }
                            style={{ gridArea: "worktime-today" }}
                        >
                            4h
                        </DisplayInfo>
                        <DisplayInfo
                            label="Arbeitszeit"
                            style={{ gridArea: "contract-worktime" }}
                        >
                            5h
                        </DisplayInfo>
                        <DisplayInfo
                            label="Gearbeitet gestern"
                            style={{ gridArea: "worktime-yesterday" }}
                        >
                            5h 23min
                        </DisplayInfo>
                        <DisplayInfo
                            label="Stundenlohn"
                            style={{ gridArea: "contract-salary" }}
                        >
                            {currency(12.42)}
                        </DisplayInfo>
                    </CardContent>
                    <CardActions>
                        <CardActionButtons>
                            <CardActionButton
                                label="kündigen"
                                onClick={() => setShowFireDialog(true)}
                            />
                        </CardActionButtons>
                    </CardActions>
                </CardInner>
            </CardInner>
            <SimpleDialog
                open={showFireDialog}
                title={`${employee.name} kündigen?`}
                content="Diese Aktion kann nicht rückgängig gemacht werden."
                cancel={{
                    label: "Abbrechen",
                    onCancel: () => setShowFireDialog(false),
                }}
                accept={{
                    label: "Bestätigen",
                    onAccept: () => setShowFireDialog(false),
                    danger: true,
                }}
            />
        </Card>
    );
};
