import { Meta, Story } from "@storybook/react";
import MaterialSequenceComponent, {
    MaterialSequenceProps,
} from "./materialSequence";

// helper components
const MaterialSequenceChildLong: React.FC<{ className?: string }> = ({
    className,
}) => (
    <div className={className}>
        Hey, I am one of paragraphs. Lorem ipsum dolor sit amet, consectetur
        adipiscing elit. Phasellus faucibus volutpat efficitur. Aenean dapibus
        dolor sit amet urna porttitor, quis blandit dui blandit. Proin porta in
        tellus nec convallis. Donec et lorem vitae nibh cursus faucibus. Nullam
        pharetra turpis felis. Ut tincidunt, ligula eget eleifend mollis, augue
        nibh vehicula neque, quis semper quam ante in ligula. Fusce lacus lorem,
        euismod id lacinia vitae, suscipit nec purus. Morbi non sodales leo, non
        consequat turpis. Vestibulum auctor urna sed massa tincidunt feugiat.
        Hey, I am one of paragraphs. Lorem ipsum dolor sit amet, consectetur
        adipiscing elit. Phasellus faucibus volutpat efficitur. Aenean dapibus
        dolor sit amet urna porttitor, quis blandit dui blandit. Proin porta in
        tellus nec convallis. Donec et lorem vitae nibh cursus faucibus. Nullam
        pharetra turpis felis. Ut tincidunt, ligula eget eleifend mollis, augue
        nibh vehicula neque, quis semper quam ante in ligula. Fusce lacus lorem,
        euismod id lacinia vitae, suscipit nec purus. Morbi non sodales leo, non
        consequat turpis. Vestibulum auctor urna sed massa tincidunt
        feugiat.Hey, I am one of paragraphs. Lorem ipsum dolor sit amet,
        consectetur adipiscing elit. Phasellus faucibus volutpat efficitur.
        Aenean dapibus dolor sit amet urna porttitor, quis blandit dui blandit.
        Proin porta in tellus nec convallis. Donec et lorem vitae nibh cursus
        faucibus. Nullam pharetra turpis felis. Ut tincidunt, ligula eget
        eleifend mollis, augue nibh vehicula neque, quis semper quam ante in
        ligula. Fusce lacus lorem, euismod id lacinia vitae, suscipit nec purus.
        Morbi non sodales leo, non consequat turpis. Vestibulum auctor urna sed
        massa tincidunt feugiat.
    </div>
);
const MaterialSequenceChildShort: React.FC<{ className?: string }> = ({
    className,
}) => (
    <div className={className}>
        Hey, I am one of paragraphs. Lorem ipsum dolor sit amet, consectetur
        adipiscing elit.
    </div>
);

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
    args: {
        children: [
            MaterialSequenceChildLong,
            MaterialSequenceChildShort,
            MaterialSequenceChildLong,
        ],
    },
    decorators: [
        (Story) => (
            <article style={{ width: "400px", height: "600px" }}>
                <Story />
            </article>
        ),
    ],
} as Meta;

export const MaterialSequence: Story<
    MaterialSequenceProps & { width: string; height: string }
> = ({ width, height, ...args }) => {
    args.style = {
        ...args.style,
        width,
        height,
    };
    return <MaterialSequenceComponent {...args} />;
};
MaterialSequence.args = {
    width: "fixed",
    height: "fixed",
};
