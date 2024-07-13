// local
import { Pos, Pos_ProductFragment } from "Components/pos/pos";
import { DrawerAppBarHandle } from "Components/dynamicAppBar/presets";
import { makeFragmentData } from "Utility/graphql";
// import products from "./warehouse.data";

const _product = {
    __typename: "Product",
    id: "dönerId",
    revision: "1",
    name: "Döner",
    price: 2.0,
} as const;
const product = makeFragmentData(_product, Pos_ProductFragment);
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
