import { Meta, Story } from "@storybook/react";
import {
    SiblingTransitionBase,
    SiblingTransitionBaseElement,
    Modes,
} from "./siblingTransitionBase";

export default {
    title: "components/transition/Sibling Transition Base",
    argTypes: {
        mode: {
            // options: ["xAxis", "yAxis"],
            // mapping: {
            //     xAxis: Modes.xAxis,
            //     yAxis: Modes.yAxis,
            // },
            control: {
                // type: "radio",
                type: "none",
            },
        },
    },
} as Meta;

const template: Story<{ activeElement: number; mode: Modes }> = (args) => (
    <SiblingTransitionBase
        activeElement={args.activeElement}
        mode={args.mode}
        style={{ border: "1px solid red", width: "425px", height: "425px" }}
    >
        <SiblingTransitionBaseElement index={0}>
            <div
                style={{
                    // height: "300px",
                    background:
                        "repeating-linear-gradient(to bottom, blue 0 25px, transparent 25px 50px), repeating-linear-gradient(to right, blue 0 25px, red 25px 50px)",
                }}
            >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Curabitur varius sit amet velit id condimentum. Suspendisse id
                quam sem. Suspendisse dictum pretium convallis. Donec sit amet
                vulputate sapien. Class aptent taciti sociosqu ad litora
                torquent per conubia nostra, per inceptos himenaeos. Morbi et
                placerat sapien. Pellentesque consequat dignissim lorem in
                mattis. Nulla fringilla pharetra turpis ac egestas. Duis
                lobortis volutpat turpis, sit amet hendrerit justo auctor ut.
                Donec vitae dapibus mauris. Nulla pellentesque, nibh eu
                imperdiet ultricies, erat neque ullamcorper eros, quis mattis
                turpis ex ac tellus.
            </div>
        </SiblingTransitionBaseElement>
        <SiblingTransitionBaseElement index={1}>
            <div
                style={{
                    background:
                        "repeating-linear-gradient(to bottom, green 0 25px, transparent 25px 50px), repeating-linear-gradient(to right, green 0 25px, orange 25px 50px)",
                }}
            >
                Aenean non maximus nulla. Morbi vitae nulla blandit, finibus sem
                lacinia, interdum nunc. Donec eget velit vitae augue congue
                porta sit amet quis urna. Nulla commodo, felis elementum
                volutpat accumsan, massa turpis auctor ipsum, sed consequat
                felis nisi eget neque. Integer ut dolor dolor. Curabitur sapien
                enim, condimentum consequat fermentum sit amet, tempor a eros.
                Donec ac orci a mi dapibus placerat. Sed eget quam euismod,
                condimentum urna ut, volutpat nulla.
            </div>
        </SiblingTransitionBaseElement>
        <SiblingTransitionBaseElement index={2}>
            <div
                style={{
                    background:
                        "repeating-linear-gradient(to bottom, yellow 0 25px, transparent 25px 50px), repeating-linear-gradient(to right, yellow 0 25px, purple 25px 50px)",
                }}
            />
        </SiblingTransitionBaseElement>
    </SiblingTransitionBase>
);
template.args = {
    activeElement: 0,
};

export const xAxis = template.bind({});
xAxis.args = {
    ...template.args,
    mode: Modes.xAxis,
};

export const yAxis = template.bind({});
yAxis.args = {
    ...template.args,
    mode: Modes.yAxis,
};

export const zAxis = template.bind({});
zAxis.args = {
    ...template.args,
    mode: Modes.zAxis,
};

export const fadeThrough = template.bind({});
fadeThrough.args = {
    ...template.args,
    mode: Modes.fadeThrough,
};
