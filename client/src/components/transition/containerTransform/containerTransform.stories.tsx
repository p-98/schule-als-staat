import { Meta, Story } from "@storybook/react";
import {
    ContainerTransform as ContainerTransformComponent,
    ContainerTransformElement,
} from "./containerTransform";
import styles from "./*containerTransform.module.css";

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
    <ContainerTransformComponent
        activeElement={activeElement}
        style={{
            border: "1px solid red",
        }}
        className={styles["container-transform--story"]}
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
    </ContainerTransformComponent>
);
ContainerTransform.args = {
    activeElement: "blue",
};
