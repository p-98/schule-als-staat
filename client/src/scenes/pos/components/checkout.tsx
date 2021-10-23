import { Login } from "Components/login/login";
import { Dialog } from "Components/dialog/dialog";

import styles from "../pos.module.css";

interface ICheckoutProps {
    open: boolean;
    onCheckout: () => void;
    onGoBack: () => void;
}
export const Checkout: React.FC<ICheckoutProps> = ({
    open,
    onCheckout,
    onGoBack,
}) => (
    <Dialog open={open}>
        <Login
            header="Bezahlen"
            qrInfoText="QR-Code auf dem Ausweis scannen, um zu bezahlen."
            confirmButton={{ label: "bezahlen", danger: true }}
            userBannerLabel="Zahlung autorisieren von"
            onLogin={onCheckout}
            cancelButton={{ label: "Zurück", handler: onGoBack }}
            className={styles["pos__checkout-login"]}
        />
    </Dialog>
);
