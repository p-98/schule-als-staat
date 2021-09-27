import { useEffect, useState } from "react";

export const PreventSSR: React.FC = ({ children }) => {
    const [renderChildren, setRenderChildren] = useState(false);

    useEffect(() => {
        setRenderChildren(true);
    }, []);

    if (!renderChildren) return null;

    return <>{children}</>;
};
