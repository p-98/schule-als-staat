import HorizontalTabs from "Components/horizontalTabs/horizontalTabs";

const HorizontalTabsChildTest: React.FC<{ className?: string }> = ({
    className,
}) => (
    <div style={{ display: "block", height: "100%" }} className={className}>
        This is some text adukhfaljkhg fsl hfalkjhgf jhag luh flush dfhsdlfhj
        sjdk
    </div>
);

const HorizontalTabsTest: React.FC = () => (
    <div style={{ width: "100%", height: "90vh", background: "aquamarine" }}>
        <HorizontalTabs
            style={{ height: "100%" }}
            tabs={[
                {
                    title: "Tab 1",
                    component: HorizontalTabsChildTest,
                },
                {
                    title: "Tab 2",
                    component: HorizontalTabsChildTest,
                },
                {
                    title: "Tab 3",
                    component: HorizontalTabsChildTest,
                },
            ]}
        />
    </div>
);
export default HorizontalTabsTest;
