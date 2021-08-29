import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogButton,
} from "@rmwc/dialog";
import { Meta, Story } from "@storybook/react";
import React from "react";

import "@material/dialog/dist/mdc.dialog.css";
import "@material/button/dist/mdc.button.css";
import "@material/ripple/dist/mdc.ripple.css";

import "./corners.css";

export default {
    title: "Dialog components/__test__/corners",
} as Meta;

const DialogComponent: React.FC = () => (
    <Dialog open>
        <DialogTitle>Dialog Title</DialogTitle>
        <DialogContent>This is a standard dialog.</DialogContent>
        <DialogActions>
            <DialogButton action="close">Cancel</DialogButton>
            <DialogButton action="accept" isDefaultAction>
                Sweet!
            </DialogButton>
        </DialogActions>
    </Dialog>
);

export const DialogTest: Story<{
    smallBorderRadius: number;
    mediumBorderRadius: number;
}> = ({ mediumBorderRadius, smallBorderRadius }) => (
    <div
        style={
            {
                "--medium-component-border-radius": `${mediumBorderRadius}px`,
                "--small-component-border-radius": `${smallBorderRadius}px`,
            } as React.CSSProperties
        }
    >
        <DialogComponent />
    </div>
);
DialogTest.args = {
    smallBorderRadius: 8,
    mediumBorderRadius: 16,
};

interface ModifierProps {
    children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}
const Modifier: React.FC<ModifierProps> = ({
    children: child,
}: ModifierProps) => {
    const style = {
        ...child.props.style,
        backgroundColor: "green",
    };

    return React.cloneElement(child, { ...child.props, style }, ["test2"]);
};

export const Test: React.FC = () => (
    <Modifier>
        <div style={{ color: "pink" }}>Test</div>
    </Modifier>
);
