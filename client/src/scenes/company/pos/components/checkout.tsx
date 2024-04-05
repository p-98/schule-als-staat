import { useState } from "react";
import { Dialog, SimpleDialog } from "Components/material/dialog";

// local
import { Login } from "Components/login/login";
import { useForceRemount } from "Utility/hooks/forceRemount";
import { IProduct } from "Utility/types";
import { CartTable } from "Components/pos/pos";

import styles from "../pos.module.css";

interface ICheckoutProps {
    open: boolean;
    onCheckout: () => void;
    onGoBack: () => void;
    cart: Record<string, number>;
    products: IProduct[];
    discount?: number;
}
export const Checkout: React.FC<ICheckoutProps> = ({
    open,
    onCheckout,
    onGoBack,
    cart,
    products,
    discount,
}) => {
    const [client, setClient] = useState<string>();
    const [loginKey, remountLogin] = useForceRemount();

    return (
        <>
            <Dialog open={open && !client}>
                <Login
                    title="Anmelden"
                    confirmButton={{ label: "Bestätigen" }}
                    userBanner={{ label: "Weiter als" }}
                    onSuccess={() => setClient("Max Mustermann")}
                    cancelButton={{ label: "Zurück" }}
                    onCancel={onGoBack}
                    className={styles["pos__checkout-login"]}
                    key={loginKey}
                />
            </Dialog>
            <SimpleDialog
                open={open && !!client}
                accept={{
                    onAccepted: onCheckout,
                    label: "Bezahlen",
                    danger: true,
                    isDefaultAction: true,
                    raised: true,
                }}
                cancel={{
                    label: "Abbrechen",
                    onCancel: () => {
                        remountLogin();
                        setClient(undefined);
                    },
                }}
                title="Bezahlen"
            >
                <CartTable
                    cart={cart}
                    products={products}
                    discount={discount}
                />
            </SimpleDialog>
        </>
    );
};
