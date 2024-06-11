import { FormEvent, useCallback, useState } from "react";
import { TextField } from "Components/material/textfield";
import {
    Dialog,
    DialogActions,
    DialogButton,
    DialogContent,
    DialogTitle,
    useImperativeDialog,
} from "Components/material/dialog";
import { Typography } from "Components/material/typography";

// local
import { DisplayInfo } from "Components/displayInfo/displayInfo";
import config from "Config";
import { FragmentType, graphql, useFragment } from "Utility/graphql";
import {
    byCode,
    categorizeError,
    client,
    safeData,
    useStable,
} from "Utility/urql";
import { syncify, syncifyF } from "Utility/misc";
import * as format from "Utility/data";

const createGuestMutation = graphql(/* GraphQL */ `
    mutation CreateGuestMutation($name: String, $balance: Float) {
        createGuest(guest: { name: $name, balance: $balance }) {
            id
        }
    }
`);
const assignGuestMutation = graphql(/* GraohQL */ `
    mutation AssignGuestMutation($id: ID!, $guestId: String!) {
        assignCard(id: $id, user: { type: GUEST, id: $guestId }) {
            id
        }
    }
`);

interface ICreateGuestProps {
    cardId: string;
    onCancelled: () => void;
    onSucceeded: () => void;
}
/** Dialog for creating a guest
 *
 * Must be remounted for reuse.
 */
export const CreateGuest: React.FC<ICreateGuestProps> = ({
    cardId,
    onCancelled,
    onSucceeded,
}) => {
    const [fetching, setFetching] = useState(false);
    const [name, setName] = useState("");
    const [balance, setBalance] = useState<number>(config.guestInitialBalance);
    const [invalidBalance, setInvalidBalance] = useState<Error>();
    const [openProps, close] = useImperativeDialog();

    const handleCancel = useCallback(async () => {
        await close();
        onCancelled();
    }, [close, onCancelled]);
    const handleCreate = useCallback(
        async (_name: string, _balance: number) => {
            if (fetching) return;
            setFetching(true);
            setInvalidBalance(undefined);

            const createResult = await client.mutation(createGuestMutation, {
                name: _name === "" ? null : _name,
                balance: _balance,
            });
            const { data: createData, error: createError } =
                safeData(createResult);
            const [_invalidBalance] = categorizeError(createError, [
                byCode("BAD_USER_INPUT"),
            ]);
            if (_invalidBalance) setInvalidBalance(_invalidBalance);
            if (!createData) return setFetching(false);

            const assignResult = await client.mutation(assignGuestMutation, {
                id: cardId,
                guestId: createData.createGuest.id,
            });
            const { data: assignData, error: assignError } =
                safeData(assignResult);
            categorizeError(assignError, []);
            if (!assignData) return setFetching(false);

            await close();
            onSucceeded();
        },
        [fetching, setFetching, cardId, close, onSucceeded]
    );

    return (
        <Dialog
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...openProps}
            preventOutsideDismiss
        >
            <DialogTitle>Gast erstellen</DialogTitle>
            <DialogContent layout="card">
                <TextField
                    id="create-geust__name"
                    label="Name"
                    type="text"
                    value={name}
                    onChange={(e: FormEvent<HTMLInputElement>) => {
                        const _name = e.currentTarget.value;
                        setName(_name);
                    }}
                />
                <TextField
                    id="create-geust__balance"
                    label={`Anfangskontostand in ${config.currencies.virtual.short}`}
                    type="number"
                    value={balance}
                    onChange={(e: FormEvent<HTMLInputElement>) => {
                        const _balance = parseFloat(e.currentTarget.value);
                        if (Number.isNaN(_balance)) return;
                        setBalance(_balance);
                    }}
                    invalid={!!invalidBalance}
                    helpText={{
                        validationMsg: true,
                        children: invalidBalance?.message ?? "",
                    }}
                />
            </DialogContent>
            <DialogActions>
                <DialogButton
                    label="Abbrechen"
                    onClick={syncifyF(handleCancel)}
                    disabled={useStable(fetching)}
                />
                <DialogButton
                    label="Erstellen"
                    isDefaultAction
                    onClick={() => syncify(handleCreate(name, balance))}
                    disabled={useStable(fetching)}
                />
            </DialogActions>
        </Dialog>
    );
};

export const BorderControl_GuestUserFragment = graphql(/* GraphQL */ `
    fragment BorderControl_GuestUserFragment on GuestUser {
        id
        ...Name_UserFragment
        balance
    }
`);
const leaveGuestMutation = graphql(/* GraphQL */ `
    mutation LeaveGuestMutation($id: ID!) {
        leaveGuest(id: $id) {
            id
        }
    }
`);
const unassignGuestMutation = graphql(/* GraphQL */ `
    mutation UnassignGuestMutation($cardId: ID!) {
        unassignCard(id: $cardId) {
            id
        }
    }
`);

interface IRemoveGuestProps {
    cardId: string;
    guest: FragmentType<typeof BorderControl_GuestUserFragment>;
    onCancelled: () => void;
    onSucceeded: () => void;
}
/** Dialog to register a guest leaving and unassign it's card.
 *
 * Must be remounted for reuse.
 */
export const RemoveGuest: React.FC<IRemoveGuestProps> = ({
    cardId,
    guest: _guest,
    onCancelled,
    onSucceeded,
}) => {
    const guest = useFragment(BorderControl_GuestUserFragment, _guest);
    const [fetching, setFetching] = useState(false);
    const [openProps, close] = useImperativeDialog();

    const handleCancel = useCallback(async () => {
        await close();
        onCancelled();
    }, [close, onCancelled]);
    const handleRemove = useCallback(async () => {
        if (fetching) return;
        setFetching(true);

        const leaveResult = await client.mutation(leaveGuestMutation, guest);
        const { data: leaveData, error: leaveError } = safeData(leaveResult);
        categorizeError(leaveError, []);
        if (!leaveData) return setFetching(false);

        const unassignResult = await client.mutation(unassignGuestMutation, {
            cardId,
        });
        const { data: unassignData, error: unassignError } =
            safeData(unassignResult);
        categorizeError(unassignError, []);
        if (!unassignData) return setFetching(false);

        await close();
        onSucceeded();
    }, [fetching, setFetching, guest, cardId, close, onSucceeded]);

    return (
        <Dialog
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...openProps}
            preventOutsideDismiss
        >
            <DialogTitle>Gast verlässt den Staat?</DialogTitle>
            <DialogContent>
                <Typography use="body1">
                    Das Verlassen des Staates wird registriert und der Account
                    wird von der Karte entfernt. Das übrige Guthaben verfällt.
                </Typography>
            </DialogContent>
            <DialogContent layout="card">
                <DisplayInfo label="Name">
                    {format.name(guest, { fallback: "-" })}
                </DisplayInfo>
                <DisplayInfo label="Kontostand">
                    {format.currency(guest.balance)}
                </DisplayInfo>
            </DialogContent>
            <DialogActions>
                <DialogButton
                    label="Abbrechen"
                    onClick={syncifyF(handleCancel)}
                    disabled={useStable(fetching)}
                />
                <DialogButton
                    label="Bestätigen"
                    danger
                    isDefaultAction
                    onClick={syncifyF(handleRemove)}
                    disabled={useStable(fetching)}
                />
            </DialogActions>
        </Dialog>
    );
};
