import { Meta, Story } from "@storybook/react";
import { Provider } from "react-redux";

// local
import { store } from "Utility/redux/store";
import {
    FullscreenContainerTransform as FullscreenContainerTransformComponent,
    FullscreenContainerTransformElement,
    FullscreenContainerTransformHandle,
} from "./fullscreenContainerTransform";

import styles from "../*containerTransform.module.css";

export default {
    title: "components/transition/Fullscreen Container Transform",
    argTypes: {
        activeElement: {
            control: {
                type: "boolean",
            },
        },
    },
    decorators: [(Story) => <Provider store={store}>{Story()}</Provider>],
} as Meta;

export const FullscreenContainerTransform: Story<{ open: boolean }> = ({
    open,
}) => (
    <div style={{ width: 600, height: 400 }}>
        <div
            id="portal"
            style={{
                height: "100%",
                width: "100%",
                position: "absolute",
                top: 0,
                left: 0,
            }}
        />
        <div style={{ padding: 100 }}>
            <FullscreenContainerTransformComponent
                renderTo="#portal"
                open={open}
                // style={{ backgroundColor: "red" }}
                // locked to true because it is the only relevant element on the screen
                expectTransformation
                className={styles["container-transform--story"]}
            >
                <FullscreenContainerTransformHandle>
                    <div
                        style={{ background: "blue", width: 100, height: 100 }}
                    />
                </FullscreenContainerTransformHandle>
                <FullscreenContainerTransformElement>
                    <div
                        style={{
                            background: "green",
                        }}
                    />
                </FullscreenContainerTransformElement>
            </FullscreenContainerTransformComponent>
        </div>
    </div>
);
FullscreenContainerTransform.args = {
    open: false,
};
