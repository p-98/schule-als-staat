import { useState, type FC } from "react";
import { Button } from "Components/material/button";

import { notify } from "Utility/notifications";
import { syncifyF } from "Utility/misc";
import { useStable } from "Utility/urql";

const notifyActionError = (actionName: string, message: string) =>
    notify({
        icon: "error",
        title: <b>Fehler bei {actionName}</b>,
        body: message,
        dismissesOnAction: true,
        actions: [{ title: "Schließen" }],
    });

const notifyActionSuccess = (actionName: string) =>
    notify({
        icon: "check_circle",
        title: <b>{actionName} erfolgreich</b>,
        dismissesOnAction: true,
        actions: [{ title: "Schließen" }],
    });

export type TAction = () => Promise<{
    data?: true;
    unspecificError?: Error;
}>;

interface IActionButtonProps {
    action: TAction;
    label: string;
    danger?: boolean;
}
export const ActionButton: FC<IActionButtonProps> = ({
    action,
    label,
    danger,
}) => {
    const [fetching, setFetching] = useState(false);

    const handleAction = async () => {
        if (fetching) return;
        setFetching(true);
        const { data, ...errors } = await action();
        if (errors.unspecificError)
            notifyActionError(label, errors.unspecificError.message);
        if (data) notifyActionSuccess(label);
        setFetching(false);
    };

    return (
        <Button
            label={label}
            onClick={syncifyF(handleAction)}
            disabled={useStable(fetching)}
            danger={danger}
        />
    );
};
