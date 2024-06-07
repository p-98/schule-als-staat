// local
import { Pos, Pos_ProductFragment } from "Components/pos/pos";
import { DrawerAppBarHandle } from "Components/dynamicAppBar/presets";
import { makeFragmentData } from "Utility/graphql";
// import products from "./warehouse.data";

const product = makeFragmentData(
    { __typename: "Product", id: "productId" },
    Pos_ProductFragment
);
export const Warehouse: React.FC = () => (
    <>
        <DrawerAppBarHandle title="Warenlager" />
        <Pos
            products={[product]}
            action={() => Promise.resolve({ data: [] })}
            onProceeded={() => []}
        />
    </>
);
