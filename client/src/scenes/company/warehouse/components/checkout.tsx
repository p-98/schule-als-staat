// local
import { SimpleDialog } from "Components/dialog/dialog";
import { IProduct } from "Utility/types";
import { CartTable } from "Components/pos/pos";

interface ICheckoutProps {
    open: boolean;
    onCheckout: () => void;
    onGoBack: () => void;
    cart: Record<string, number>;
    products: IProduct[];
}
export const Checkout: React.FC<ICheckoutProps> = ({
    open,
    onCheckout,
    onGoBack,
    cart,
    products,
}) => (
    <SimpleDialog
        open={open}
        accept={{
            onAccepted: onCheckout,
            label: "Bestellen",
            danger: true,
            isDefaultAction: true,
            raised: true,
        }}
        cancel={{
            label: "Abbrechen",
            onCancel: onGoBack,
        }}
        title="Bestellen"
    >
        <CartTable cart={cart} products={products} />
    </SimpleDialog>
);
