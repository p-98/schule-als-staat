import { useState } from "react";
import cn from "classnames";

// local
import { Fab, fabClassName } from "Components/fab/fab";
import {
    ContainerTransform,
    ContainerTransformElement,
} from "Components/transition/containerTransform/containerTransform";
import { useForceRemount } from "Utility/hooks/forceRemount";
import { EditProduct } from "./editProduct";

import styles from "../products.module.css";

export const AddFab: React.FC = () => {
    const [expanded, setExpanded] = useState(false);
    const [editProductKey, remoundEditProduct] = useForceRemount();

    return (
        <ContainerTransform
            activeElement={expanded ? "form" : "fab"}
            className={cn(
                fabClassName,
                styles["add-fab"],
                expanded && styles["add-fab--expanded"]
            )}
            transitionTime={expanded ? 250 : 200}
        >
            <ContainerTransformElement elementKey="fab">
                <Fab
                    icon="add"
                    className={styles["add-fab__fab"]}
                    onClick={() => {
                        remoundEditProduct();
                        setExpanded(true);
                    }}
                />
            </ContainerTransformElement>
            <ContainerTransformElement elementKey="form">
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
            </ContainerTransformElement>
        </ContainerTransform>
    );
};
