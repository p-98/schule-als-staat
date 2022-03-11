import { useState } from "react";

// local
import { FabContainerTransform } from "Components/fabContainerTransform/fabContainerTransform";
import { useForceRemount } from "Utility/hooks/forceRemount";
import { EditProduct } from "./editProduct";

import styles from "../products.module.css";

export const AddFab: React.FC = () => {
    const [expanded, setExpanded] = useState(false);
    const [editProductKey, remountEditProduct] = useForceRemount();

    return (
        <FabContainerTransform
            icon="add"
            onExpand={() => {
                setExpanded(true);
                remountEditProduct();
            }}
            onCollapse={() => setExpanded(false)}
            expanded={expanded}
        >
            <div className={styles["add-fab__edit-product"]}>
                <EditProduct
                    key={editProductKey}
                    cancel={{
                        icon: "close",
                        onCancel: () => setExpanded(false),
                        label: "Abbrechen",
                    }}
                    confirm={{
                        label: "Hinzufügen",
                        onConfirm: () => setExpanded(false),
                    }}
                    title="Erstellen"
                />
            </div>
        </FabContainerTransform>
    );
};
