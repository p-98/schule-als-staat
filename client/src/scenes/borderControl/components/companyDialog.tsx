import { isUndefined } from "lodash/fp";
import { useCallback, useState } from "react";
import {
    Dialog,
    DialogActions,
    DialogButton,
    DialogContent,
    DialogTitle,
    useImperativeDialog,
} from "Components/material/dialog";
import { TextField } from "Components/material/textfield";

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
import { name } from "Utility/data";
import { syncify, syncifyF } from "Utility/misc";
import { useNumberInput } from "Utility/hooks/inputs";

export const BorderControl_CompanyUserFragment = graphql(/* GraphQL */ `
    fragment BorderControl_CompanyUserFragment on CompanyUser {
        id
        ...Name_UserFragment
    }
`);
export const mutation = graphql(/* GraphQL */ `
    mutation Company_CustomsMutation($customs: Float!, $id: String!) {
        chargeCustoms(
            customs: { customs: $customs, user: { type: COMPANY, id: $id } }
        ) {
            id
        }
    }
`);

interface IChargeCompanyProps {
    company: FragmentType<typeof BorderControl_CompanyUserFragment>;
    onCancelled: () => void;
    onSucceeded: () => void;
}
/** Dialog to charge customs on a company.
 *
 * Must be remounted for reuse.
 */
export const ChargeCompany: React.FC<IChargeCompanyProps> = ({
    company: _company,
    onCancelled,
    onSucceeded,
}) => {
    const [impProps, close] = useImperativeDialog();
    const [fetching, setFetching] = useState(false);
    const [customs, customsProps] = useNumberInput(undefined);
    const [invalidCustoms, setInvalidCustoms] = useState<Error>();
    const company = useFragment(BorderControl_CompanyUserFragment, _company);

    const handleCancel = useCallback(async () => {
        await close();
        onCancelled();
    }, [close, onCancelled]);
    const handleConfirm = useCallback(
        async (_customs: number | undefined) => {
            if (_customs === undefined) return;
            if (fetching) return;
            setFetching(true);
            setInvalidCustoms(undefined);

            const result = await client.mutation(mutation, {
                customs: _customs,
                ...company,
            });
            const { data, error } = safeData(result);
            const [_invalidCustoms, _lowBalance] = categorizeError(error, [
                byCode("BAD_USER_INPUT"),
                byCode("BALANCE_TOO_LOW"),
            ]);
            if (_invalidCustoms) setInvalidCustoms(_invalidCustoms);
            if (_lowBalance) setInvalidCustoms(_lowBalance);
            if (!data) return setFetching(false);

            await close();
            onSucceeded();
        },
        [fetching, setFetching, company, setInvalidCustoms, close, onSucceeded]
    );

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Dialog {...impProps} preventOutsideDismiss>
            <DialogTitle>Unternehmen Wareneinfuhr?</DialogTitle>
            <DialogContent layout="card">
                <DisplayInfo label="Name" activated>
                    {name(company)}
                </DisplayInfo>
                <TextField
                    id="charge-company__customs"
                    label="Zollgebühren"
                    type="number"
                    value={customsProps.value}
                    onChange={customsProps.onChange}
                    invalid={!!invalidCustoms}
                    helpText={{
                        validationMsg: true,
                        children: invalidCustoms?.message ?? "",
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
                    disabled={useStable(fetching) || isUndefined(customs)}
                    danger
                />
            </DialogActions>
        </Dialog>
    );
};
