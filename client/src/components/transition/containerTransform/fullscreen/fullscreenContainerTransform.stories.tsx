import { Meta, Story } from "@storybook/react";
import FullscreenContainerTransformComponent, {
    FullscreenContainerTransformElement,
    FullscreenContainerTransformHandle,
} from "./fullscreenContainerTransform";

export default {
    title: "components/transition/Fullscreen Container Transform",
    argTypes: {
        activeElement: {
            control: {
                type: "boolean",
            },
        },
    },
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
                style={{ border: "1px solid red", boxSizing: "border-box" }}
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
                            width: "100%",
                            height: 100,
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
