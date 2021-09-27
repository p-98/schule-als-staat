import { Meta, Story } from "@storybook/react";
import {
    HorizontalTabs as HorizontalTabsComponent,
    HorizontalTabsElement,
} from "./horizontalTabs";

export default {
    title: "components/Horizontal Tabs",
    component: HorizontalTabsComponent,
} as Meta;

const text =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus faucibus volutpat efficitur. Aenean dapibus dolor sit amet urna porttitor, quis blandit dui blandit. Proin porta in tellus nec convallis. Donec et lorem vitae nibh cursus faucibus. Nullam pharetra turpis felis.";
export const HorizontalTabs: Story<Record<string, never>> = () => (
    <HorizontalTabsComponent style={{ background: "lightgray" }}>
        <HorizontalTabsElement title="Tab 1">
            <div style={{ height: "200px" }}>{text}</div>
        </HorizontalTabsElement>
        <HorizontalTabsElement title="Tab 2">
            <div style={{}}>{text}</div>
        </HorizontalTabsElement>
        <HorizontalTabsElement title="Tab 3">
            <div style={{}}> Short text </div>
        </HorizontalTabsElement>
    </HorizontalTabsComponent>
);
