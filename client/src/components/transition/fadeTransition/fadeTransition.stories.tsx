import { Meta, Story } from "@storybook/react";
import { FadeTransition as FadeTransitionComponent } from "./fadeTransition";

export default {
    title: "components/transition/Fade Transition",
    args: {
        open: false,
    },
    argTypes: {
        anchor: {
            type: "radio",
            options: [
                "top",
                "top-right",
                "right",
                "bottom-right",
                "bottom",
                "bottom-left",
                "left",
                "top-left",
            ],
        },
    },
} as Meta;

const Template: Story<React.ComponentProps<typeof FadeTransitionComponent>> = ({
    anchor,
    className,
    ...args
}) => (
    <FadeTransitionComponent {...args} anchor={anchor}>
        <div
            style={{
                height: "200px",
                width: "100px",
                display: "block",
                backgroundColor: "blue",
            }}
        />
    </FadeTransitionComponent>
);

export const Default = Template.bind({});
Default.args = {
    anchor: "top-left",
};
Default.decorators = [
    (Story) => (
        <div
            style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                border: "1px solid red",
            }}
        >
            {Story()}
        </div>
    ),
];

export const Fullscreen = Template.bind({});
Fullscreen.args = {
    anchor: "fullscreen",
};
