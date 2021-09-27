import { Meta, Story } from "@storybook/react";
import {
    MaterialSequence as MaterialSequenceComponent,
    MaterialSequenceElement,
} from "./materialSequence";

const longText =
    "Hey, I am one of paragraphs. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus faucibus volutpat efficitur. Aenean dapibus dolor sit amet urna porttitor, quis blandit dui blandit. Proin porta in tellus nec convallis. Donec et lorem vitae nibh cursus faucibus. Nullam pharetra turpis felis. Ut tincidunt, ligula eget eleifend mollis, augue nibh vehicula neque, quis semper quam ante in ligula. Fusce lacus lorem, euismod id lacinia vitae, suscipit nec purus. Morbi non sodales leo, non consequat turpis. Vestibulum auctor urna sed massa tincidunt feugiat. Hey, I am one of paragraphs. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus faucibus volutpat efficitur. Aenean dapibus dolor sit amet urna porttitor, quis blandit dui blandit. Proin porta in tellus nec convallis. Donec et lorem vitae nibh cursus faucibus. Nullam pharetra turpis felis. Ut tincidunt, ligula eget eleifend mollis, augue nibh vehicula neque, quis semper quam ante in ligula. Fusce lacus lorem, euismod id lacinia vitae, suscipit nec purus. Morbi non sodales leo, nos consequat turpis. Vestibulum auctor urna sed massa tincidunt feugiat.Hey, I am one of paragraphs. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus faucibus volutpat efficitur. Aenean dapibus dolor sit amet urna porttitor, quis blandit dui blandit.Proin porta in tellus nec convallis. Donec et lorem vitae nibh cursus faucibus. Nullam pharetra turpis felis. Ut tincidunt, ligula eget eleifend mollis, augue nibh vehicula neque, quis semper quam ante inligula. Fusce lacus lorem, euismod id lacinia vitae, suscipit nec purus. Morbi non sodales leo, non consequat turpis. Vestibulum auctor urna sed massa tincidunt feugiat.";
const shortText =
    "Hey, I am one of paragraphs. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus faucibus volutpat efficitur. Aenean dapibus dolor sit amet urna porttitor, quis blandit dui blandit. Proin porta in tellus nec convallis. Donec et lorem vitae nibh cursus faucibus. Nullam pharetra turpis felis. Ut tincidunt, ligula eget eleifend mollis, augue nibh vehicula neque, quis semper quam ante in ligula. Fusce lacus lorem, euismod id lacinia vitae, suscipit nec purus. Morbi non sodales leo, non consequat turpis.";

// actual stories
export default {
    title: "components/Material Sequence",
    component: MaterialSequenceComponent,
    argTypes: {
        width: {
            options: ["fixed", "dynamic", "full"],
            control: {
                type: "inline-radio",
            },
            mapping: {
                dynamic: undefined,
                fixed: "400px",
                full: "100%",
            },
        },
        height: {
            options: ["fixed", "dynamic", "full"],
            control: {
                type: "inline-radio",
            },
            mapping: {
                dynamic: undefined,
                fixed: "400px",
                full: "100%",
            },
        },
    },
} as Meta;

export const MaterialSequence: Story<{ width: string; height: string }> = (
    args
) => (
    <MaterialSequenceComponent style={args}>
        <MaterialSequenceElement index={0}>
            <div>{longText}</div>
        </MaterialSequenceElement>
        <MaterialSequenceElement index={1}>
            <div>{shortText}</div>
        </MaterialSequenceElement>
        <MaterialSequenceElement index={2}>
            <div>{longText}</div>
        </MaterialSequenceElement>
    </MaterialSequenceComponent>
);
MaterialSequence.args = {
    width: "fixed",
    height: "fixed",
};
