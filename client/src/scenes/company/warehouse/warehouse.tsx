// local
import { useCart } from "Components/pos/util/useCart";
import { Pos } from "Components/pos/pos";
import { DrawerAppBarHandle } from "Components/dynamicAppBar/presets";
import products from "./warehouse.data";

export const Warehouse: React.FC = () => {
    const [cart, cartActions] = useCart();

    return (
        <>
            <DrawerAppBarHandle title="Warenlager" />
            <Pos
                cart={cart}
                cartActions={cartActions}
                products={products}
                proceed={{
                    label: "Bestellen",
                    handler: () => cartActions.clear(),
                    raised: true,
                    danger: true,
                }}
            />
        </>
    );
};
