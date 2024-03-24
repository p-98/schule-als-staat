import { ReactNode, useEffect, useState } from "react";

export interface IPreventSSRProps {
    children: ReactNode;
}
export const PreventSSR: React.FC<IPreventSSRProps> = ({ children }) => {
    const [renderChildren, setRenderChildren] = useState(false);

    useEffect(() => {
        setRenderChildren(true);
    }, []);

    if (!renderChildren) return null;

    return <>{children}</>;
};
