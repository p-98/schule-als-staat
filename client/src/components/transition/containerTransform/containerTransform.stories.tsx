import { Meta, Story } from "@storybook/react";
import {
    ContainerTransform as ContainerTransformCompoent,
    ContainerTransformElement,
} from "./containerTransform";

export default {
    title: "components/transition/Container Transform",
    argTypes: {
        activeElement: {
            options: ["blue", "green"],
            control: {
                type: "select",
            },
        },
    },
} as Meta;

export const ContainerTransform: Story<{ activeElement: string }> = ({
    activeElement,
}) => (
    <ContainerTransformCompoent
        activeElement={activeElement}
        style={{
            border: "1px solid red",
        }}
    >
        <ContainerTransformElement elementKey="blue">
            <div
                style={{
                    height: "300px",
                    width: "200px",
                    display: "block",
                    backgroundColor: "blue",
                }}
            />
        </ContainerTransformElement>
        <ContainerTransformElement elementKey="green">
            <div
                style={{
                    height: "400px",
                    width: "300px",
                    display: "block",
                    backgroundColor: "green",
                }}
            />
        </ContainerTransformElement>
    </ContainerTransformCompoent>
);
ContainerTransform.args = {
    activeElement: "blue",
};
