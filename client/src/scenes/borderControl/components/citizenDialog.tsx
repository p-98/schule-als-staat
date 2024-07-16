import { isUndefined } from "lodash/fp";
import { useCallback, useMemo, useState } from "react";
import {
    Dialog,
    DialogActions,
    DialogButton,
    DialogContent,
    DialogTitle,
    useImperativeDialog,
} from "Components/material/dialog";
import { TextField } from "Components/material/textfield";
import { Theme } from "Components/material/theme";

// local
import { DisplayInfo } from "Components/displayInfo/displayInfo";
import { FragmentType, graphql, useFragment } from "Utility/graphql";
import {
    byCode,
    categorizeError,
    client,
    safeData,
    useStable,
} from "Utility/urql";
import { timeInState, name } from "Utility/data";
import { syncify, syncifyF } from "Utility/misc";
import { useNumberInput } from "Utility/hooks/inputs";

export const BorderControl_CitizenUserFragment = graphql(/* GraphQL */ `
    fragment BorderControl_CitizenUserFragment on CitizenUser {
        id
        isInState
        timeInState
        ...Name_UserFragment
    }
`);
const customsMutation = graphql(/* GraphQL */ `
    mutation Citizen_CustomsMutation($customs: Float!, $id: String!) {
        chargeCustoms(
            customs: { customs: $customs, user: { type: CITIZEN, id: $id } }
        ) {
            id
        }
    }
`);
const crossMutation = graphql(/* GraohQL */ `
    mutation RegisterBorderCrossingMutation($id: ID!) {
        registerBorderCrossing(citizenId: $id) {
            __typename
        }
    }
`);

interface IChargeCitizenProps {
    citizen: FragmentType<typeof BorderControl_CitizenUserFragment>;
    onCancelled: () => void;
    onSucceeded: () => void;
}
/** Dialog to register a citizen crossing the border and optionally charge customs.
 *
 * Must be remounted for reuse.
 */
export const ChargeCitizen: React.FC<IChargeCitizenProps> = ({
    citizen: _citizen,
    onCancelled,
    onSucceeded,
}) => {
    const [impProps, close] = useImperativeDialog();
    const [fetching, setFetching] = useState(false);
    const [customs, customsProps] = useNumberInput(undefined);
    const [invalidCustoms, setInvalidCustoms] = useState<Error>();
    const [crossFailed, setCrossFailed] = useState<Error>();
    const citizen = useFragment(BorderControl_CitizenUserFragment, _citizen);

    const handleCancel = useCallback(async () => {
        await close();
        onCancelled();
    }, [close, onCancelled]);
    const handleConfirm = useCallback(
        async (_customs: number | undefined) => {
            if (fetching) return;
            setFetching(true);
            setInvalidCustoms(undefined);
            setCrossFailed(undefined);

            if (_customs !== undefined) {
                const customsResult = await client.mutation(customsMutation, {
                    customs: _customs,
                    ...citizen,
                });
                const { data: customsData, error: customsError } =
                    safeData(customsResult);
                const [_invalidCustoms, _lowBalance] = categorizeError(
                    customsError,
                    [byCode("BAD_USER_INPUT"), byCode("BALANCE_TOO_LOW")]
                );
                if (_invalidCustoms) setInvalidCustoms(_invalidCustoms);
                if (_lowBalance) setInvalidCustoms(_lowBalance);
                if (!customsData) return setFetching(false);
            }

            const crossResult = await client.mutation(crossMutation, {
                crossMutation,
                ...citizen,
            });
            const { data: crossData, error: crossError } =
                safeData(crossResult);
            categorizeError(crossError, []);
            if (!crossData) {
                setCrossFailed(crossError);
                return setFetching(false);
            }

            await close();
            onSucceeded();
        },
        [
            fetching,
            setFetching,
            setInvalidCustoms,
            setCrossFailed,
            citizen,
            close,
            onSucceeded,
        ]
    );

    const helpMsg = useMemo(() => {
        if (invalidCustoms) return invalidCustoms.message;
        const actionStr = citizen.isInState ? "Verlassen" : "Betreten";
        if (crossFailed)
            return `${actionStr} fehlgeschlagen. Zoll wurde abgebucht (falls angegeben).`;
        return "";
    }, [invalidCustoms, citizen.isInState, crossFailed]);
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Dialog {...impProps} preventOutsideDismiss>
            <DialogTitle>
                Bürger {citizen.isInState ? "verlässt" : "betritt"} den Staat?
            </DialogTitle>
            <DialogContent layout="card">
                <DisplayInfo label="Name" activated>
                    {name(citizen)}
                </DisplayInfo>
                <DisplayInfo label="Anwesenheit heute">
                    {timeInState(citizen.timeInState)}
                </DisplayInfo>
                <TextField
                    id="charge-citizen__customs"
                    label="Zollgebühren"
                    type="number"
                    value={customsProps.value}
                    onChange={customsProps.onChange}
                    invalid={!!invalidCustoms}
                    helpText={{
                        validationMsg: true,
                        persistent: true,
                        // Themee for when crossFailed is set
                        children: <Theme use="error">{helpMsg}</Theme>,
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
                    label="Bestätigen"
                    isDefaultAction
                    onClick={() => syncify(handleConfirm(customs))}
                    disabled={useStable(fetching)}
                    danger={!isUndefined(customs)}
                />
            </DialogActions>
        </Dialog>
    );
};
