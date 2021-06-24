import { useEffect, useState } from "react";

const PreventSSR: React.FC = ({ children }) => {
    const [renderChildren, setRenderChildren] = useState(false);

    useEffect(() => {
        setRenderChildren(true);
    }, []);

    if (!renderChildren) return null;

    return <>{children}</>;
};
export default PreventSSR;
